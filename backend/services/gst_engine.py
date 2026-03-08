"""GST Engine Service - Handles GST classification, tax calculations, and ITC processing"""

import pandas as pd
import numpy as np
from typing import Dict, List, Optional
from datetime import datetime


class GSTEngine:
    """GST classification and calculation engine"""
    
    B2CL_THRESHOLD = 250000
    DEFAULT_SUPPLIER_STATE = "Maharashtra"
    GST_RATES = [0, 0.25, 3, 5, 12, 18, 28]
    
    STATE_CODES = {
        '01': 'Jammu And Kashmir', '02': 'Himachal Pradesh', '03': 'Punjab',
        '04': 'Chandigarh', '05': 'Uttarakhand', '06': 'Haryana',
        '07': 'Delhi', '08': 'Rajasthan', '09': 'Uttar Pradesh',
        '10': 'Bihar', '11': 'Sikkim', '12': 'Arunachal Pradesh',
        '13': 'Nagaland', '14': 'Manipur', '15': 'Mizoram',
        '16': 'Tripura', '17': 'Meghalaya', '18': 'Assam',
        '19': 'West Bengal', '20': 'Jharkhand', '21': 'Odisha',
        '22': 'Chhattisgarh', '23': 'Madhya Pradesh', '24': 'Gujarat',
        '25': 'Daman And Diu', '26': 'Dadra And Nagar Haveli',
        '27': 'Maharashtra', '28': 'Andhra Pradesh', '29': 'Karnataka',
        '30': 'Goa', '31': 'Lakshadweep', '32': 'Kerala',
        '33': 'Tamil Nadu', '34': 'Puducherry',
        '35': 'Andaman And Nicobar Islands', '36': 'Telangana',
        '37': 'Andhra Pradesh', '38': 'Ladakh',
    }
    
    def __init__(self):
        pass
    
    def has_gstin(self, gstin: str) -> bool:
        """Check if customer has valid GSTIN"""
        if pd.isna(gstin) or gstin is None:
            return False
        gstin = str(gstin).strip()
        if gstin == '' or gstin.upper() in ['NAN', 'NONE', 'NULL', 'NA']:
            return False
        return len(gstin) == 15 and gstin.replace(' ', '').isalnum()
    
    def is_interstate(self, supplier_state: str, place_of_supply: str) -> bool:
        """Check if supply is interstate"""
        if not supplier_state or not place_of_supply:
            return False
        supplier_state = str(supplier_state).strip().title()
        place_of_supply = str(place_of_supply).strip().title()
        return supplier_state != place_of_supply
    
    def get_state_from_gstin(self, gstin: str) -> Optional[str]:
        """Extract state name from GSTIN"""
        if not self.has_gstin(gstin):
            return None
        state_code = gstin[:2]
        return self.STATE_CODES.get(state_code)
    
    def classify_invoice(self, row: pd.Series) -> str:
        """Classify a single invoice"""
        # Check for Export/SEZ
        place_of_supply = str(row.get('place_of_supply', '')).strip().upper()
        if place_of_supply in ['EXPORT', 'SEZ', 'FOREIGN']:
            return 'EXPORT'
        
        # Check for B2B (has GSTIN)
        customer_gstin = row.get('customer_gstin', '')
        if self.has_gstin(customer_gstin):
            return 'B2B'
        
        # Check for B2CL (interstate + high value)
        supplier_state = row.get('supplier_state', self.DEFAULT_SUPPLIER_STATE)
        taxable_value = row.get('taxable_value', 0) or 0
        is_interstate_supply = self.is_interstate(supplier_state, place_of_supply)
        
        if is_interstate_supply and taxable_value > self.B2CL_THRESHOLD:
            return 'B2CL'
        
        # Default to B2CS
        return 'B2CS'
    
    def classify_invoices(self, df: pd.DataFrame) -> pd.DataFrame:
        """Classify all invoices in the DataFrame"""
        df['invoice_type'] = df.apply(self.classify_invoice, axis=1)
        return df
    
    def calculate_gst(self, df: pd.DataFrame) -> pd.DataFrame:
        """Calculate GST taxes for all invoices"""
        df['cgst_amount'] = 0.0
        df['sgst_amount'] = 0.0
        df['igst_amount'] = 0.0
        df['total_tax'] = 0.0
        df['total_amount'] = 0.0
        
        for idx, row in df.iterrows():
            taxable_value = float(row.get('taxable_value', 0) or 0)
            tax_rate = float(row.get('tax_rate', 0) or 0)
            supplier_state = row.get('supplier_state', self.DEFAULT_SUPPLIER_STATE)
            place_of_supply = row.get('place_of_supply', '')
            invoice_type = row.get('invoice_type', 'B2CS')
            
            # Handle export invoices
            if invoice_type == 'EXPORT':
                df.at[idx, 'cgst_amount'] = 0.0
                df.at[idx, 'sgst_amount'] = 0.0
                df.at[idx, 'igst_amount'] = 0.0
                df.at[idx, 'total_tax'] = 0.0
                df.at[idx, 'total_amount'] = round(taxable_value, 2)
                continue
            
            tax_amount = taxable_value * (tax_rate / 100)
            is_interstate_supply = self.is_interstate(supplier_state, place_of_supply)
            
            if is_interstate_supply:
                df.at[idx, 'igst_amount'] = round(tax_amount, 2)
            else:
                half_tax = tax_amount / 2
                df.at[idx, 'cgst_amount'] = round(half_tax, 2)
                df.at[idx, 'sgst_amount'] = round(half_tax, 2)
            
            df.at[idx, 'total_tax'] = round(tax_amount, 2)
            df.at[idx, 'total_amount'] = round(taxable_value + tax_amount, 2)
        
        return df
    
    def calculate_itc(self, df: pd.DataFrame) -> pd.DataFrame:
        """Calculate Input Tax Credit for purchase invoices"""
        df['itc_cgst'] = 0.0
        df['itc_sgst'] = 0.0
        df['itc_igst'] = 0.0
        df['total_itc'] = 0.0
        
        for idx, row in df.iterrows():
            supplier_gstin = row.get('supplier_gstin', '')
            if not self.has_gstin(supplier_gstin):
                continue
            
            taxable_value = float(row.get('taxable_value', 0) or 0)
            tax_rate = float(row.get('tax_rate', 0) or 0)
            recipient_state = row.get('recipient_state', self.DEFAULT_SUPPLIER_STATE)
            supplier_state = row.get('supplier_state', '')
            
            tax_amount = taxable_value * (tax_rate / 100)
            is_interstate = self.is_interstate(supplier_state, recipient_state)
            
            if is_interstate:
                df.at[idx, 'itc_igst'] = round(tax_amount, 2)
            else:
                half_tax = tax_amount / 2
                df.at[idx, 'itc_cgst'] = round(half_tax, 2)
                df.at[idx, 'itc_sgst'] = round(half_tax, 2)
            
            df.at[idx, 'total_itc'] = round(tax_amount, 2)
        
        return df
    
    def generate_summary(self, df: pd.DataFrame) -> Dict:
        """Generate GST summary statistics"""
        total_invoices = len(df)
        total_taxable_value = float(df['taxable_value'].sum())
        total_cgst = float(df['cgst_amount'].sum())
        total_sgst = float(df['sgst_amount'].sum())
        total_igst = float(df['igst_amount'].sum())
        total_tax = float(df['total_tax'].sum())
        total_amount = float(df['total_amount'].sum())
        
        # Summary by invoice type
        type_summary = df.groupby('invoice_type').agg({
            'invoice_number': 'count',
            'taxable_value': 'sum',
            'cgst_amount': 'sum',
            'sgst_amount': 'sum',
            'igst_amount': 'sum',
            'total_tax': 'sum',
            'total_amount': 'sum'
        }).reset_index()
        
        type_summary_dict = {}
        for _, row in type_summary.iterrows():
            inv_type = row['invoice_type']
            type_summary_dict[inv_type] = {
                'invoice_count': int(row['invoice_number']),
                'taxable_value': round(float(row['taxable_value']), 2),
                'cgst': round(float(row['cgst_amount']), 2),
                'sgst': round(float(row['sgst_amount']), 2),
                'igst': round(float(row['igst_amount']), 2),
                'total_tax': round(float(row['total_tax']), 2),
                'total_amount': round(float(row['total_amount']), 2)
            }
        
        # HSN Summary
        hsn_summary_list = []
        if 'hsn_code' in df.columns:
            hsn_summary = df.groupby('hsn_code').agg({
                'taxable_value': 'sum',
                'total_tax': 'sum',
                'quantity': 'sum',
                'total_amount': 'sum'
            }).reset_index()
            
            for _, row in hsn_summary.iterrows():
                hsn_summary_list.append({
                    'hsn_code': str(row['hsn_code']),
                    'taxable_value': round(float(row['taxable_value']), 2),
                    'total_tax': round(float(row['total_tax']), 2),
                    'quantity': float(row['quantity']),
                    'total_amount': round(float(row['total_amount']), 2)
                })
        
        # State-wise summary
        state_summary_list = []
        if 'place_of_supply' in df.columns:
            state_summary = df.groupby('place_of_supply').agg({
                'invoice_number': 'count',
                'taxable_value': 'sum',
                'total_tax': 'sum',
                'total_amount': 'sum'
            }).reset_index()
            
            for _, row in state_summary.iterrows():
                state_summary_list.append({
                    'place_of_supply': str(row['place_of_supply']),
                    'invoice_count': int(row['invoice_number']),
                    'taxable_value': round(float(row['taxable_value']), 2),
                    'total_tax': round(float(row['total_tax']), 2),
                    'total_amount': round(float(row['total_amount']), 2)
                })
        
        # Monthly summary
        monthly_summary = []
        if 'invoice_date' in df.columns:
            df['month'] = pd.to_datetime(df['invoice_date']).dt.to_period('M')
            monthly = df.groupby('month').agg({
                'invoice_number': 'count',
                'taxable_value': 'sum',
                'total_tax': 'sum',
                'total_amount': 'sum'
            }).reset_index()
            
            for _, row in monthly.iterrows():
                monthly_summary.append({
                    'month': str(row['month']),
                    'invoice_count': int(row['invoice_number']),
                    'taxable_value': round(float(row['taxable_value']), 2),
                    'total_tax': round(float(row['total_tax']), 2),
                    'total_amount': round(float(row['total_amount']), 2)
                })
        
        return {
            'overall': {
                'total_invoices': total_invoices,
                'total_taxable_value': round(total_taxable_value, 2),
                'total_cgst': round(total_cgst, 2),
                'total_sgst': round(total_sgst, 2),
                'total_igst': round(total_igst, 2),
                'total_tax': round(total_tax, 2),
                'total_amount': round(total_amount, 2)
            },
            'by_type': type_summary_dict,
            'hsn_summary': hsn_summary_list,
            'state_summary': state_summary_list,
            'monthly_summary': monthly_summary
        }
    
    def generate_itc_summary(self, df: pd.DataFrame) -> Dict:
        """Generate ITC summary for purchase data"""
        total_invoices = len(df)
        total_taxable_value = float(df['taxable_value'].sum())
        total_itc_cgst = float(df['itc_cgst'].sum())
        total_itc_sgst = float(df['itc_sgst'].sum())
        total_itc_igst = float(df['itc_igst'].sum())
        total_itc = float(df['total_itc'].sum())
        
        # Supplier-wise summary
        supplier_summary = []
        if 'supplier_gstin' in df.columns:
            supp_summary = df.groupby('supplier_gstin').agg({
                'invoice_number': 'count',
                'taxable_value': 'sum',
                'total_itc': 'sum'
            }).reset_index()
            
            for _, row in supp_summary.iterrows():
                supplier_summary.append({
                    'supplier_gstin': str(row['supplier_gstin']),
                    'invoice_count': int(row['invoice_number']),
                    'taxable_value': round(float(row['taxable_value']), 2),
                    'itc_amount': round(float(row['total_itc']), 2)
                })
        
        return {
            'overall': {
                'total_invoices': total_invoices,
                'total_taxable_value': round(total_taxable_value, 2),
                'total_itc_cgst': round(total_itc_cgst, 2),
                'total_itc_sgst': round(total_itc_sgst, 2),
                'total_itc_igst': round(total_itc_igst, 2),
                'total_itc': round(total_itc, 2)
            },
            'supplier_summary': supplier_summary
        }
    
    def calculate_net_gst_payable(self, sales_summary: Dict, purchase_summary: Dict) -> Dict:
        """Calculate net GST payable after ITC"""
        output_tax = sales_summary['overall']['total_tax']
        itc_available = purchase_summary['overall']['total_itc']
        net_payable = output_tax - itc_available
        
        return {
            'output_tax': round(output_tax, 2),
            'itc_available': round(itc_available, 2),
            'net_gst_payable': round(max(0, net_payable), 2),
            'itc_carry_forward': round(max(0, -net_payable), 2)
        }

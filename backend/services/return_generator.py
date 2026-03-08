"""Return Generator Service - Generates all types of GST return files"""

import pandas as pd
import json
from typing import Dict, List, Optional
from pathlib import Path
from datetime import datetime


class ReturnGenerator:
    """Generate GST return files in multiple formats"""
    
    def __init__(self):
        pass
    
    # ==================== GSTR-1 Generation ====================
    
    def generate_b2b_sheet(self, df: pd.DataFrame) -> pd.DataFrame:
        """Generate B2B (Business to Business) sheet"""
        b2b_df = df[df['invoice_type'] == 'B2B'].copy()
        if len(b2b_df) == 0:
            return pd.DataFrame()
        
        b2b_sheet = pd.DataFrame()
        b2b_sheet['GSTIN of Recipient'] = b2b_df['customer_gstin']
        b2b_sheet['Invoice Number'] = b2b_df['invoice_number']
        b2b_sheet['Invoice Date'] = pd.to_datetime(b2b_df['invoice_date']).dt.strftime('%d-%m-%Y')
        b2b_sheet['Invoice Value'] = b2b_df['total_amount']
        b2b_sheet['Place of Supply'] = b2b_df['place_of_supply']
        b2b_sheet['Reverse Charge'] = 'N'
        b2b_sheet['Invoice Type'] = 'Regular'
        b2b_sheet['E-Commerce GSTIN'] = ''
        b2b_sheet['Rate'] = b2b_df['tax_rate']
        b2b_sheet['Taxable Value'] = b2b_df['taxable_value']
        b2b_sheet['Cess Amount'] = 0
        return b2b_sheet
    
    def generate_b2cl_sheet(self, df: pd.DataFrame) -> pd.DataFrame:
        """Generate B2CL (Business to Consumer Large) sheet"""
        b2cl_df = df[df['invoice_type'] == 'B2CL'].copy()
        if len(b2cl_df) == 0:
            return pd.DataFrame()
        
        b2cl_sheet = pd.DataFrame()
        b2cl_sheet['Invoice Number'] = b2cl_df['invoice_number']
        b2cl_sheet['Invoice Date'] = pd.to_datetime(b2cl_df['invoice_date']).dt.strftime('%d-%m-%Y')
        b2cl_sheet['Invoice Value'] = b2cl_df['total_amount']
        b2cl_sheet['Place of Supply'] = b2cl_df['place_of_supply']
        b2cl_sheet['Rate'] = b2cl_df['tax_rate']
        b2cl_sheet['Taxable Value'] = b2cl_df['taxable_value']
        b2cl_sheet['Cess Amount'] = 0
        b2cl_sheet['E-Commerce GSTIN'] = ''
        return b2cl_sheet
    
    def generate_b2cs_sheet(self, df: pd.DataFrame) -> pd.DataFrame:
        """Generate B2CS (Business to Consumer Small) sheet"""
        b2cs_df = df[df['invoice_type'] == 'B2CS'].copy()
        if len(b2cs_df) == 0:
            return pd.DataFrame()
        
        b2cs_grouped = b2cs_df.groupby(['place_of_supply', 'tax_rate']).agg({
            'taxable_value': 'sum'
        }).reset_index()
        
        b2cs_sheet = pd.DataFrame()
        b2cs_sheet['Type'] = 'OE'
        b2cs_sheet['Place of Supply'] = b2cs_grouped['place_of_supply']
        b2cs_sheet['Rate'] = b2cs_grouped['tax_rate']
        b2cs_sheet['Taxable Value'] = b2cs_grouped['taxable_value']
        b2cs_sheet['Cess Amount'] = 0
        b2cs_sheet['E-Commerce GSTIN'] = ''
        return b2cs_sheet
    
    def generate_export_sheet(self, df: pd.DataFrame) -> pd.DataFrame:
        """Generate Export sheet"""
        export_df = df[df['invoice_type'] == 'EXPORT'].copy()
        if len(export_df) == 0:
            return pd.DataFrame()
        
        export_sheet = pd.DataFrame()
        export_sheet['Export Type'] = 'WPAY'
        export_sheet['Invoice Number'] = export_df['invoice_number']
        export_sheet['Invoice Date'] = pd.to_datetime(export_df['invoice_date']).dt.strftime('%d-%m-%Y')
        export_sheet['Invoice Value'] = export_df['total_amount']
        export_sheet['Port Code'] = ''
        export_sheet['Shipping Bill Number'] = ''
        export_sheet['Shipping Bill Date'] = ''
        export_sheet['Rate'] = export_df['tax_rate']
        export_sheet['Taxable Value'] = export_df['taxable_value']
        return export_sheet
    
    def generate_hsn_sheet(self, df: pd.DataFrame) -> pd.DataFrame:
        """Generate HSN Summary sheet"""
        if 'hsn_code' not in df.columns:
            return pd.DataFrame()
        
        hsn_grouped = df.groupby('hsn_code').agg({
            'quantity': 'sum',
            'total_amount': 'sum',
            'taxable_value': 'sum',
            'igst_amount': 'sum',
            'cgst_amount': 'sum',
            'sgst_amount': 'sum'
        }).reset_index()
        
        hsn_sheet = pd.DataFrame()
        hsn_sheet['HSN'] = hsn_grouped['hsn_code']
        hsn_sheet['Description'] = ''
        hsn_sheet['UQC'] = 'PCS'
        hsn_sheet['Total Quantity'] = hsn_grouped['quantity']
        hsn_sheet['Total Value'] = hsn_grouped['total_amount']
        hsn_sheet['Taxable Value'] = hsn_grouped['taxable_value']
        hsn_sheet['Integrated Tax Amount'] = hsn_grouped['igst_amount']
        hsn_sheet['Central Tax Amount'] = hsn_grouped['cgst_amount']
        hsn_sheet['State/UT Tax Amount'] = hsn_grouped['sgst_amount']
        hsn_sheet['Cess Amount'] = 0
        return hsn_sheet
    
    def generate_gstr1(self, df: pd.DataFrame, output_path: str) -> str:
        """Generate complete GSTR-1 Excel file"""
        output_path = Path(output_path)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        with pd.ExcelWriter(output_path, engine='openpyxl') as writer:
            # B2B sheet
            b2b_sheet = self.generate_b2b_sheet(df)
            if len(b2b_sheet) > 0:
                b2b_sheet.to_excel(writer, sheet_name='B2B', index=False)
            else:
                pd.DataFrame({'Message': ['No B2B invoices found']}).to_excel(
                    writer, sheet_name='B2B', index=False
                )
            
            # B2CL sheet
            b2cl_sheet = self.generate_b2cl_sheet(df)
            if len(b2cl_sheet) > 0:
                b2cl_sheet.to_excel(writer, sheet_name='B2CL', index=False)
            else:
                pd.DataFrame({'Message': ['No B2CL invoices found']}).to_excel(
                    writer, sheet_name='B2CL', index=False
                )
            
            # B2CS sheet
            b2cs_sheet = self.generate_b2cs_sheet(df)
            if len(b2cs_sheet) > 0:
                b2cs_sheet.to_excel(writer, sheet_name='B2CS', index=False)
            else:
                pd.DataFrame({'Message': ['No B2CS invoices found']}).to_excel(
                    writer, sheet_name='B2CS', index=False
                )
            
            # Export sheet
            export_sheet = self.generate_export_sheet(df)
            if len(export_sheet) > 0:
                export_sheet.to_excel(writer, sheet_name='EXP', index=False)
            else:
                pd.DataFrame({'Message': ['No export invoices found']}).to_excel(
                    writer, sheet_name='EXP', index=False
                )
            
            # HSN Summary
            hsn_sheet = self.generate_hsn_sheet(df)
            if len(hsn_sheet) > 0:
                hsn_sheet.to_excel(writer, sheet_name='HSN Summary', index=False)
            else:
                pd.DataFrame({'Message': ['No HSN data found']}).to_excel(
                    writer, sheet_name='HSN Summary', index=False
                )
            
            # Summary sheet
            summary_data = {
                'Sheet': ['B2B', 'B2CL', 'B2CS', 'EXP', 'HSN Summary'],
                'Description': [
                    'Business to Business invoices',
                    'Business to Consumer Large (Interstate > 2.5L)',
                    'Business to Consumer Small',
                    'Export invoices',
                    'HSN Wise Summary'
                ],
                'Record Count': [
                    len(b2b_sheet) if len(b2b_sheet) > 0 else 0,
                    len(b2cl_sheet) if len(b2cl_sheet) > 0 else 0,
                    len(b2cs_sheet) if len(b2cs_sheet) > 0 else 0,
                    len(export_sheet) if len(export_sheet) > 0 else 0,
                    len(hsn_sheet) if len(hsn_sheet) > 0 else 0
                ]
            }
            summary_df = pd.DataFrame(summary_data)
            summary_df.to_excel(writer, sheet_name='Summary', index=False)
        
        return str(output_path)
    
    # ==================== GSTR-3B Generation ====================
    
    def generate_gstr3b(self, sales_df: pd.DataFrame, purchase_df: pd.DataFrame, output_path: str) -> str:
        """Generate GSTR-3B return file"""
        output_path = Path(output_path)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        outward_supplies = self._calculate_outward_supplies(sales_df)
        inter_state_supplies = self._calculate_inter_state_supplies(sales_df)
        eligible_itc = self._calculate_eligible_itc(purchase_df)
        
        with pd.ExcelWriter(output_path, engine='openpyxl') as writer:
            # 3.1 Outward supplies
            outward_df = pd.DataFrame(outward_supplies)
            outward_df.to_excel(writer, sheet_name='3.1 Outward Supplies', index=False)
            
            # 3.2 Inter-state supplies
            inter_state_df = pd.DataFrame(inter_state_supplies)
            inter_state_df.to_excel(writer, sheet_name='3.2 Inter-State', index=False)
            
            # 4 Eligible ITC
            itc_df = pd.DataFrame(eligible_itc)
            itc_df.to_excel(writer, sheet_name='4 Eligible ITC', index=False)
        
        return str(output_path)
    
    def _calculate_outward_supplies(self, df: pd.DataFrame) -> Dict:
        """Calculate outward supplies for GSTR-3B 3.1"""
        taxable = df[df['invoice_type'].isin(['B2B', 'B2CL', 'B2CS'])]
        zero_rated = df[df['invoice_type'] == 'EXPORT']
        nil_rated = df[df['tax_rate'] == 0]
        
        return {
            'Nature of Supplies': [
                'a) Outward taxable supplies (other than zero rated, nil rated and exempted)',
                'b) Outward taxable supplies (zero rated)',
                'c) Other outward supplies (nil rated, exempted)',
                'd) Inward supplies (liable to reverse charge)',
                'e) Non-GST outward supplies'
            ],
            'Total Taxable Value': [
                round(taxable['taxable_value'].sum(), 2),
                round(zero_rated['taxable_value'].sum(), 2),
                round(nil_rated['taxable_value'].sum(), 2),
                0,
                0
            ],
            'Integrated Tax': [
                round(taxable['igst_amount'].sum(), 2),
                round(zero_rated['igst_amount'].sum(), 2),
                0, 0, 0
            ],
            'Central Tax': [
                round(taxable['cgst_amount'].sum(), 2),
                0, 0, 0, 0
            ],
            'State/UT Tax': [
                round(taxable['sgst_amount'].sum(), 2),
                0, 0, 0, 0
            ],
            'Cess': [0, 0, 0, 0, 0]
        }
    
    def _calculate_inter_state_supplies(self, df: pd.DataFrame) -> Dict:
        """Calculate inter-state supplies for GSTR-3B 3.2"""
        unregistered = df[df['invoice_type'] == 'B2CS']
        
        return {
            'Description': [
                'Supplies made to unregistered persons',
                'Supplies made to composition taxable persons',
                'Supplies made to UIN holders'
            ],
            'Place of Supply (State/UT)': ['All States', 'N/A', 'N/A'],
            'Total Taxable Value': [
                round(unregistered['taxable_value'].sum(), 2),
                0, 0
            ],
            'Amount of Integrated Tax': [
                round(unregistered['igst_amount'].sum(), 2),
                0, 0
            ]
        }
    
    def _calculate_eligible_itc(self, df: pd.DataFrame) -> Dict:
        """Calculate eligible ITC for GSTR-3B 4"""
        if len(df) == 0:
            return {
                'Description': ['(A) ITC Available', '(B) ITC Reversed', '(C) Net ITC Available', '(D) Ineligible ITC'],
                'Integrated Tax': [0, 0, 0, 0],
                'Central Tax': [0, 0, 0, 0],
                'State/UT Tax': [0, 0, 0, 0],
                'Cess': [0, 0, 0, 0]
            }
        
        itc_cgst = df['itc_cgst'].sum() if 'itc_cgst' in df.columns else 0
        itc_sgst = df['itc_sgst'].sum() if 'itc_sgst' in df.columns else 0
        itc_igst = df['itc_igst'].sum() if 'itc_igst' in df.columns else 0
        
        return {
            'Description': [
                '(A) ITC Available (from 3.1)',
                '(B) ITC Reversed',
                '(C) Net ITC Available (A-B)',
                '(D) Ineligible ITC'
            ],
            'Integrated Tax': [
                round(itc_igst, 2), 0, round(itc_igst, 2), 0
            ],
            'Central Tax': [
                round(itc_cgst, 2), 0, round(itc_cgst, 2), 0
            ],
            'State/UT Tax': [
                round(itc_sgst, 2), 0, round(itc_sgst, 2), 0
            ],
            'Cess': [0, 0, 0, 0]
        }
    
    # ==================== Other Return Types ====================
    
    def generate_gstr4(self, df: pd.DataFrame, output_path: str) -> str:
        """Generate GSTR-4 (Composition Dealer Return)"""
        output_path = Path(output_path)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        summary = {
            'Description': [
                'Total Taxable Turnover',
                'Tax Payable (at composition rate)',
                'Tax Paid'
            ],
            'Value': [
                round(df['taxable_value'].sum(), 2),
                round(df['taxable_value'].sum() * 0.01, 2),
                0
            ]
        }
        
        with pd.ExcelWriter(output_path, engine='openpyxl') as writer:
            pd.DataFrame(summary).to_excel(writer, sheet_name='GSTR-4 Summary', index=False)
        
        return str(output_path)
    
    def generate_gstr9(self, sales_df: pd.DataFrame, purchase_df: pd.DataFrame, output_path: str) -> str:
        """Generate GSTR-9 (Annual Return)"""
        output_path = Path(output_path)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        annual_return = {
            'Section': [
                '4 - Outward Supplies',
                '5 - Inward Supplies',
                '6 - Input Tax Credit',
                '7 - Tax Paid',
                '8 - Transactions with Composition Dealers'
            ],
            'Description': [
                'Total outward supplies including exempt, nil-rated, and non-GST',
                'Total inward supplies including exempt, nil-rated, and non-GST',
                'Total ITC availed',
                'Total tax paid',
                'Supplies to/from composition dealers'
            ],
            'Taxable Value': [
                round(sales_df['taxable_value'].sum(), 2) if len(sales_df) > 0 else 0,
                round(purchase_df['taxable_value'].sum(), 2) if len(purchase_df) > 0 else 0,
                0, 0, 0
            ],
            'Tax Amount': [
                round(sales_df['total_tax'].sum(), 2) if len(sales_df) > 0 else 0,
                0,
                round(purchase_df['total_itc'].sum(), 2) if len(purchase_df) > 0 else 0,
                round(sales_df['total_tax'].sum(), 2) if len(sales_df) > 0 else 0,
                0
            ]
        }
        
        with pd.ExcelWriter(output_path, engine='openpyxl') as writer:
            pd.DataFrame(annual_return).to_excel(writer, sheet_name='GSTR-9 Summary', index=False)
        
        return str(output_path)
    
    def generate_csv(self, df: pd.DataFrame, output_path: str) -> str:
        """Generate CSV format return"""
        output_path = Path(output_path)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        csv_columns = [
            'invoice_number', 'invoice_date', 'customer_gstin',
            'place_of_supply', 'hsn_code', 'tax_rate', 'taxable_value',
            'cgst_amount', 'sgst_amount', 'igst_amount', 'total_tax',
            'total_amount', 'invoice_type'
        ]
        
        existing_columns = [col for col in csv_columns if col in df.columns]
        csv_df = df[existing_columns].copy()
        
        if 'invoice_date' in csv_df.columns:
            csv_df['invoice_date'] = pd.to_datetime(csv_df['invoice_date']).dt.strftime('%d-%m-%Y')
        
        csv_df.to_csv(output_path, index=False)
        return str(output_path)
    
    def generate_json(self, df: pd.DataFrame, output_path: str) -> str:
        """Generate JSON format return"""
        output_path = Path(output_path)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        records = df.to_dict(orient='records')
        
        for record in records:
            if 'invoice_date' in record and record['invoice_date'] is not None:
                if hasattr(record['invoice_date'], 'strftime'):
                    record['invoice_date'] = record['invoice_date'].strftime('%d-%m-%Y')
        
        json_data = {
            'return_type': 'GSTR-1',
            'generated_at': datetime.now().isoformat(),
            'total_records': len(records),
            'invoices': records
        }
        
        with open(output_path, 'w') as f:
            json.dump(json_data, f, indent=2, default=str)
        
        return str(output_path)

"""Shopify Adapter - Converts Shopify order reports to GST format"""

import pandas as pd
from .base_adapter import BaseAdapter


class ShopifyAdapter(BaseAdapter):
    """Adapter for Shopify order reports"""
    
    PLATFORM_NAME = "shopify"
    
    COLUMN_MAPPINGS = {
        'order_id': 'invoice_number',
        'order_name': 'invoice_number',
        'name': 'invoice_number',
        'order_number': 'invoice_number',
        'invoice_number': 'invoice_number',
        'invoice_no': 'invoice_number',
        'id': 'order_id',
        'created_at': 'invoice_date',
        'order_date': 'invoice_date',
        'processed_at': 'invoice_date',
        'date': 'invoice_date',
        'invoice_date': 'invoice_date',
        'customer_gstin': 'customer_gstin',
        'buyer_gstin': 'customer_gstin',
        'gstin': 'customer_gstin',
        'note_attributes_gstin': 'customer_gstin',
        'shipping_province': 'place_of_supply',
        'shipping_state': 'place_of_supply',
        'ship_to_state': 'place_of_supply',
        'state': 'place_of_supply',
        'place_of_supply': 'place_of_supply',
        'buyer_state': 'place_of_supply',
        'customer_state': 'place_of_supply',
        'province': 'place_of_supply',
        'hsn_code': 'hsn_code',
        'hsn': 'hsn_code',
        'lineitem_hsn': 'hsn_code',
        'variant_hsn': 'hsn_code',
        'tax_rate': 'tax_rate',
        'gst_rate': 'tax_rate',
        'tax_percentage': 'tax_rate',
        'gst_percentage': 'tax_rate',
        'lineitem_tax_rate': 'tax_rate',
        'taxable_value': 'taxable_value',
        'lineitem_price': 'taxable_value',
        'price': 'taxable_value',
        'item_price': 'taxable_value',
        'lineitem_subtotal': 'taxable_value',
        'quantity': 'quantity',
        'qty': 'quantity',
        'lineitem_quantity': 'quantity',
        'lineitem_qty': 'quantity',
        'seller_state': 'supplier_state',
        'supplier_state': 'supplier_state',
        'from_state': 'supplier_state',
        'shop_state': 'supplier_state',
        'sku': 'sku',
        'lineitem_sku': 'sku',
        'variant_sku': 'sku',
        'product_name': 'product_name',
        'lineitem_name': 'product_name',
        'title': 'product_name',
        'customer_name': 'customer_name',
        'shipping_name': 'customer_name',
        'billing_name': 'customer_name',
        'shipping_city': 'customer_city',
        'cgst_amount': 'cgst',
        'sgst_amount': 'sgst',
        'igst_amount': 'igst',
        'cgst': 'cgst',
        'sgst': 'sgst',
        'igst': 'igst',
        'total_tax': 'total_tax',
        'total_amount': 'total_amount',
        'invoice_amount': 'total_amount',
        'total_price': 'total_amount',
        'subtotal': 'total_amount',
    }
    
    def get_column_mappings(self) -> dict:
        return self.COLUMN_MAPPINGS
    
    def transform(self, df):
        df = super().transform(df)
        # Shopify uses province names that might need mapping to Indian states
        if 'place_of_supply' in df.columns:
            df['place_of_supply'] = df['place_of_supply'].apply(self._normalize_state_name)
        # Calculate taxable value from line item price
        if 'taxable_value' not in df.columns or df['taxable_value'].isna().all():
            if 'lineitem_price' in df.columns and 'quantity' in df.columns:
                df['taxable_value'] = df['lineitem_price'] * df['quantity']
        return df
    
    def _normalize_state_name(self, state: str) -> str:
        """Normalize Shopify province names to Indian state names"""
        if pd.isna(state):
            return 'Unknown'
        
        state = str(state).strip().title()
        state_mapping = {
            'Maharashtra': 'Maharashtra', 'Karnataka': 'Karnataka',
            'Tamil Nadu': 'Tamil Nadu', 'Telangana': 'Telangana',
            'Andhra Pradesh': 'Andhra Pradesh', 'Kerala': 'Kerala',
            'Gujarat': 'Gujarat', 'Rajasthan': 'Rajasthan',
            'Punjab': 'Punjab', 'Haryana': 'Haryana',
            'Delhi': 'Delhi', 'Uttar Pradesh': 'Uttar Pradesh',
            'Madhya Pradesh': 'Madhya Pradesh', 'Bihar': 'Bihar',
            'West Bengal': 'West Bengal', 'Odisha': 'Odisha',
            'Jharkhand': 'Jharkhand', 'Chhattisgarh': 'Chhattisgarh',
            'Assam': 'Assam', 'Goa': 'Goa',
            'Himachal Pradesh': 'Himachal Pradesh', 'Uttarakhand': 'Uttarakhand',
            'Jammu And Kashmir': 'Jammu And Kashmir',
        }
        return state_mapping.get(state, state)

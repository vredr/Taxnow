"""Amazon Adapter - Converts Amazon seller central reports to GST format"""

from .base_adapter import BaseAdapter


class AmazonAdapter(BaseAdapter):
    """Adapter for Amazon seller central reports"""
    
    PLATFORM_NAME = "amazon"
    
    COLUMN_MAPPINGS = {
        'order_id': 'invoice_number',
        'order_id_': 'invoice_number',
        'amazon_order_id': 'invoice_number',
        'invoice_number': 'invoice_number',
        'invoice_no': 'invoice_number',
        'order_date': 'invoice_date',
        'shipment_date': 'invoice_date',
        'date': 'invoice_date',
        'invoice_date': 'invoice_date',
        'customer_gstin': 'customer_gstin',
        'buyer_gstin': 'customer_gstin',
        'gstin': 'customer_gstin',
        'customer_billing_gstin': 'customer_gstin',
        'ship_state': 'place_of_supply',
        'shipping_state': 'place_of_supply',
        'ship_to_state': 'place_of_supply',
        'state': 'place_of_supply',
        'place_of_supply': 'place_of_supply',
        'buyer_state': 'place_of_supply',
        'hsn_code': 'hsn_code',
        'hsn': 'hsn_code',
        'product_tax_code': 'hsn_code',
        'tax_rate': 'tax_rate',
        'gst_rate': 'tax_rate',
        'tax_percentage': 'tax_rate',
        'gst_percentage': 'tax_rate',
        'item_tax_rate': 'tax_rate',
        'taxable_value': 'taxable_value',
        'item_price': 'taxable_value',
        'product_amount': 'taxable_value',
        'item_total': 'taxable_value',
        'total_value': 'taxable_value',
        'quantity': 'quantity',
        'qty': 'quantity',
        'item_quantity': 'quantity',
        'units': 'quantity',
        'seller_state': 'supplier_state',
        'supplier_state': 'supplier_state',
        'from_state': 'supplier_state',
        'warehouse_state': 'supplier_state',
        'order_item_id': 'order_item_id',
        'sku': 'sku',
        'product_name': 'product_name',
        'item_description': 'product_name',
        'buyer_name': 'customer_name',
        'customer_name': 'customer_name',
        'ship_city': 'customer_city',
        'cgst_amount': 'cgst',
        'sgst_amount': 'sgst',
        'igst_amount': 'igst',
        'cgst': 'cgst',
        'sgst': 'sgst',
        'igst': 'igst',
        'invoice_amount': 'total_amount',
        'invoice_total': 'total_amount',
        'total_amount': 'total_amount',
    }
    
    def get_column_mappings(self) -> dict:
        return self.COLUMN_MAPPINGS
    
    def transform(self, df):
        df = super().transform(df)
        # Extract state from GSTIN if place_of_supply is missing
        if 'place_of_supply' not in df.columns or df['place_of_supply'].isna().all():
            if 'customer_gstin' in df.columns:
                df['place_of_supply'] = df['customer_gstin'].apply(
                    lambda x: self._get_state_from_gstin(x) if x else 'Unknown'
                )
        return df
    
    def _get_state_from_gstin(self, gstin: str) -> str:
        """Extract state name from GSTIN state code"""
        if not gstin or len(gstin) < 2:
            return 'Unknown'
        
        state_code = gstin[:2]
        state_mapping = {
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
        return state_mapping.get(state_code, 'Unknown')

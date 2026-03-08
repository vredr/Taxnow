"""Meesho Adapter - Converts Meesho supplier panel reports to GST format"""

from .base_adapter import BaseAdapter


class MeeshoAdapter(BaseAdapter):
    """Adapter for Meesho supplier panel reports"""
    
    PLATFORM_NAME = "meesho"
    
    COLUMN_MAPPINGS = {
        'order_id': 'invoice_number',
        'sub_order_id': 'invoice_number',
        'order_item_id': 'invoice_number',
        'meesho_order_id': 'invoice_number',
        'order_number': 'invoice_number',
        'invoice_number': 'invoice_number',
        'invoice_no': 'invoice_number',
        'order_date': 'invoice_date',
        'order_placement_date': 'invoice_date',
        'dispatch_date': 'invoice_date',
        'date': 'invoice_date',
        'invoice_date': 'invoice_date',
        'order_item_date': 'invoice_date',
        'customer_gstin': 'customer_gstin',
        'buyer_gstin': 'customer_gstin',
        'gstin': 'customer_gstin',
        'buyer_gstin_number': 'customer_gstin',
        'shipping_state': 'place_of_supply',
        'ship_to_state': 'place_of_supply',
        'state': 'place_of_supply',
        'place_of_supply': 'place_of_supply',
        'buyer_state': 'place_of_supply',
        'customer_state': 'place_of_supply',
        'delivery_state': 'place_of_supply',
        'hsn_code': 'hsn_code',
        'hsn': 'hsn_code',
        'product_hsn_code': 'hsn_code',
        'hsn_number': 'hsn_code',
        'tax_rate': 'tax_rate',
        'gst_rate': 'tax_rate',
        'tax_percentage': 'tax_rate',
        'gst_percentage': 'tax_rate',
        'product_tax_rate': 'tax_rate',
        'gst_%': 'tax_rate',
        'taxable_value': 'taxable_value',
        'selling_price': 'taxable_value',
        'item_price': 'taxable_value',
        'product_amount': 'taxable_value',
        'total_price': 'taxable_value',
        'item_total': 'taxable_value',
        'supplier_price': 'taxable_value',
        'quantity': 'quantity',
        'qty': 'quantity',
        'item_quantity': 'quantity',
        'units': 'quantity',
        'order_quantity': 'quantity',
        'seller_state': 'supplier_state',
        'supplier_state': 'supplier_state',
        'from_state': 'supplier_state',
        'supplier_gstin_state': 'supplier_state',
        'sku': 'sku',
        'product_sku': 'sku',
        'product_name': 'product_name',
        'product_title': 'product_name',
        'item_description': 'product_name',
        'buyer_name': 'customer_name',
        'customer_name': 'customer_name',
        'shipping_city': 'customer_city',
        'cgst_amount': 'cgst',
        'sgst_amount': 'sgst',
        'igst_amount': 'igst',
        'cgst': 'cgst',
        'sgst': 'sgst',
        'igst': 'igst',
        'total_amount': 'total_amount',
        'invoice_amount': 'total_amount',
        'order_amount': 'total_amount',
        'grand_total': 'total_amount',
    }
    
    def get_column_mappings(self) -> dict:
        return self.COLUMN_MAPPINGS
    
    def transform(self, df):
        df = super().transform(df)
        # Meesho often provides supplier price which needs to be multiplied by quantity
        if 'taxable_value' not in df.columns or df['taxable_value'].isna().all():
            if 'supplier_price' in df.columns and 'quantity' in df.columns:
                df['taxable_value'] = df['supplier_price'] * df['quantity']
        return df

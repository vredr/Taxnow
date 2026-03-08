"""Base Adapter Class for all platform adapters"""

import pandas as pd
from abc import ABC, abstractmethod
from typing import Dict, List


class BaseAdapter(ABC):
    """Base class for all platform adapters"""
    
    PLATFORM_NAME = "base"
    COLUMN_MAPPINGS = {}
    
    REQUIRED_COLUMNS = [
        'invoice_number', 'invoice_date', 'place_of_supply',
        'taxable_value', 'tax_rate'
    ]
    
    OPTIONAL_COLUMNS = [
        'customer_gstin', 'hsn_code', 'quantity',
        'supplier_state', 'order_id', 'customer_name',
        'product_name', 'sku', 'platform'
    ]
    
    def __init__(self):
        self.original_columns: List[str] = []
    
    @abstractmethod
    def get_column_mappings(self) -> Dict[str, str]:
        """Return column mappings for this platform"""
        pass
    
    def normalize_columns(self, df: pd.DataFrame) -> pd.DataFrame:
        """Normalize column names using platform-specific mapping"""
        self.original_columns = list(df.columns)
        df.columns = [str(col).lower().strip().replace(' ', '_') for col in df.columns]
        
        mappings = self.get_column_mappings()
        new_columns = []
        for col in df.columns:
            new_columns.append(mappings.get(col, col))
        df.columns = new_columns
        return df
    
    def clean_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """Clean and standardize data values"""
        if 'invoice_number' in df.columns:
            df['invoice_number'] = df['invoice_number'].astype(str).str.strip()
        
        if 'invoice_date' in df.columns:
            df['invoice_date'] = pd.to_datetime(df['invoice_date'], errors='coerce')
        
        if 'customer_gstin' in df.columns:
            df['customer_gstin'] = df['customer_gstin'].astype(str).str.strip().str.upper()
            df['customer_gstin'] = df['customer_gstin'].replace(['NAN', 'NONE', 'NULL', 'NA', ''], '')
        
        if 'hsn_code' in df.columns:
            df['hsn_code'] = df['hsn_code'].astype(str).str.strip()
        
        numeric_columns = ['taxable_value', 'tax_rate', 'quantity', 'cgst', 'sgst', 'igst']
        for col in numeric_columns:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)
        
        state_columns = ['place_of_supply', 'supplier_state']
        for col in state_columns:
            if col in df.columns:
                df[col] = df[col].astype(str).str.strip().str.title()
        
        return df
    
    def add_defaults(self, df: pd.DataFrame) -> pd.DataFrame:
        """Add default values for missing columns"""
        if 'supplier_state' not in df.columns:
            df['supplier_state'] = 'Maharashtra'
        if 'quantity' not in df.columns:
            df['quantity'] = 1
        if 'hsn_code' not in df.columns:
            df['hsn_code'] = '999999'
        if 'customer_gstin' not in df.columns:
            df['customer_gstin'] = ''
        df['platform'] = self.PLATFORM_NAME
        return df
    
    def transform(self, df: pd.DataFrame) -> pd.DataFrame:
        """Main transformation pipeline"""
        df = self.normalize_columns(df)
        df = self.clean_data(df)
        df = self.add_defaults(df)
        return df
    
    def validate(self, df: pd.DataFrame) -> Dict:
        """Validate that required columns are present"""
        missing = [col for col in self.REQUIRED_COLUMNS if col not in df.columns]
        return {
            "valid": len(missing) == 0,
            "missing": missing,
            "detected": list(df.columns),
            "original": self.original_columns
        }

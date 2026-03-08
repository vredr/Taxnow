"""Data Processing Service - Handles reading, cleaning, and normalizing e-commerce data"""

import pandas as pd
from typing import Dict, List, Optional
from pathlib import Path


class DataProcessor:
    """Process and normalize e-commerce sales data"""
    
    REQUIRED_COLUMNS = [
        'invoice_number', 'invoice_date', 'place_of_supply',
        'taxable_value', 'tax_rate'
    ]
    
    OPTIONAL_COLUMNS = [
        'customer_gstin', 'hsn_code', 'quantity',
        'supplier_state', 'order_id', 'customer_name',
        'product_name', 'sku'
    ]
    
    def __init__(self):
        self.original_columns: List[str] = []
    
    def read_file(self, file_path: str, file_ext: str = None) -> pd.DataFrame:
        """Read Excel or CSV file"""
        path = Path(file_path)
        
        if not path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")
        
        if file_ext is None:
            file_ext = path.suffix.lower()
        else:
            file_ext = file_ext.lower()
        
        if file_ext == '.csv':
            encodings = ['utf-8', 'latin-1', 'iso-8859-1', 'cp1252']
            last_error = None
            for encoding in encodings:
                try:
                    df = pd.read_csv(file_path, encoding=encoding)
                    break
                except UnicodeDecodeError as e:
                    last_error = e
                    continue
            else:
                raise last_error or Exception("Failed to decode CSV file")
        elif file_ext in ['.xlsx', '.xls']:
            df = pd.read_excel(file_path)
        else:
            raise ValueError(f"Unsupported file format: {file_ext}")
        
        self.original_columns = list(df.columns)
        return df
    
    def remove_duplicates(self, df: pd.DataFrame) -> pd.DataFrame:
        """Remove duplicate invoices based on invoice_number"""
        if 'invoice_number' in df.columns:
            before_count = len(df)
            df = df.drop_duplicates(subset=['invoice_number'], keep='first')
            after_count = len(df)
            removed = before_count - after_count
            if removed > 0:
                print(f"Removed {removed} duplicate invoices")
        return df
    
    def validate_data(self, df: pd.DataFrame) -> Dict:
        """Validate data quality"""
        issues = []
        
        for col in self.REQUIRED_COLUMNS:
            if col in df.columns:
                missing_count = df[col].isna().sum()
                if missing_count > 0:
                    issues.append(f"{col}: {missing_count} missing values")
        
        numeric_cols = ['taxable_value', 'tax_rate', 'quantity']
        for col in numeric_cols:
            if col in df.columns:
                negative_count = (df[col] < 0).sum()
                if negative_count > 0:
                    issues.append(f"{col}: {negative_count} negative values")
        
        if 'tax_rate' in df.columns:
            valid_rates = [0, 0.25, 3, 5, 12, 18, 28]
            invalid_rates = df[~df['tax_rate'].isin(valid_rates)]['tax_rate'].unique()
            if len(invalid_rates) > 0:
                issues.append(f"tax_rate: Invalid rates found: {invalid_rates}")
        
        return {
            'valid': len(issues) == 0,
            'issues': issues,
            'total_rows': len(df)
        }

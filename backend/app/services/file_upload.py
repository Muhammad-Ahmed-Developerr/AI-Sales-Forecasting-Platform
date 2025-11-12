import pandas as pd
import numpy as np
from fastapi import UploadFile, HTTPException
import io
import logging
from typing import Dict, Tuple, Any

logger = logging.getLogger(__name__)

async def handle_upload(file: UploadFile) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """
    Process uploaded file and detect column structure
    """
    try:
        # Read file content
        content = await file.read()
        
        # Determine file type and read
        if file.filename.lower().endswith('.csv'):
            df = pd.read_csv(io.BytesIO(content))
        else:  # Excel files
            df = pd.read_excel(io.BytesIO(content))
        
        logger.info(f"File loaded successfully. Columns: {df.columns.tolist()}")
        logger.info(f"Data sample:\n{df.head()}")
        
        # Detect column structure
        column_info = detect_columns(df)
        logger.info(f"Detected columns - Sales: {column_info['sales_column']}, Date: {column_info['date_column']}, Product: {column_info.get('product_column')}")
        
        return df, column_info
        
    except Exception as e:
        logger.error(f"Error processing upload: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Error processing file: {str(e)}")

def detect_columns(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Automatically detect sales, date, and other relevant columns
    """
    column_info = {
        'sales_column': None,
        'date_column': None,
        'product_column': None,
        'region_column': None,
        'customer_column': None,
        'additional_columns': []
    }
    
    # Common sales-related column names
    sales_keywords = ['sales', 'revenue', 'amount', 'price', 'value', 'total', 'income']
    date_keywords = ['date', 'time', 'day', 'month', 'year', 'timestamp']
    product_keywords = ['product', 'item', 'sku', 'category', 'service']
    region_keywords = ['region', 'area', 'location', 'city', 'state', 'country']
    customer_keywords = ['customer', 'client', 'user', 'account']
    
    for col in df.columns:
        col_lower = col.lower()
        
        # Check for sales column
        if any(keyword in col_lower for keyword in sales_keywords):
            if pd.api.types.is_numeric_dtype(df[col]):
                column_info['sales_column'] = col
        
        # Check for date column
        elif any(keyword in col_lower for keyword in date_keywords):
            try:
                # Try to convert to datetime to verify
                pd.to_datetime(df[col].head(10))  # Test with first 10 rows
                column_info['date_column'] = col
            except:
                pass
        
        # Check for product column
        elif any(keyword in col_lower for keyword in product_keywords):
            column_info['product_column'] = col
        
        # Check for region column
        elif any(keyword in col_lower for keyword in region_keywords):
            column_info['region_column'] = col
        
        # Check for customer column
        elif any(keyword in col_lower for keyword in customer_keywords):
            column_info['customer_column'] = col
        
        else:
            column_info['additional_columns'].append(col)
    
    # Fallback: if no sales column detected, use first numeric column
    if column_info['sales_column'] is None:
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        if len(numeric_cols) > 0:
            column_info['sales_column'] = numeric_cols[0]
    
    # Fallback: if no date column detected, use first datetime-parsable column
    if column_info['date_column'] is None:
        for col in df.columns:
            try:
                pd.to_datetime(df[col].head(10))
                column_info['date_column'] = col
                break
            except:
                continue
    
    # If still no date column, create one based on index
    if column_info['date_column'] is None:
        df['auto_date'] = pd.date_range(start='2024-01-01', periods=len(df), freq='D')
        column_info['date_column'] = 'auto_date'
    
    return column_info
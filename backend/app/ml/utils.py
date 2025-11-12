import pandas as pd
import numpy as np
from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)

def validate_sales_data(df: pd.DataFrame) -> Dict[str, Any]:
    """Validate sales data quality"""
    validation_result = {
        'is_valid': True,
        'issues': [],
        'warnings': []
    }
    
    # Check required columns
    required_columns = ['date', 'sales']
    for col in required_columns:
        if col not in df.columns:
            validation_result['is_valid'] = False
            validation_result['issues'].append(f"Missing required column: {col}")
    
    if not validation_result['is_valid']:
        return validation_result
    
    # Check data types
    try:
        df['date'] = pd.to_datetime(df['date'])
    except:
        validation_result['is_valid'] = False
        validation_result['issues'].append("Invalid date format")
    
    try:
        df['sales'] = pd.to_numeric(df['sales'])
    except:
        validation_result['is_valid'] = False
        validation_result['issues'].append("Invalid sales values")
    
    # Check for missing values
    missing_dates = df['date'].isnull().sum()
    missing_sales = df['sales'].isnull().sum()
    
    if missing_dates > 0:
        validation_result['warnings'].append(f"Found {missing_dates} missing dates")
    
    if missing_sales > 0:
        validation_result['warnings'].append(f"Found {missing_sales} missing sales values")
    
    # Check for negative sales
    negative_sales = (df['sales'] < 0).sum()
    if negative_sales > 0:
        validation_result['warnings'].append(f"Found {negative_sales} negative sales values")
    
    # Check data volume
    if len(df) < 30:
        validation_result['warnings'].append("Limited historical data (less than 30 days)")
    
    # Check date range
    if len(df) > 1:
        date_range = (df['date'].max() - df['date'].min()).days
        if date_range < 30:
            validation_result['warnings'].append("Short historical period (less than 30 days)")
    
    return validation_result

def calculate_business_metrics(df: pd.DataFrame) -> Dict[str, Any]:
    """Calculate key business metrics from sales data"""
    if len(df) == 0:
        return {}
    
    metrics = {
        'total_revenue': float(df['sales'].sum()),
        'average_daily_sales': float(df['sales'].mean()),
        'max_daily_sales': float(df['sales'].max()),
        'min_daily_sales': float(df['sales'].min()),
        'sales_std_dev': float(df['sales'].std()),
        'total_days': len(df),
        'date_range_days': (df['date'].max() - df['date'].min()).days
    }
    
    # Growth metrics (if sufficient data)
    if len(df) >= 30:
        first_month = df.head(30)['sales'].mean()
        last_month = df.tail(30)['sales'].mean()
        if first_month > 0:
            metrics['growth_rate_30d'] = float((last_month - first_month) / first_month * 100)
    
    # Seasonality indicator (weekend vs weekday)
    df_with_dow = df.copy()
    df_with_dow['day_of_week'] = df_with_dow['date'].dt.dayofweek
    weekend_sales = df_with_dow[df_with_dow['day_of_week'] >= 5]['sales'].mean()
    weekday_sales = df_with_dow[df_with_dow['day_of_week'] < 5]['sales'].mean()
    
    if weekday_sales > 0:
        metrics['weekend_weekday_ratio'] = float(weekend_sales / weekday_sales)
    
    return metrics
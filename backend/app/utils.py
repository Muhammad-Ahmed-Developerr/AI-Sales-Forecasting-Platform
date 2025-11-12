import pandas as pd
import numpy as np
from typing import Dict, List, Tuple, Any, Optional
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

def validate_sales_data(df: pd.DataFrame, column_info: Dict) -> Dict[str, Any]:
    """
    Enhanced data validation with comprehensive checks
    """
    issues = []
    warnings = []
    
    # Required columns check
    if 'sales_column' not in column_info:
        issues.append("Sales column not detected")
    if 'date_column' not in column_info:
        issues.append("Date column not detected")
    
    if issues:
        return {
            'is_valid': False,
            'issues': issues,
            'warnings': warnings,
            'data_quality_score': 0.0,
            'ai_confidence': 0.0
        }
    
    sales_col = column_info['sales_column']
    date_col = column_info['date_column']
    
    # Data type validation
    if not pd.api.types.is_numeric_dtype(df[sales_col]):
        issues.append(f"Sales column '{sales_col}' must contain numeric values")
    
    # Date format validation
    try:
        df[date_col] = pd.to_datetime(df[date_col])
    except:
        issues.append(f"Date column '{date_col}' contains invalid date formats")
    
    # Data quality checks
    if df[sales_col].isnull().sum() > 0:
        warnings.append(f"Sales column contains {df[sales_col].isnull().sum()} missing values")
    
    if df[sales_col].min() < 0:
        warnings.append("Sales column contains negative values")
    
    if len(df) < 30:
        warnings.append("Limited historical data (less than 30 days)")
    
    # Calculate data quality score
    data_quality_score = calculate_data_quality_score(df, sales_col, date_col)
    
    # AI confidence based on data quality
    ai_confidence = min(data_quality_score * 1.2, 0.95)  # Cap at 95%
    
    return {
        'is_valid': len(issues) == 0,
        'issues': issues,
        'warnings': warnings,
        'data_quality_score': data_quality_score,
        'ai_confidence': ai_confidence
    }

def calculate_data_quality_score(df: pd.DataFrame, sales_col: str, date_col: str) -> float:
    """
    Calculate comprehensive data quality score (0-1)
    """
    score_components = []
    
    # Completeness (30%)
    completeness = 1.0 - (df[sales_col].isnull().sum() / len(df))
    score_components.append(completeness * 0.3)
    
    # Consistency (25%)
    consistency = calculate_consistency_score(df, sales_col)
    score_components.append(consistency * 0.25)
    
    # Validity (25%)
    validity = 1.0 if df[sales_col].min() >= 0 else 0.7
    score_components.append(validity * 0.25)
    
    # Data volume (20%)
    volume_score = min(len(df) / 100, 1.0)  # Full score at 100+ records
    score_components.append(volume_score * 0.2)
    
    return sum(score_components)

def calculate_consistency_score(df: pd.DataFrame, sales_col: str) -> float:
    """
    Calculate data consistency score based on variance and patterns
    """
    try:
        sales_data = df[sales_col].dropna()
        
        if len(sales_data) < 2:
            return 0.5
        
        # Calculate coefficient of variation (lower is better)
        cv = sales_data.std() / sales_data.mean() if sales_data.mean() > 0 else 1.0
        
        # Check for outliers using IQR
        Q1 = sales_data.quantile(0.25)
        Q3 = sales_data.quantile(0.75)
        IQR = Q3 - Q1
        outlier_count = ((sales_data < (Q1 - 1.5 * IQR)) | (sales_data > (Q3 + 1.5 * IQR))).sum()
        outlier_ratio = outlier_count / len(sales_data)
        
        # Consistency score (0-1)
        cv_score = max(0, 1 - cv)  # Lower CV = higher score
        outlier_score = max(0, 1 - outlier_ratio * 2)  # Fewer outliers = higher score
        
        return (cv_score * 0.6 + outlier_score * 0.4)
    
    except Exception as e:
        logger.warning(f"Error calculating consistency score: {e}")
        return 0.5

def calculate_business_metrics(df: pd.DataFrame, column_info: Dict) -> Dict[str, Any]:
    """
    Calculate comprehensive business metrics with enhanced analytics
    """
    sales_col = column_info['sales_column']
    date_col = column_info['date_column']
    
    # Ensure date is datetime
    df[date_col] = pd.to_datetime(df[date_col])
    
    # Basic metrics
    sales_data = df[sales_col]
    total_revenue = sales_data.sum()
    average_daily_sales = sales_data.mean()
    max_daily_sales = sales_data.max()
    min_daily_sales = sales_data.min()
    sales_std_dev = sales_data.std()
    total_days = len(df)
    
    # Enhanced metrics
    volatility = calculate_volatility(sales_data)
    momentum = calculate_momentum(sales_data)
    trend_strength = calculate_trend_strength(df, sales_col, date_col)
    consistency_score = calculate_consistency_score(df, sales_col)
    
    # Growth rates
    growth_rate_30d = calculate_growth_rate(df, sales_col, date_col, days=30)
    growth_rate_7d = calculate_growth_rate(df, sales_col, date_col, days=7)
    
    # Prediction confidence based on data quality
    prediction_confidence = calculate_prediction_confidence(
        total_days, volatility, trend_strength, consistency_score
    )
    
    return {
        'total_revenue': float(total_revenue),
        'average_daily_sales': float(average_daily_sales),
        'max_daily_sales': float(max_daily_sales),
        'min_daily_sales': float(min_daily_sales),
        'sales_std_dev': float(sales_std_dev),
        'total_days': int(total_days),
        'growth_rate_30d': float(growth_rate_30d),
        'growth_rate_7d': float(growth_rate_7d),
        'volatility': float(volatility),
        'momentum': float(momentum),
        'trend_strength': float(trend_strength),
        'consistency_score': float(consistency_score),
        'prediction_confidence': float(prediction_confidence)
    }

def calculate_volatility(sales_data: pd.Series) -> float:
    """Calculate price volatility as coefficient of variation"""
    if sales_data.mean() == 0:
        return 0.0
    return float(sales_data.std() / sales_data.mean())

def calculate_momentum(sales_data: pd.Series, window: int = 7) -> float:
    """Calculate sales momentum using rolling average"""
    if len(sales_data) < window + 1:
        return 0.0
    
    rolling_avg = sales_data.rolling(window=window).mean()
    if pd.isna(rolling_avg.iloc[-1]) or pd.isna(rolling_avg.iloc[-(window + 1)]):
        return 0.0
    
    current_avg = rolling_avg.iloc[-1]
    previous_avg = rolling_avg.iloc[-(window + 1)]
    
    if previous_avg == 0:
        return 0.0
    
    return float(((current_avg - previous_avg) / previous_avg) * 100)

def calculate_trend_strength(df: pd.DataFrame, sales_col: str, date_col: str) -> float:
    """Calculate trend strength using linear regression"""
    try:
        from scipy import stats
        
        # Create numeric index for regression
        df_sorted = df.sort_values(date_col).reset_index(drop=True)
        x = np.arange(len(df_sorted))
        y = df_sorted[sales_col].values
        
        # Remove NaN values
        mask = ~np.isnan(y)
        x_clean = x[mask]
        y_clean = y[mask]
        
        if len(x_clean) < 2:
            return 0.5
        
        # Calculate linear regression
        slope, intercept, r_value, p_value, std_err = stats.linregress(x_clean, y_clean)
        
        # Trend strength based on R-squared
        trend_strength = min(abs(r_value) * 1.5, 1.0)  # Scale and cap at 1.0
        
        return float(trend_strength)
    
    except Exception as e:
        logger.warning(f"Error calculating trend strength: {e}")
        return 0.5

def calculate_growth_rate(df: pd.DataFrame, sales_col: str, date_col: str, days: int = 30) -> float:
    """Calculate growth rate over specified days"""
    try:
        df_sorted = df.sort_values(date_col)
        
        if len(df_sorted) < days + 1:
            return 0.0
        
        recent_data = df_sorted.tail(days)
        older_data = df_sorted.tail(days * 2).head(days)
        
        recent_avg = recent_data[sales_col].mean()
        older_avg = older_data[sales_col].mean()
        
        if older_avg == 0:
            return 0.0
        
        growth_rate = ((recent_avg - older_avg) / older_avg) * 100
        return float(growth_rate)
    
    except Exception as e:
        logger.warning(f"Error calculating growth rate: {e}")
        return 0.0

def calculate_prediction_confidence(total_days: int, volatility: float, 
                                  trend_strength: float, consistency_score: float) -> float:
    """Calculate overall prediction confidence score"""
    # Data volume component
    volume_confidence = min(total_days / 90, 1.0)  # Full confidence at 90+ days
    
    # Volatility component (lower volatility = higher confidence)
    volatility_confidence = max(0, 1 - volatility * 2)
    
    # Combined confidence
    confidence = (
        volume_confidence * 0.3 +
        volatility_confidence * 0.3 +
        trend_strength * 0.2 +
        consistency_score * 0.2
    )
    
    return min(confidence, 0.95)  # Cap at 95%

def detect_seasonality(df: pd.DataFrame, sales_col: str, date_col: str) -> Dict[str, Any]:
    """Detect seasonal patterns in sales data"""
    try:
        df_sorted = df.sort_values(date_col).copy()
        df_sorted['month'] = df_sorted[date_col].dt.month
        df_sorted['day_of_week'] = df_sorted[date_col].dt.dayofweek
        
        # Monthly seasonality
        monthly_avg = df_sorted.groupby('month')[sales_col].mean()
        seasonal_strength = monthly_avg.std() / monthly_avg.mean() if monthly_avg.mean() > 0 else 0
        
        # Weekly seasonality
        weekly_avg = df_sorted.groupby('day_of_week')[sales_col].mean()
        weekly_strength = weekly_avg.std() / weekly_avg.mean() if weekly_avg.mean() > 0 else 0
        
        # Peak periods
        peak_months = monthly_avg.nlargest(3).index.tolist()
        peak_days = weekly_avg.nlargest(2).index.tolist()
        
        return {
            'seasonal_strength': float(max(seasonal_strength, weekly_strength)),
            'peak_periods': peak_months + [f'day_{d}' for d in peak_days],
            'seasonal_impact': float(seasonal_strength * 100)
        }
    
    except Exception as e:
        logger.warning(f"Error detecting seasonality: {e}")
        return {
            'seasonal_strength': 0.0,
            'peak_periods': [],
            'seasonal_impact': 0.0
        }

def generate_business_insights(business_metrics: Dict, forecast_metrics: Dict) -> List[Dict]:
    """Generate AI-powered business insights"""
    insights = []
    
    # Growth insight
    if business_metrics['growth_rate_30d'] > 20:
        insights.append({
            'type': 'positive',
            'title': 'Strong Growth Momentum',
            'description': f"Your business is growing at {business_metrics['growth_rate_30d']:.1f}% monthly rate",
            'impact': 'high',
            'action': 'Consider scaling operations to maintain growth trajectory',
            'confidence': 0.85
        })
    elif business_metrics['growth_rate_30d'] < -10:
        insights.append({
            'type': 'warning',
            'title': 'Declining Sales Trend',
            'description': f"Sales have decreased by {abs(business_metrics['growth_rate_30d']):.1f}% over the past month",
            'impact': 'high',
            'action': 'Review marketing strategies and customer engagement',
            'confidence': 0.80
        })
    
    # Volatility insight
    if business_metrics['volatility'] > 0.5:
        insights.append({
            'type': 'warning',
            'title': 'High Sales Volatility',
            'description': 'Sales show significant day-to-day fluctuations',
            'impact': 'medium',
            'action': 'Implement strategies to stabilize revenue streams',
            'confidence': 0.75
        })
    
    # Data quality insight
    if business_metrics['consistency_score'] < 0.6:
        insights.append({
            'type': 'info',
            'title': 'Data Consistency Opportunity',
            'description': 'Improving data collection consistency could enhance forecast accuracy',
            'impact': 'medium',
            'action': 'Standardize data entry processes and validation',
            'confidence': 0.70
        })
    
    # Prediction confidence insight
    if business_metrics['prediction_confidence'] > 0.8:
        insights.append({
            'type': 'positive',
            'title': 'High Forecast Reliability',
            'description': f"AI models show {business_metrics['prediction_confidence']*100:.0f}% confidence in predictions",
            'impact': 'high',
            'action': 'Use forecasts confidently for strategic planning',
            'confidence': 0.90
        })
    
    return insights

def generate_recommendations(business_metrics: Dict, forecast: Dict) -> List[Dict]:
    """Generate AI-powered business recommendations"""
    recommendations = []
    
    # Inventory recommendations
    if business_metrics['volatility'] > 0.3:
        recommendations.append({
            'category': 'inventory',
            'title': 'Optimize Inventory Management',
            'description': 'Implement dynamic inventory tracking to handle sales fluctuations',
            'priority': 'medium',
            'timeframe': '2-4 weeks',
            'impact': 'Reduce stockouts and overstock by 25%',
            'ai_confidence': 0.80
        })
    
    # Marketing recommendations
    if business_metrics['growth_rate_30d'] < 5:
        recommendations.append({
            'category': 'marketing',
            'title': 'Boost Marketing Efforts',
            'description': 'Increase promotional activities to stimulate growth',
            'priority': 'high',
            'timeframe': '1-2 weeks',
            'impact': 'Potential 15-20% revenue increase',
            'ai_confidence': 0.75
        })
    
    # Data quality recommendations
    if business_metrics['total_days'] < 60:
        recommendations.append({
            'category': 'operations',
            'title': 'Expand Historical Data',
            'description': 'Collect more historical data for improved forecasting accuracy',
            'priority': 'medium',
            'timeframe': '1-2 months',
            'impact': 'Increase prediction accuracy by 30%',
            'ai_confidence': 0.85
        })
    
    # Always include these general recommendations
    recommendations.extend([
        {
            'category': 'ai',
            'title': 'Monitor AI Insights Regularly',
            'description': 'Review AI-generated insights weekly to stay ahead of trends',
            'priority': 'low',
            'timeframe': 'ongoing',
            'impact': 'Better strategic decision making',
            'ai_confidence': 0.90
        },
        {
            'category': 'finance',
            'title': 'Diversify Revenue Streams',
            'description': 'Explore new product categories or services to reduce dependency',
            'priority': 'medium',
            'timeframe': '3-6 months',
            'impact': 'Increase business resilience',
            'ai_confidence': 0.70
        }
    ])
    
    return recommendations
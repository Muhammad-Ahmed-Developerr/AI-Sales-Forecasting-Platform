import pandas as pd
import numpy as np
from typing import Dict, Any, Tuple
import joblib
import os
import logging
from .model import train_prophet, train_lightgbm, PROPHET_AVAILABLE, LGBM_AVAILABLE, save_model

logger = logging.getLogger(__name__)

MODEL_DIR = 'models'
os.makedirs(MODEL_DIR, exist_ok=True)

def train_forecasting_model(df: pd.DataFrame, model_config: Dict[str, Any] = None) -> Dict[str, Any]:
    """
    Train the best available forecasting model on the provided data
    
    Args:
        df: DataFrame with 'date' and 'sales' columns
        model_config: Optional configuration for model training
    
    Returns:
        Dictionary containing training results and model info
    """
    if model_config is None:
        model_config = {}
    
    try:
        # Data validation and preparation
        df_clean = prepare_training_data(df)
        
        # Model selection based on availability and data characteristics
        if PROPHET_AVAILABLE and is_prophet_suitable(df_clean):
            logger.info("Training Prophet model")
            model, forecast_df = train_prophet(df_clean, periods=90)
            model_type = 'prophet'
            metrics = calculate_training_metrics(df_clean, forecast_df)
            
        elif LGBM_AVAILABLE and is_lightgbm_suitable(df_clean):
            logger.info("Training LightGBM model")
            model, forecast_df = train_lightgbm(df_clean, periods=90)
            model_type = 'lightgbm'
            metrics = calculate_training_metrics(df_clean, forecast_df)
            
        else:
            logger.info("Using naive model as fallback")
            model_info = train_naive_model(df_clean)
            return model_info
        
        # Save the trained model
        model_path = os.path.join(MODEL_DIR, f'{model_type}_model.joblib')
        save_model(model, model_type, model_path)
        
        # Prepare training results
        training_results = {
            'model_type': model_type,
            'model_path': model_path,
            'training_samples': len(df_clean),
            'metrics': metrics,
            'data_summary': get_data_summary(df_clean),
            'training_status': 'success'
        }
        
        logger.info(f"Model training completed: {model_type}, Samples: {len(df_clean)}")
        return training_results
        
    except Exception as e:
        logger.error(f"Model training failed: {str(e)}")
        # Fallback to naive model
        return train_naive_model(df)

def prepare_training_data(df: pd.DataFrame) -> pd.DataFrame:
    """
    Prepare and clean data for model training
    """
    df_clean = df.copy()
    df_clean['date'] = pd.to_datetime(df_clean['date'])
    
    # Aggregate if multiple stores/products
    if 'store_id' in df_clean.columns or 'product_id' in df_clean.columns:
        df_clean = df_clean.groupby('date', as_index=False)['sales'].sum()
    
    # Ensure daily frequency and handle missing dates
    df_clean = df_clean.sort_values('date').reset_index(drop=True)
    df_clean = handle_missing_dates(df_clean)
    
    # Remove outliers using IQR method
    df_clean = remove_outliers(df_clean)
    
    return df_clean[['date', 'sales']]

def handle_missing_dates(df: pd.DataFrame) -> pd.DataFrame:
    """Fill missing dates in time series"""
    if len(df) < 2:
        return df
    
    full_date_range = pd.date_range(
        start=df['date'].min(),
        end=df['date'].max(),
        freq='D'
    )
    
    df_complete = pd.DataFrame({'date': full_date_range})
    df_complete = df_complete.merge(df, on='date', how='left')
    
    # Forward fill missing sales values, then backward fill if needed
    df_complete['sales'] = df_complete['sales'].fillna(method='ffill').fillna(method='bfill')
    
    return df_complete

def remove_outliers(df: pd.DataFrame, iqr_multiplier: float = 1.5) -> pd.DataFrame:
    """Remove outliers using IQR method"""
    if len(df) < 10:  # Need sufficient data for outlier detection
        return df
    
    Q1 = df['sales'].quantile(0.25)
    Q3 = df['sales'].quantile(0.75)
    IQR = Q3 - Q1
    lower_bound = Q1 - iqr_multiplier * IQR
    upper_bound = Q3 + iqr_multiplier * IQR
    
    # Cap outliers rather than remove them to maintain time series continuity
    df_clean = df.copy()
    df_clean['sales'] = np.where(df_clean['sales'] < lower_bound, lower_bound, df_clean['sales'])
    df_clean['sales'] = np.where(df_clean['sales'] > upper_bound, upper_bound, df_clean['sales'])
    
    outliers_removed = ((df['sales'] < lower_bound) | (df['sales'] > upper_bound)).sum()
    if outliers_removed > 0:
        logger.info(f"Capped {outliers_removed} outliers")
    
    return df_clean

def is_prophet_suitable(df: pd.DataFrame) -> bool:
    """Check if Prophet is suitable for this dataset"""
    if len(df) < 30:
        logger.warning("Insufficient data for Prophet (minimum 30 points recommended)")
        return False
    return True

def is_lightgbm_suitable(df: pd.DataFrame) -> bool:
    """Check if LightGBM is suitable for this dataset"""
    if len(df) < 50:
        logger.warning("Limited data for LightGBM (50+ points recommended)")
        return False
    return True

def train_naive_model(df: pd.DataFrame) -> Dict[str, Any]:
    """Train a simple naive model as fallback"""
    df_clean = prepare_training_data(df)
    
    if len(df_clean) == 0:
        last_value = 0
        trend = 0
    elif len(df_clean) == 1:
        last_value = df_clean['sales'].iloc[-1]
        trend = 0
    else:
        # Use average of last 7 days, or all available if less than 7
        window = min(7, len(df_clean))
        last_value = df_clean['sales'].tail(window).mean()
        
        # Simple trend calculation
        if len(df_clean) >= 14:
            first_half = df_clean['sales'].head(7).mean()
            second_half = df_clean['sales'].tail(7).mean()
            trend = (second_half - first_half) / first_half if first_half > 0 else 0
        else:
            trend = 0
    
    model_info = {
        'model_type': 'naive',
        'last_value': float(last_value),
        'trend': float(trend),
        'training_samples': len(df_clean),
        'metrics': {'mape': None, 'rmse': None},
        'training_status': 'success'
    }
    
    model_path = os.path.join(MODEL_DIR, 'naive_model.joblib')
    joblib.dump(model_info, model_path)
    
    return model_info

def calculate_training_metrics(actual_df: pd.DataFrame, forecast_df: pd.DataFrame) -> Dict[str, float]:
    """Calculate model performance metrics on training data"""
    try:
        # Merge actuals with forecasts for the historical period
        if 'ds' in forecast_df.columns and 'yhat' in forecast_df.columns:
            # Prophet format
            merged = actual_df.merge(
                forecast_df[['ds', 'yhat']], 
                left_on='date', 
                right_on='ds', 
                how='inner'
            )
            actual = merged['sales'].values
            predicted = merged['yhat'].values
        else:
            # Other model formats
            return {'mape': None, 'rmse': None, 'samples': len(actual_df)}
        
        if len(merged) < 2:
            return {'mape': None, 'rmse': None, 'samples': len(actual_df)}
        
        # Calculate MAPE (Mean Absolute Percentage Error)
        # Avoid division by zero
        mask = actual > 0
        if mask.sum() > 0:
            mape = np.mean(np.abs((actual[mask] - predicted[mask]) / actual[mask])) * 100
        else:
            mape = None
        
        # Calculate RMSE (Root Mean Square Error)
        rmse = np.sqrt(np.mean((actual - predicted) ** 2))
        
        return {
            'mape': float(mape) if mape is not None else None,
            'rmse': float(rmse),
            'samples_evaluated': len(merged)
        }
        
    except Exception as e:
        logger.warning(f"Could not calculate training metrics: {str(e)}")
        return {'mape': None, 'rmse': None, 'samples': len(actual_df)}

def get_data_summary(df: pd.DataFrame) -> Dict[str, Any]:
    """Generate summary statistics for the training data"""
    return {
        'total_samples': len(df),
        'date_range': {
            'start': str(df['date'].min()),
            'end': str(df['date'].max()),
            'days': (df['date'].max() - df['date'].min()).days
        },
        'sales_statistics': {
            'mean': float(df['sales'].mean()),
            'std': float(df['sales'].std()),
            'min': float(df['sales'].min()),
            'max': float(df['sales'].max()),
            'total': float(df['sales'].sum())
        },
        'data_frequency': 'daily'
    }

def retrain_model(model_type: str, new_data: pd.DataFrame, existing_model_path: str = None) -> Dict[str, Any]:
    """
    Retrain an existing model with new data
    
    Args:
        model_type: Type of model to retrain ('prophet', 'lightgbm', 'naive')
        new_data: New training data
        existing_model_path: Path to existing model (for incremental training)
    
    Returns:
        Updated model information
    """
    logger.info(f"Retraining {model_type} model with new data")
    
    if model_type == 'prophet' and PROPHET_AVAILABLE:
        # For Prophet, we need to retrain from scratch with combined data
        return train_forecasting_model(new_data)
    
    elif model_type == 'lightgbm' and LGBM_AVAILABLE:
        # LightGBM supports incremental training, but for simplicity we retrain
        return train_forecasting_model(new_data)
    
    else:
        # For naive model or unsupported types, retrain from scratch
        return train_forecasting_model(new_data)
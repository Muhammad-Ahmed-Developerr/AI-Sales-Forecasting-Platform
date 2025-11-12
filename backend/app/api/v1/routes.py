from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.file_upload import handle_upload
from app.ml.predict import generate_forecast
from app.utils import validate_sales_data, calculate_business_metrics
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1", tags=["forecast"])

@router.post("/forecast")
async def create_forecast(file: UploadFile = File(...)):
    """
    Upload sales data and generate comprehensive forecast with dynamic analysis
    """
    # Validate file type
    if not file.filename.lower().endswith(('.csv', '.xls', '.xlsx')):
        raise HTTPException(
            status_code=400, 
            detail="File must be CSV or Excel format"
        )
    
    try:
        # Process upload with enhanced analysis
        df, column_info = await handle_upload(file)
        
        # Enhanced data validation
        validation = validate_sales_data(df, column_info)
        if not validation['is_valid']:
            raise HTTPException(
                status_code=400,
                detail=f"Data validation failed: {', '.join(validation['issues'])}"
            )
        
        # Calculate comprehensive business metrics
        business_metrics = calculate_business_metrics(df, column_info)
        
        # Generate enhanced forecast with product analysis
        forecast_result = generate_forecast(df, column_info, periods=90)
        
        # Ensure all required fields are present
        response_data = {
            "status": "success",
            "filename": file.filename,
            "column_info": column_info,  # Make sure this is included
            "data_validation": validation,
            "business_metrics": business_metrics,
            "forecast": forecast_result['forecast'],
            "product_analysis": forecast_result.get('product_analysis', {}),
            "business_insights": forecast_result.get('business_insights', []),
            "recommendations": forecast_result.get('recommendations', [])
        }
        
        logger.info(f"Returning forecast response with column_info: {column_info}")
        return response_data
        
    except Exception as e:
        logger.error(f"Forecast generation error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error processing file: {str(e)}"
        )

@router.get("/models/available")
async def get_available_models():
    """Get list of available forecasting models"""
    from app.ml.model import PROPHET_AVAILABLE, LGBM_AVAILABLE
    
    models = []
    
    if PROPHET_AVAILABLE:
        models.append({
            "name": "prophet",
            "description": "Facebook Prophet for time series forecasting",
            "confidence_intervals": True
        })
    
    if LGBM_AVAILABLE:
        models.append({
            "name": "lightgbm",
            "description": "LightGBM with feature engineering",
            "confidence_intervals": True
        })
    
    # Always available
    models.append({
        "name": "naive",
        "description": "Simple naive forecasting fallback",
        "confidence_intervals": False
    })
    
    return {"available_models": models}
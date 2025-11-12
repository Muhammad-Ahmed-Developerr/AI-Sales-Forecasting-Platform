from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class ForecastPoint(BaseModel):
    date: str
    predicted_sales: float
    lower_bound: Optional[float] = None
    upper_bound: Optional[float] = None
    confidence: Optional[float] = None

class ForecastResponse(BaseModel):
    model: str
    predictions: List[ForecastPoint]
    metrics: Dict[str, Any]
    confidence_intervals: bool
    periods: int

class BusinessMetrics(BaseModel):
    total_revenue: float
    average_daily_sales: float
    max_daily_sales: float
    min_daily_sales: float
    sales_std_dev: float
    total_days: int
    date_range_days: int
    growth_rate_30d: Optional[float] = None
    weekend_weekday_ratio: Optional[float] = None

class ValidationResult(BaseModel):
    is_valid: bool
    issues: List[str]
    warnings: List[str]

class UploadResponse(BaseModel):
    status: str
    filename: str
    data_validation: ValidationResult
    business_metrics: BusinessMetrics
    forecast: ForecastResponse

class HealthResponse(BaseModel):
    status: str
    service: str
    timestamp: datetime

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
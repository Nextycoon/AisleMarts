"""
Request validation for proper 4xx error responses
"""
from pydantic import BaseModel, validator, Field
from typing import Optional
from enum import Enum

class Currency(str, Enum):
    USD = "USD"
    EUR = "EUR" 
    GBP = "GBP"
    JPY = "JPY"

class ImpressionRequest(BaseModel):
    storyId: str = Field(..., min_length=1, description="Story ID is required")
    userId: Optional[str] = Field(None, min_length=1, description="User ID is optional")

class CTARequest(BaseModel):
    storyId: str = Field(..., min_length=1, description="Story ID is required")
    productId: Optional[str] = Field(None, min_length=1, description="Product ID is optional")
    userId: Optional[str] = Field(None, min_length=1, description="User ID is optional")

class PurchaseRequest(BaseModel):
    orderId: str = Field(..., min_length=1, description="Order ID is required")
    userId: Optional[str] = Field(None, min_length=1, description="User ID is optional")
    productId: str = Field(..., min_length=1, description="Product ID is required")
    amount: float = Field(..., gt=0, le=1000000, description="Amount must be positive and <= 1M")
    currency: Currency = Field(..., description="Currency must be USD, EUR, GBP, or JPY")
    referrerStoryId: Optional[str] = Field(None, min_length=1, description="Referrer story ID is optional")

    @validator('amount')
    def validate_amount(cls, v):
        if v <= 0:
            raise ValueError('Amount must be positive')
        if v > 1000000:
            raise ValueError('Amount must be <= 1,000,000')
        return v
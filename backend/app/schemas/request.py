"""
Pydantic Request Models
"""

from pydantic import BaseModel, Field
from typing import List, Optional


class CalculateRequest(BaseModel):
    """Request model for single calculation endpoint."""
    
    function_id: Optional[str] = Field(
        None,
        description="ID of a predefined function (e.g., 'smooth_sin')"
    )
    custom_expression: Optional[str] = Field(
        None,
        description="Custom mathematical expression (e.g., 'x**2 + 2*x')"
    )
    method: str = Field(
        ...,
        description="Integration method: 'trapezoidal', 'midpoint', or 'simpson'"
    )
    a: float = Field(..., description="Lower bound of integration")
    b: float = Field(..., description="Upper bound of integration")
    n: int = Field(..., ge=1, description="Number of subintervals")
    
    class Config:
        json_schema_extra = {
            "example": {
                "function_id": "smooth_sin",
                "method": "simpson",
                "a": 0,
                "b": 3.14159,
                "n": 10
            }
        }


class AnalyzeRequest(BaseModel):
    """Request model for convergence analysis endpoint."""
    
    function_id: Optional[str] = Field(
        None,
        description="ID of a predefined function"
    )
    custom_expression: Optional[str] = Field(
        None,
        description="Custom mathematical expression"
    )
    methods: List[str] = Field(
        default=["trapezoidal", "midpoint", "simpson"],
        description="List of methods to analyze"
    )
    a: float = Field(..., description="Lower bound of integration")
    b: float = Field(..., description="Upper bound of integration")
    n_values: List[int] = Field(
        default=[4, 8, 16, 32, 64, 128, 256, 512, 1024],
        description="List of N values to test"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "function_id": "smooth_sin",
                "methods": ["trapezoidal", "midpoint", "simpson"],
                "a": 0,
                "b": 3.14159,
                "n_values": [4, 8, 16, 32, 64, 128, 256, 512, 1024]
            }
        }

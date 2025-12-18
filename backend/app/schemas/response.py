"""
Pydantic Response Models
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any


class CurvePoint(BaseModel):
    """A single point on the curve."""
    x: float
    y: float


class ShapeData(BaseModel):
    """Data for visualizing integration shapes."""
    type: str  # 'trapezoid', 'rectangle', 'parabola'
    x0: float
    x1: float
    y0: Optional[float] = None
    y1: Optional[float] = None
    y: Optional[float] = None  # For rectangles
    x2: Optional[float] = None  # For parabolas
    y2: Optional[float] = None  # For parabolas


class CalculateResponse(BaseModel):
    """Response model for single calculation endpoint."""
    
    function_id: Optional[str] = None
    function_name: Optional[str] = None
    function_latex: Optional[str] = None
    method: str
    a: float
    b: float
    n: int
    h: float  # Step size
    approximation: float
    exact_value: float
    absolute_error: float
    relative_error: float
    curve: List[CurvePoint]
    shapes: List[Dict[str, Any]]
    
    class Config:
        json_schema_extra = {
            "example": {
                "function_id": "smooth_sin",
                "function_name": "sin(x)",
                "function_latex": "\\sin(x)",
                "method": "simpson",
                "a": 0,
                "b": 3.14159,
                "n": 10,
                "h": 0.314159,
                "approximation": 1.9998,
                "exact_value": 2.0,
                "absolute_error": 0.0002,
                "relative_error": 0.0001,
                "curve": [{"x": 0, "y": 0}, {"x": 0.1, "y": 0.0998}],
                "shapes": []
            }
        }


class MethodResult(BaseModel):
    """Result for a single method at a specific N value."""
    n: int
    h: float
    approx: float
    abs_error: float
    rel_error: float
    eoc: Optional[float] = None


class AnalyzeResponse(BaseModel):
    """Response model for convergence analysis endpoint."""
    
    function_id: Optional[str] = None
    function_name: Optional[str] = None
    function_latex: Optional[str] = None
    a: float
    b: float
    exact_value: float
    exact_error_estimate: float
    results: Dict[str, List[MethodResult]]
    winner: Optional[str] = None
    improvements: Dict[str, float] = {}
    win_counts: Optional[Dict[str, int]] = None  # Win count per method across all N values
    
    class Config:
        json_schema_extra = {
            "example": {
                "function_id": "smooth_sin",
                "exact_value": 2.0,
                "results": {
                    "trapezoidal": [
                        {"n": 4, "h": 0.785, "approx": 1.896, "abs_error": 0.103, "rel_error": 0.05, "eoc": None}
                    ]
                },
                "winner": "simpson"
            }
        }


class FunctionInfo(BaseModel):
    """Information about a test function."""
    id: str
    name: str
    latex: str
    category: str
    default_a: float
    default_b: float
    best_method: Optional[str] = "simpson"
    description: Optional[str] = ""


class FunctionListResponse(BaseModel):
    """Response model for listing available functions."""
    functions: List[FunctionInfo]

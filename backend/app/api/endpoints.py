"""
API Endpoints

Provides:
- POST /api/calculate - Single approximation with visualization data
- POST /api/analyze - Convergence analysis for log-log plots
- GET /api/functions - List available test functions
"""

from fastapi import APIRouter, HTTPException
from typing import Callable

from ..schemas.request import CalculateRequest, AnalyzeRequest
from ..schemas.response import (
    CalculateResponse,
    AnalyzeResponse,
    FunctionListResponse,
    FunctionInfo,
    MethodResult,
)
from ..services.functions import (
    get_function,
    get_function_info,
    list_functions,
    parse_custom_expression,
    FUNCTIONS,
)
from ..services.integration import (
    compute_integral,
    exact_integral,
    get_visualization_data,
)
from ..services.analysis import analyze_convergence, calculate_errors

router = APIRouter(prefix="/api", tags=["integration"])


def get_func_from_request(
    function_id: str | None,
    custom_expression: str | None
) -> tuple[Callable, dict | None]:
    """
    Get the function to integrate from the request parameters.
    Returns the function and optional function info.
    """
    if function_id:
        try:
            func = get_function(function_id)
            info = get_function_info(function_id)
            return func, info
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
    elif custom_expression:
        try:
            func = parse_custom_expression(custom_expression)
            return func, None
        except (ValueError, SyntaxError) as e:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid expression: {str(e)}"
            )
    else:
        raise HTTPException(
            status_code=400,
            detail="Either function_id or custom_expression must be provided"
        )


@router.get("/functions", response_model=FunctionListResponse)
async def get_functions():
    """
    List all available test functions.
    
    Returns function IDs, names, LaTeX representations, categories,
    and default integration bounds.
    """
    funcs = list_functions()
    return FunctionListResponse(
        functions=[
            FunctionInfo(
                id=fid,
                name=info["name"],
                latex=info["latex"],
                category=info["category"],
                default_a=info["default_a"],
                default_b=info["default_b"],
                best_method=info.get("best_method", "simpson"),
                description=info.get("description", ""),
            )
            for fid, info in funcs.items()
        ]
    )


@router.post("/calculate", response_model=CalculateResponse)
async def calculate(request: CalculateRequest):
    """
    Calculate a single approximation and return visualization data.
    
    Computes the integral using the specified method and returns:
    - The approximation value
    - Exact value for comparison
    - Error metrics
    - Curve points for plotting
    - Shape data for visualizing the integration method
    """
    # Validate method
    valid_methods = ["trapezoidal", "midpoint", "simpson"]
    if request.method not in valid_methods:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid method. Must be one of: {valid_methods}"
        )
    
    # Validate bounds
    if request.a >= request.b:
        raise HTTPException(
            status_code=400,
            detail="Lower bound 'a' must be less than upper bound 'b'"
        )
    
    # Get function
    func, func_info = get_func_from_request(
        request.function_id,
        request.custom_expression
    )
    
    # Compute approximation
    try:
        approx = compute_integral(func, request.a, request.b, request.n, request.method)
        exact_val, _ = exact_integral(func, request.a, request.b)
        errors = calculate_errors(approx, exact_val)
        viz_data = get_visualization_data(
            func, request.a, request.b, request.n, request.method
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Computation error: {str(e)}")
    
    h = (request.b - request.a) / request.n
    
    return CalculateResponse(
        function_id=request.function_id,
        function_name=func_info["name"] if func_info else request.custom_expression,
        function_latex=func_info["latex"] if func_info else request.custom_expression,
        method=request.method,
        a=request.a,
        b=request.b,
        n=request.n,
        h=h,
        approximation=approx,
        exact_value=exact_val,
        absolute_error=errors["absolute_error"],
        relative_error=errors["relative_error"],
        curve=viz_data["curve"],
        shapes=viz_data["shapes"],
    )


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze(request: AnalyzeRequest):
    """
    Perform convergence analysis for the specified methods.
    
    Computes the integral for each method and N value, calculating:
    - Approximation values
    - Absolute and relative errors
    - Experimental Order of Convergence (EOC)
    
    Returns data suitable for log-log error plots and comparison tables.
    """
    # Validate methods
    valid_methods = ["trapezoidal", "midpoint", "simpson"]
    for method in request.methods:
        if method not in valid_methods:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid method '{method}'. Must be one of: {valid_methods}"
            )
    
    # Validate bounds
    if request.a >= request.b:
        raise HTTPException(
            status_code=400,
            detail="Lower bound 'a' must be less than upper bound 'b'"
        )
    
    # Validate n_values
    for n in request.n_values:
        if n < 1:
            raise HTTPException(
                status_code=400,
                detail="All N values must be positive integers"
            )
    
    # Get function
    func, func_info = get_func_from_request(
        request.function_id,
        request.custom_expression
    )
    
    # Perform analysis
    try:
        analysis = analyze_convergence(
            func,
            request.a,
            request.b,
            request.methods,
            request.n_values,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis error: {str(e)}")
    
    # Convert results to response format
    results = {}
    for method, method_results in analysis["results"].items():
        results[method] = [
            MethodResult(
                n=r["n"],
                h=r["h"],
                approx=r["approx"],
                abs_error=r["abs_error"],
                rel_error=r["rel_error"],
                eoc=r["eoc"],
            )
            for r in method_results
        ]
    
    return AnalyzeResponse(
        function_id=request.function_id,
        function_name=func_info["name"] if func_info else request.custom_expression,
        function_latex=func_info["latex"] if func_info else request.custom_expression,
        a=request.a,
        b=request.b,
        exact_value=analysis["exact_value"],
        exact_error_estimate=analysis["exact_error_estimate"],
        results=results,
        winner=analysis["winner"],
        improvements=analysis["improvements"],
    )

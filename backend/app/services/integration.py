"""
Numerical Integration Methods

Implements:
- Trapezoidal Rule
- Midpoint Rule
- Simpson's Rule
- Exact Integration (using scipy.integrate.quad)
"""

import numpy as np
from scipy import integrate
from typing import Callable, Tuple, List, Dict, Any


def trapezoidal_rule(func: Callable[[float], float], a: float, b: float, n: int) -> float:
    """
    Approximate the integral of func from a to b using the Trapezoidal Rule.
    
    The trapezoidal rule approximates the integral by dividing the interval [a, b]
    into n subintervals and summing the areas of trapezoids.
    
    Formula: (h/2) * [f(a) + 2*sum(f(x_i)) + f(b)]
    where h = (b-a)/n
    
    Args:
        func: The function to integrate
        a: Lower bound of integration
        b: Upper bound of integration
        n: Number of subintervals
        
    Returns:
        Approximation of the integral
    """
    h = (b - a) / n
    x = np.linspace(a, b, n + 1)
    y = np.array([func(xi) for xi in x])
    
    # Trapezoidal formula: h/2 * (f(a) + 2*sum(f(x_i)) + f(b))
    result = (h / 2) * (y[0] + 2 * np.sum(y[1:-1]) + y[-1])
    return float(result)


def midpoint_rule(func: Callable[[float], float], a: float, b: float, n: int) -> float:
    """
    Approximate the integral of func from a to b using the Midpoint Rule.
    
    The midpoint rule approximates the integral by dividing the interval [a, b]
    into n subintervals and summing the areas of rectangles with heights
    evaluated at the midpoint of each subinterval.
    
    Formula: h * sum(f(x_i + h/2))
    where h = (b-a)/n
    
    Args:
        func: The function to integrate
        a: Lower bound of integration
        b: Upper bound of integration
        n: Number of subintervals
        
    Returns:
        Approximation of the integral
    """
    h = (b - a) / n
    # Midpoints of each subinterval
    midpoints = np.array([a + (i + 0.5) * h for i in range(n)])
    y = np.array([func(xi) for xi in midpoints])
    
    result = h * np.sum(y)
    return float(result)


def simpsons_rule(func: Callable[[float], float], a: float, b: float, n: int) -> float:
    """
    Approximate the integral of func from a to b using Simpson's Rule.
    
    Simpson's rule uses quadratic polynomials to approximate the function
    over pairs of subintervals, providing higher accuracy for smooth functions.
    
    Formula: (h/3) * [f(a) + 4*sum(f(x_odd)) + 2*sum(f(x_even)) + f(b)]
    where h = (b-a)/n and n must be even
    
    Args:
        func: The function to integrate
        a: Lower bound of integration
        b: Upper bound of integration
        n: Number of subintervals (must be even)
        
    Returns:
        Approximation of the integral
    """
    # Ensure n is even
    if n % 2 != 0:
        n += 1
    
    h = (b - a) / n
    x = np.linspace(a, b, n + 1)
    y = np.array([func(xi) for xi in x])
    
    # Simpson's formula: h/3 * (f(a) + 4*sum(f_odd) + 2*sum(f_even) + f(b))
    result = (h / 3) * (y[0] + 4 * np.sum(y[1:-1:2]) + 2 * np.sum(y[2:-1:2]) + y[-1])
    return float(result)


def exact_integral(func: Callable[[float], float], a: float, b: float) -> Tuple[float, float]:
    """
    Calculate the "exact" integral using scipy.integrate.quad.
    
    This provides a reference value for error calculation.
    
    Args:
        func: The function to integrate
        a: Lower bound of integration
        b: Upper bound of integration
        
    Returns:
        Tuple of (integral value, estimated error)
    """
    result, error = integrate.quad(func, a, b)
    return float(result), float(error)


def get_visualization_data(
    func: Callable[[float], float],
    a: float,
    b: float,
    n: int,
    method: str,
    num_curve_points: int = 200
) -> Dict[str, Any]:
    """
    Generate data for visualizing the numerical integration method.
    
    Args:
        func: The function to integrate
        a: Lower bound
        b: Upper bound
        n: Number of subintervals
        method: 'trapezoidal', 'midpoint', or 'simpson'
        num_curve_points: Number of points for the smooth curve
        
    Returns:
        Dictionary containing curve points and shape data for visualization
    """
    h = (b - a) / n
    
    # Generate smooth curve points
    curve_x = np.linspace(a, b, num_curve_points)
    curve_y = np.array([func(xi) for xi in curve_x])
    
    curve_points = [{"x": float(x), "y": float(y)} for x, y in zip(curve_x, curve_y)]
    
    # Generate shape data based on method
    shapes = []
    
    if method == "trapezoidal":
        # Trapezoids
        x_points = np.linspace(a, b, n + 1)
        for i in range(n):
            x0, x1 = x_points[i], x_points[i + 1]
            y0, y1 = func(x0), func(x1)
            shapes.append({
                "type": "trapezoid",
                "x0": float(x0),
                "x1": float(x1),
                "y0": float(y0),
                "y1": float(y1),
            })
    
    elif method == "midpoint":
        # Rectangles at midpoints
        for i in range(n):
            x0 = a + i * h
            x1 = x0 + h
            mid = (x0 + x1) / 2
            y_mid = func(mid)
            shapes.append({
                "type": "rectangle",
                "x0": float(x0),
                "x1": float(x1),
                "y": float(y_mid),
            })
    
    elif method == "simpson":
        # Simpson's uses parabolas, we'll show as filled areas
        if n % 2 != 0:
            n += 1
        x_points = np.linspace(a, b, n + 1)
        for i in range(0, n, 2):
            x0, x1, x2 = x_points[i], x_points[i + 1], x_points[i + 2]
            y0, y1, y2 = func(x0), func(x1), func(x2)
            shapes.append({
                "type": "parabola",
                "x0": float(x0),
                "x1": float(x1),
                "x2": float(x2),
                "y0": float(y0),
                "y1": float(y1),
                "y2": float(y2),
            })
    
    return {
        "curve": curve_points,
        "shapes": shapes,
    }


def compute_integral(
    func: Callable[[float], float],
    a: float,
    b: float,
    n: int,
    method: str
) -> float:
    """
    Compute integral using the specified method.
    
    Args:
        func: The function to integrate
        a: Lower bound
        b: Upper bound
        n: Number of subintervals
        method: 'trapezoidal', 'midpoint', or 'simpson'
        
    Returns:
        Approximation of the integral
    """
    if method == "trapezoidal":
        return trapezoidal_rule(func, a, b, n)
    elif method == "midpoint":
        return midpoint_rule(func, a, b, n)
    elif method == "simpson":
        return simpsons_rule(func, a, b, n)
    else:
        raise ValueError(f"Unknown method: {method}")

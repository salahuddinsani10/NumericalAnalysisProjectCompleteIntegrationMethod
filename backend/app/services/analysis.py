"""
Convergence Analysis Service

Provides error calculation and Experimental Order of Convergence (EOC) computation.
"""

import numpy as np
from typing import Callable, List, Dict, Any, Optional
from .integration import compute_integral, exact_integral


def calculate_errors(
    approx_value: float,
    exact_value: float
) -> Dict[str, float]:
    """
    Calculate absolute and relative errors.
    
    Args:
        approx_value: The approximate integral value
        exact_value: The exact (reference) integral value
        
    Returns:
        Dictionary with absolute_error and relative_error
    """
    abs_error = abs(approx_value - exact_value)
    
    if exact_value != 0:
        rel_error = abs_error / abs(exact_value)
    else:
        rel_error = abs_error if abs_error != 0 else 0.0
    
    return {
        "absolute_error": abs_error,
        "relative_error": rel_error,
    }


def calculate_eoc(error1: float, error2: float, n1: int, n2: int) -> Optional[float]:
    """
    Calculate the Experimental Order of Convergence.
    
    EOC = ln(Error1 / Error2) / ln(n2 / n1)
    
    This tells us the rate at which the error decreases as n increases.
    Theoretically:
    - Trapezoidal: EOC ≈ 2
    - Midpoint: EOC ≈ 2
    - Simpson's: EOC ≈ 4
    
    Args:
        error1: Error at n1 subintervals
        error2: Error at n2 subintervals
        n1: First number of subintervals
        n2: Second number of subintervals (should be > n1)
        
    Returns:
        EOC value or None if calculation is not possible
    """
    if error1 <= 0 or error2 <= 0 or n1 <= 0 or n2 <= 0:
        return None
    
    if n2 == n1:
        return None
    
    try:
        eoc = np.log(error1 / error2) / np.log(n2 / n1)
        return float(eoc)
    except (ValueError, ZeroDivisionError):
        return None


def analyze_convergence(
    func: Callable[[float], float],
    a: float,
    b: float,
    methods: List[str],
    n_values: List[int]
) -> Dict[str, Any]:
    """
    Perform convergence analysis for the given function and methods.
    
    Computes integral approximations for each method and n value,
    then calculates errors and EOC.
    
    Args:
        func: The function to integrate
        a: Lower bound
        b: Upper bound
        methods: List of methods ('trapezoidal', 'midpoint', 'simpson')
        n_values: List of n values to test (e.g., [4, 8, 16, 32, ...])
        
    Returns:
        Dictionary containing exact value and results for each method
    """
    # Get exact value
    exact_val, exact_err = exact_integral(func, a, b)
    
    results = {}
    
    for method in methods:
        method_results = []
        prev_error = None
        prev_n = None
        
        for n in sorted(n_values):
            # Compute approximation
            approx = compute_integral(func, a, b, n, method)
            
            # Calculate errors
            errors = calculate_errors(approx, exact_val)
            
            # Calculate EOC (compare with previous n)
            eoc = None
            if prev_error is not None and prev_n is not None:
                eoc = calculate_eoc(prev_error, errors["absolute_error"], prev_n, n)
            
            method_results.append({
                "n": n,
                "h": (b - a) / n,  # Step size
                "approx": approx,
                "abs_error": errors["absolute_error"],
                "rel_error": errors["relative_error"],
                "eoc": eoc,
            })
            
            prev_error = errors["absolute_error"]
            prev_n = n
        
        results[method] = method_results
    
    # Determine winner by counting which method wins across all N values
    # This gives more weight to practical N ranges
    win_counts = {method: 0 for method in methods}
    
    for i in range(len(n_values)):
        errors_at_n = {}
        for method in methods:
            if len(results[method]) > i:
                errors_at_n[method] = results[method][i]["abs_error"]
        
        if errors_at_n:
            # Find the minimum error at this N
            min_error = min(errors_at_n.values())
            # All methods with this minimum error get a win (handles ties)
            for method, error in errors_at_n.items():
                if error == min_error:
                    win_counts[method] += 1
    
    # Winner is the method with most wins
    # If tied, use the method with smallest final error
    max_wins = max(win_counts.values()) if win_counts else 0
    tied_methods = [m for m, w in win_counts.items() if w == max_wins]
    
    if len(tied_methods) == 1:
        winner = tied_methods[0]
    else:
        # Tie-breaker: smallest final error among tied methods
        final_errors = {}
        for method in tied_methods:
            if results[method]:
                final_errors[method] = results[method][-1]["abs_error"]
        winner = min(final_errors, key=final_errors.get) if final_errors else tied_methods[0]
    
    # Calculate improvement ratios based on final errors
    final_errors = {}
    for method, method_results in results.items():
        if method_results:
            final_errors[method] = method_results[-1]["abs_error"]
    
    improvements = {}
    if winner and len(final_errors) > 1:
        winner_error = final_errors.get(winner, 0)
        for method, error in final_errors.items():
            if method != winner and winner_error > 0:
                improvements[method] = error / winner_error
    
    return {
        "exact_value": exact_val,
        "exact_error_estimate": exact_err,
        "results": results,
        "winner": winner,
        "improvements": improvements,
        "win_counts": win_counts,  # Added for transparency
    }


def get_theoretical_eoc(method: str) -> float:
    """
    Get the theoretical EOC for a method.
    
    Returns:
        2.0 for Trapezoidal and Midpoint, 4.0 for Simpson's
    """
    if method in ["trapezoidal", "midpoint"]:
        return 2.0
    elif method == "simpson":
        return 4.0
    else:
        return 0.0

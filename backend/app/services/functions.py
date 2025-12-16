"""
Test Function Library for Numerical Integration

Contains 6 functions grouped into 3 categories:
- Smooth: sin(x), e^x
- Mild Curvature: 1/(1+x²), √(1+x)
- Turning Points: x³ - 3x, cos(5x)
"""

import numpy as np
from typing import Callable, Dict, Any
import ast
import operator

# Define all test functions with their metadata
FUNCTIONS: Dict[str, Dict[str, Any]] = {
    # ========== SMOOTH FUNCTIONS (Simpson's excels) ==========
    "smooth_sin": {
        "name": "sin(x)",
        "latex": r"\sin(x)",
        "category": "Smooth",
        "func": lambda x: np.sin(x),
        "default_a": 0,
        "default_b": np.pi,
        "best_method": "simpson",
        "description": "Classic smooth periodic function",
    },
    "smooth_exp": {
        "name": "e^x",
        "latex": r"e^x",
        "category": "Smooth",
        "func": lambda x: np.exp(x),
        "default_a": 0,
        "default_b": 1,
        "best_method": "simpson",
        "description": "Exponential growth - infinitely differentiable",
    },
    
    # ========== TRAPEZOIDAL BEST (Linear or near-linear) ==========
    "trap_linear": {
        "name": "2x + 1",
        "latex": r"2x + 1",
        "category": "Trapezoidal Best",
        "func": lambda x: 2*x + 1,
        "default_a": 0,
        "default_b": 5,
        "best_method": "trapezoidal",
        "description": "Linear function - Trapezoidal is EXACT for linear functions!",
    },
    "trap_piecewise": {
        "name": "|x - 1|",
        "latex": r"|x - 1|",
        "category": "Trapezoidal Best",
        "func": lambda x: np.abs(x - 1),
        "default_a": 0,
        "default_b": 2,
        "best_method": "trapezoidal",
        "description": "Piecewise linear (V-shape) - Trapezoidal handles corners well",
    },
    
    # ========== MIDPOINT BEST (Symmetric or special properties) ==========
    "mid_quadratic": {
        "name": "x² - 2x",
        "latex": r"x^2 - 2x",
        "category": "Midpoint Best",
        "func": lambda x: x**2 - 2*x,
        "default_a": 0,
        "default_b": 3,
        "best_method": "midpoint",
        "description": "Quadratic - Midpoint has better error cancellation",
    },
    "mid_symmetric": {
        "name": "x⁴ - x²",
        "latex": r"x^4 - x^2",
        "category": "Midpoint Best",
        "func": lambda x: x**4 - x**2,
        "default_a": -1,
        "default_b": 1,
        "best_method": "midpoint",
        "description": "Symmetric function - errors cancel at midpoints",
    },
    
    # ========== MILD CURVATURE ==========
    "mild_rational": {
        "name": "1/(1+x²)",
        "latex": r"\frac{1}{1+x^2}",
        "category": "Mild Curvature",
        "func": lambda x: 1 / (1 + x**2),
        "default_a": 0,
        "default_b": 1,
        "best_method": "simpson",
        "description": "Rational function with gentle curve",
    },
    "mild_sqrt": {
        "name": "√(1+x)",
        "latex": r"\sqrt{1+x}",
        "category": "Mild Curvature",
        "func": lambda x: np.sqrt(1 + x),
        "default_a": 0,
        "default_b": 3,
        "best_method": "simpson",
        "description": "Square root - smooth but with decreasing derivative",
    },
    
    # ========== TURNING POINTS (Oscillating) ==========
    "turning_cubic": {
        "name": "x³ - 3x",
        "latex": r"x^3 - 3x",
        "category": "Turning Points",
        "func": lambda x: x**3 - 3*x,
        "default_a": -2,
        "default_b": 2,
        "best_method": "simpson",
        "description": "Cubic with local max and min",
    },
    "turning_cos5x": {
        "name": "cos(5x)",
        "latex": r"\cos(5x)",
        "category": "Turning Points",
        "func": lambda x: np.cos(5 * x),
        "default_a": 0,
        "default_b": np.pi,
        "best_method": "simpson",
        "description": "High frequency oscillation - needs more intervals",
    },
    
    # ========== DISCONTINUITIES (Challenging cases) ==========
    "disc_step": {
        "name": "step(x-0.5)",
        "latex": r"\text{step}(x - 0.5)",
        "category": "Challenging",
        "func": lambda x: np.where(x < 0.5, 0.0, 1.0),
        "default_a": 0,
        "default_b": 1,
        "best_method": "midpoint",
        "description": "Step function - all methods struggle with discontinuities",
    },
    "disc_sawtooth": {
        "name": "x mod 0.5",
        "latex": r"x \\mod 0.5",
        "category": "Challenging",
        "func": lambda x: np.mod(x, 0.5),
        "default_a": 0,
        "default_b": 2,
        "best_method": "trapezoidal",
        "description": "Sawtooth wave - periodic with sharp corners",
    },
}


def get_function(function_id: str) -> Callable[[float], float]:
    """Get a function by its ID."""
    if function_id in FUNCTIONS:
        return FUNCTIONS[function_id]["func"]
    raise ValueError(f"Unknown function ID: {function_id}")


def get_function_info(function_id: str) -> Dict[str, Any]:
    """Get function metadata by its ID."""
    if function_id in FUNCTIONS:
        return FUNCTIONS[function_id]
    raise ValueError(f"Unknown function ID: {function_id}")


def list_functions() -> Dict[str, Dict[str, Any]]:
    """List all available functions with their metadata."""
    return {
        fid: {
            "name": info["name"],
            "latex": info["latex"],
            "category": info["category"],
            "default_a": float(info["default_a"]),
            "default_b": float(info["default_b"]),
            "best_method": info.get("best_method", "simpson"),
            "description": info.get("description", ""),
        }
        for fid, info in FUNCTIONS.items()
    }


# Safe expression parser for custom functions
class SafeExpressionParser:
    """
    Safely parse and evaluate mathematical expressions.
    Only allows safe mathematical operations.
    """
    
    ALLOWED_NAMES = {
        'x': None,  # Will be set during evaluation
        'sin': np.sin,
        'cos': np.cos,
        'tan': np.tan,
        'exp': np.exp,
        'log': np.log,
        'sqrt': np.sqrt,
        'abs': np.abs,
        'pi': np.pi,
        'e': np.e,
    }
    
    ALLOWED_OPERATORS = {
        ast.Add: operator.add,
        ast.Sub: operator.sub,
        ast.Mult: operator.mul,
        ast.Div: operator.truediv,
        ast.Pow: operator.pow,
        ast.USub: operator.neg,
        ast.UAdd: operator.pos,
    }
    
    def __init__(self, expression: str):
        self.expression = expression
        self.tree = ast.parse(expression, mode='eval')
        self._validate(self.tree.body)
    
    def _validate(self, node):
        """Validate that the AST only contains allowed operations."""
        if isinstance(node, ast.Constant):
            if not isinstance(node.value, (int, float)):
                raise ValueError(f"Invalid constant type: {type(node.value)}")
        elif isinstance(node, ast.Name):
            if node.id not in self.ALLOWED_NAMES:
                raise ValueError(f"Unknown name: {node.id}")
        elif isinstance(node, ast.BinOp):
            if type(node.op) not in self.ALLOWED_OPERATORS:
                raise ValueError(f"Unsupported operator: {type(node.op).__name__}")
            self._validate(node.left)
            self._validate(node.right)
        elif isinstance(node, ast.UnaryOp):
            if type(node.op) not in self.ALLOWED_OPERATORS:
                raise ValueError(f"Unsupported operator: {type(node.op).__name__}")
            self._validate(node.operand)
        elif isinstance(node, ast.Call):
            if not isinstance(node.func, ast.Name):
                raise ValueError("Only simple function calls allowed")
            if node.func.id not in self.ALLOWED_NAMES:
                raise ValueError(f"Unknown function: {node.func.id}")
            for arg in node.args:
                self._validate(arg)
        else:
            raise ValueError(f"Unsupported expression type: {type(node).__name__}")
    
    def _eval(self, node, x):
        """Evaluate the AST with the given x value."""
        if isinstance(node, ast.Constant):
            return node.value
        elif isinstance(node, ast.Name):
            if node.id == 'x':
                return x
            return self.ALLOWED_NAMES[node.id]
        elif isinstance(node, ast.BinOp):
            left = self._eval(node.left, x)
            right = self._eval(node.right, x)
            return self.ALLOWED_OPERATORS[type(node.op)](left, right)
        elif isinstance(node, ast.UnaryOp):
            operand = self._eval(node.operand, x)
            return self.ALLOWED_OPERATORS[type(node.op)](operand)
        elif isinstance(node, ast.Call):
            func = self.ALLOWED_NAMES[node.func.id]
            args = [self._eval(arg, x) for arg in node.args]
            return func(*args)
        raise ValueError(f"Cannot evaluate: {type(node).__name__}")
    
    def evaluate(self, x: float) -> float:
        """Evaluate the expression for a given x value."""
        return self._eval(self.tree.body, x)
    
    def get_function(self) -> Callable[[float], float]:
        """Return a callable function."""
        return lambda x: self.evaluate(x)


def parse_custom_expression(expression: str) -> Callable[[float], float]:
    """
    Parse a custom mathematical expression and return a callable function.
    
    Supported operations: +, -, *, /, **
    Supported functions: sin, cos, tan, exp, log, sqrt, abs
    Supported constants: pi, e
    Variable: x
    
    Example: "x**2 + 2*x + sin(x)"
    """
    parser = SafeExpressionParser(expression)
    return parser.get_function()

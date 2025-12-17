# Numerical Analysis
## Project Report

---

**Name:** [Your Name] ([Roll Number])  
&emsp;&emsp;&emsp;&emsp;[Partner Name] ([Roll Number])  
&emsp;&emsp;&emsp;&emsp;[Partner Name] ([Roll Number])

**Lecturer:** [Lecturer Name]

**Date:** 17th December 2025

---

**Department of Software Engineering**  
**Bahria University**  
**Islamabad**

---

## Table of Contents

1. [Problem Statement](#1-problem-statement)
2. [Proposed Solution](#2-proposed-solution)
3. [Methodology and Approach](#3-methodology-and-approach)
4. [Implementation Details](#4-implementation-details)
5. [Mathematical Foundations](#5-mathematical-foundations)
6. [Error Analysis and Convergence](#6-error-analysis-and-convergence)
7. [Results and Analysis](#7-results-and-analysis)
8. [Deployment Architecture](#8-deployment-architecture)
9. [UI Implementation](#9-ui-implementation)
10. [Conclusion](#10-conclusion)
11. [References](#11-references)

---

## 1. Problem Statement

### 1.1 The Conceptual Gap in Numerical Integration Learning

In numerical analysis, understanding the differences between various numerical integration methods is a significant challenge for students. While textbooks provide theoretical formulas, the practical understanding of how these methods behave with different types of functions—their accuracy, convergence rates, and appropriate use cases—remains abstract without hands-on experimentation.

Traditional learning approaches lack a dynamic environment to:
- Visualize how each integration method approximates the area under a curve
- Compare the accuracy of different methods in real-time
- Observe convergence behavior as the number of subintervals increases
- Understand which method is optimal for different function characteristics

### 1.2 Specific Issues Addressed

1. **Method Selection Ambiguity:** Choosing between Trapezoidal, Midpoint, and Simpson's Rule is often non-intuitive. Students struggle to understand when each method performs best and why.

2. **Invisible Error Behavior:** The error properties of numerical integration methods are the "black box" of the learning process. Students memorize error formulas but rarely observe how errors actually decrease with increasing $n$.

3. **Abstract Convergence Theory:** The Experimental Order of Convergence (EOC) is a crucial concept, but calculating and visualizing it manually is tedious and error-prone.

4. **Limited Function Exploration:** Textbook examples typically use only simple functions. Students rarely explore how methods behave with challenging functions like discontinuities, high-frequency oscillations, or piecewise functions.

5. **Custom Function Testing:** Students often want to test their own mathematical expressions but lack the tools to safely parse and evaluate custom functions.

---

## 2. Proposed Solution

### 2.1 The Integration Methods Comparator Dashboard

The **Numerical Integration Dashboard** is an interactive, web-based educational laboratory designed to bridge the gap between theoretical integration formulas and practical computational understanding. It serves as a comprehensive environment that visualizes methods, computes errors, and demonstrates convergence behavior.

### 2.2 Key Objectives

- **Compare Integration Methods:** Provide native implementations of Trapezoidal Rule, Midpoint Rule, and Simpson's Rule with side-by-side comparison capabilities.

- **Interactive Visualization:** Display the geometric interpretation of each method—trapezoids, rectangles, and parabolic segments—overlaid on the actual function curve.

- **Convergence Analysis:** Automatically compute and display error metrics, including the Experimental Order of Convergence (EOC), confirming theoretical predictions.

- **Function Library:** Offer a curated library of 12 test functions across 6 categories, each demonstrating different method strengths.

- **Custom Expression Support:** Allow users to input and evaluate arbitrary mathematical expressions safely.

- **Pedagogical Focus:** Present results with LaTeX-rendered mathematics for professional, publication-quality output.

### 2.3 Target Audience

- Undergraduate students studying Numerical Analysis
- Instructors demonstrating integration concepts
- Researchers validating integration implementations
- Engineers requiring quick numerical integration estimates

---

## 3. Methodology and Approach

### 3.1 Technical Architecture

The application is built as a modern full-stack web application with clear separation of concerns:

#### Frontend (Client-Side)
- **Framework:** React 19+ with functional components and hooks
- **Build Tool:** Vite 7+ for fast development and optimized production builds
- **Styling:** Tailwind CSS 4+ for responsive, utility-first design
- **Mathematics Rendering:** KaTeX for LaTeX-formatted mathematical expressions
- **Data Visualization:** Recharts for interactive charts and graphs
- **HTTP Client:** Axios for API communication

#### Backend (Server-Side)
- **Framework:** FastAPI 0.109+ for high-performance Python API
- **Mathematical Computing:** NumPy 2.3+ for numerical operations
- **Scientific Computing:** SciPy 1.16+ for reference "exact" integration (quad)
- **Data Validation:** Pydantic 2.6+ for request/response schema validation
- **ASGI Server:** Uvicorn for production deployment

### 3.2 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                             │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────────┐  │
│  │   Function  │  │   Method     │  │     Visualization      │  │
│  │   Selector  │  │   Controls   │  │        Canvas          │  │
│  └─────────────┘  └──────────────┘  └────────────────────────┘  │
│                           │                                      │
│              ┌────────────▼────────────┐                        │
│              │      React Frontend     │                        │
│              │   (Vite + Tailwind)     │                        │
│              └────────────┬────────────┘                        │
└───────────────────────────┼─────────────────────────────────────┘
                            │ HTTPS (REST API)
                            ▼
┌───────────────────────────────────────────────────────────────────┐
│                      FASTAPI BACKEND                               │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                     API Endpoints                            │  │
│  │   POST /api/calculate    POST /api/analyze                   │  │
│  │   GET /api/functions     GET /health                         │  │
│  └─────────────────────────────────────────────────────────────┘  │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────────┐   │
│  │  Functions  │  │  Integration │  │     Analysis           │   │
│  │   Service   │  │   Service    │  │     Service            │   │
│  └─────────────┘  └──────────────┘  └────────────────────────┘   │
│                           │                                       │
│              ┌────────────▼────────────┐                         │
│              │   NumPy + SciPy Core    │                         │
│              └─────────────────────────┘                         │
└───────────────────────────────────────────────────────────────────┘
```

### 3.3 Core Computational Approach

The application utilizes a layered service architecture:

1. **Functions Service:** Manages the test function library and safe parsing of custom expressions using Python's AST (Abstract Syntax Tree).

2. **Integration Service:** Implements the three numerical integration methods and generates visualization data for the geometric interpretation.

3. **Analysis Service:** Computes errors, EOC values, and determines the "winning" method for each comparison.

---

## 4. Implementation Details

### 4.1 Module 1: Test Function Library

The system provides **12 curated test functions** organized into **6 categories**, each designed to highlight different method characteristics:

| Category | Function | LaTeX | Best Method |
|----------|----------|-------|-------------|
| **Smooth** | sin(x) | $\sin(x)$ | Simpson's |
| **Smooth** | e^x | $e^x$ | Simpson's |
| **Trapezoidal Best** | 2x + 1 | $2x + 1$ | Trapezoidal |
| **Trapezoidal Best** | \|x - 1\| | $\|x - 1\|$ | Trapezoidal |
| **Midpoint Best** | x² - 2x | $x^2 - 2x$ | Midpoint |
| **Midpoint Best** | x⁴ - x² | $x^4 - x^2$ | Midpoint |
| **Mild Curvature** | 1/(1+x²) | $\frac{1}{1+x^2}$ | Simpson's |
| **Mild Curvature** | √(1+x) | $\sqrt{1+x}$ | Simpson's |
| **Turning Points** | x³ - 3x | $x^3 - 3x$ | Simpson's |
| **Turning Points** | cos(5x) | $\cos(5x)$ | Simpson's |
| **Challenging** | step(x-0.5) | Heaviside | Midpoint |
| **Challenging** | x mod 0.5 | Sawtooth | Trapezoidal |

#### Safe Custom Expression Parser

For user-defined functions, the system implements a **safe expression parser** using Python's AST module:

```python
class SafeExpressionParser:
    ALLOWED_NAMES = {
        'x': None,
        'sin': np.sin, 'cos': np.cos, 'tan': np.tan,
        'exp': np.exp, 'log': np.log, 'sqrt': np.sqrt,
        'abs': np.abs, 'pi': np.pi, 'e': np.e,
    }
    
    ALLOWED_OPERATORS = {
        ast.Add, ast.Sub, ast.Mult, ast.Div, ast.Pow,
        ast.USub, ast.UAdd,
    }
```

This ensures:
- **Security:** Only whitelisted functions and operators are allowed
- **No Code Injection:** Arbitrary Python code cannot be executed
- **Mathematical Completeness:** All common mathematical operations are supported

### 4.2 Module 2: Numerical Integration Methods

#### Trapezoidal Rule Implementation

The Trapezoidal Rule approximates the integral by summing areas of trapezoids:

$$I \approx \frac{h}{2}\left[f(a) + 2\sum_{i=1}^{n-1}f(x_i) + f(b)\right]$$

```python
def trapezoidal_rule(func, a, b, n):
    h = (b - a) / n
    x = np.linspace(a, b, n + 1)
    y = np.array([func(xi) for xi in x])
    result = (h / 2) * (y[0] + 2 * np.sum(y[1:-1]) + y[-1])
    return float(result)
```

#### Midpoint Rule Implementation

The Midpoint Rule uses rectangles with heights evaluated at subinterval midpoints:

$$I \approx h\sum_{i=0}^{n-1}f\left(x_i + \frac{h}{2}\right)$$

```python
def midpoint_rule(func, a, b, n):
    h = (b - a) / n
    midpoints = np.array([a + (i + 0.5) * h for i in range(n)])
    y = np.array([func(xi) for xi in midpoints])
    result = h * np.sum(y)
    return float(result)
```

#### Simpson's Rule Implementation

Simpson's Rule uses parabolic interpolation for higher accuracy:

$$I \approx \frac{h}{3}\left[f(a) + 4\sum_{i=1,3,5,...}^{n-1}f(x_i) + 2\sum_{i=2,4,6,...}^{n-2}f(x_i) + f(b)\right]$$

```python
def simpsons_rule(func, a, b, n):
    if n % 2 != 0:
        n += 1  # Simpson's requires even n
    h = (b - a) / n
    x = np.linspace(a, b, n + 1)
    y = np.array([func(xi) for xi in x])
    result = (h / 3) * (y[0] + 4 * np.sum(y[1:-1:2]) + 
                        2 * np.sum(y[2:-1:2]) + y[-1])
    return float(result)
```

### 4.3 Module 3: Visualization Data Generation

The system generates geometric shape data for visual representation:

```python
def get_visualization_data(func, a, b, n, method):
    shapes = []
    
    if method == "trapezoidal":
        # Generate trapezoid vertices
        for i in range(n):
            shapes.append({
                "type": "trapezoid",
                "x0": x_points[i], "x1": x_points[i+1],
                "y0": func(x0), "y1": func(x1),
            })
    
    elif method == "midpoint":
        # Generate rectangle data
        for i in range(n):
            shapes.append({
                "type": "rectangle",
                "x0": x0, "x1": x1,
                "y": func((x0 + x1) / 2),
            })
    
    elif method == "simpson":
        # Generate parabola control points
        for i in range(0, n, 2):
            shapes.append({
                "type": "parabola",
                "x0": x0, "x1": x1, "x2": x2,
                "y0": y0, "y1": y1, "y2": y2,
            })
    
    return {"curve": curve_points, "shapes": shapes}
```

### 4.4 Module 4: Interactive Calculator UI

The frontend includes a **premium interactive calculator** with:

- **Real-time LaTeX Preview:** Expressions are rendered in mathematical notation as the user types
- **Syntax Validation:** Immediate feedback on parenthesis balance, invalid operators, etc.
- **Quick Insert Buttons:** Common functions (sin, cos, exp, sqrt) and operators
- **Expression Normalization:** Automatic conversion of user-friendly syntax (e.g., `2x` → `2*x`, `x^2` → `x**2`)

```javascript
// Expression normalization for backend
const normalizeForBackend = (expr) => {
    return expr
        .replace(/\^/g, '**')           // ^ to **
        .replace(/(\d)([a-zA-Z])/g, '$1*$2')  // 2x → 2*x
        .replace(/\)(\(/g, ')*(')       // )( → )*(
};
```

---

## 5. Mathematical Foundations

### 5.1 Error Analysis Theory

Each numerical integration method has a characteristic error term:

| Method | Error Order | Error Formula |
|--------|-------------|---------------|
| **Trapezoidal** | $O(h^2)$ | $E_T = -\frac{(b-a)^3}{12n^2}f''(\xi)$ |
| **Midpoint** | $O(h^2)$ | $E_M = \frac{(b-a)^3}{24n^2}f''(\xi)$ |
| **Simpson's** | $O(h^4)$ | $E_S = -\frac{(b-a)^5}{180n^4}f^{(4)}(\xi)$ |

Where $\xi \in [a, b]$ and $h = (b-a)/n$.

### 5.2 Experimental Order of Convergence (EOC)

The EOC is calculated by comparing errors at two different values of $n$:

$$\text{EOC} = \frac{\ln(E_1 / E_2)}{\ln(n_2 / n_1)}$$

**Theoretical EOC Values:**
- Trapezoidal Rule: EOC ≈ 2
- Midpoint Rule: EOC ≈ 2
- Simpson's Rule: EOC ≈ 4

The dashboard computes EOC automatically, allowing users to verify these theoretical predictions experimentally.

### 5.3 Reference "Exact" Integration

For error calculation, the system uses SciPy's `quad` function as the reference:

```python
def exact_integral(func, a, b):
    result, error = integrate.quad(func, a, b)
    return float(result), float(error)
```

This adaptive quadrature method provides machine-precision accuracy for smooth functions.

---

## 6. Error Analysis and Convergence

### 6.1 Convergence Analysis Service

The analysis service performs comprehensive convergence studies:

```python
def analyze_convergence(func, a, b, methods, n_values):
    exact_val, exact_err = exact_integral(func, a, b)
    results = {}
    
    for method in methods:
        method_results = []
        prev_error, prev_n = None, None
        
        for n in sorted(n_values):
            approx = compute_integral(func, a, b, n, method)
            errors = calculate_errors(approx, exact_val)
            
            # Calculate EOC
            eoc = None
            if prev_error is not None:
                eoc = calculate_eoc(prev_error, errors["absolute_error"], 
                                   prev_n, n)
            
            method_results.append({
                "n": n, "h": (b-a)/n,
                "approx": approx,
                "abs_error": errors["absolute_error"],
                "rel_error": errors["relative_error"],
                "eoc": eoc,
            })
            
            prev_error = errors["absolute_error"]
            prev_n = n
        
        results[method] = method_results
    
    # Determine winning method
    winner = min(final_errors, key=final_errors.get)
    
    return {
        "exact_value": exact_val,
        "results": results,
        "winner": winner,
    }
```

### 6.2 Error Metrics Computed

For each calculation, the system provides:

1. **Absolute Error:** $|I_{approx} - I_{exact}|$
2. **Relative Error:** $\frac{|I_{approx} - I_{exact}|}{|I_{exact}|}$
3. **Step Size (h):** $(b-a)/n$
4. **EOC:** Computed between consecutive $n$ values

---

## 7. Results and Analysis

### 7.1 Educational Findings

Through the Integration Dashboard, users can experimentally verify key theoretical principles:

#### Convergence Rate Verification
- **Trapezoidal & Midpoint:** Users observe EOC values approaching 2.0 as $n$ increases
- **Simpson's Rule:** EOC values approach 4.0, demonstrating its superior convergence for smooth functions

#### Method-Specific Strengths
- **Linear Functions:** Trapezoidal Rule is **exact** for linear functions (EOC = ∞)
- **Symmetric Functions:** Midpoint Rule shows better error cancellation
- **Smooth Functions:** Simpson's Rule achieves dramatically lower errors

### 7.2 Practical Insights

1. **The "Best Method" Myth:** The dashboard reveals that the "best" method depends entirely on function characteristics—there is no universally superior method.

2. **Diminishing Returns:** Users can observe that beyond a certain $n$, further subdivision yields minimal accuracy improvement due to floating-point limitations.

3. **Challenging Functions:** Discontinuities and corners significantly degrade convergence, demonstrating why adaptive methods are often preferred in practice.

### 7.3 Performance Characteristics

| Metric | Backend | Frontend |
|--------|---------|----------|
| API Response Time | < 100ms (typical) | - |
| Calculation Time | < 50ms | - |
| Page Load Time | - | < 2s |
| Largest Contentful Paint | - | < 1.5s |

---

## 8. Deployment Architecture

### 8.1 Production Infrastructure

The application is deployed using modern cloud platforms:

| Component | Platform | URL |
|-----------|----------|-----|
| **Backend API** | Render.com | https://numericalanalysiscomparisian.onrender.com |
| **Frontend** | Vercel | https://numerical-analysis-project-complete-henna.vercel.app |

### 8.2 Continuous Deployment

Both platforms support automatic deployment on Git push:

```
GitHub Repository
        │
        ├──── Push to main branch
        │
        ├──► Render (Backend)
        │    └── Auto-build & deploy
        │
        └──► Vercel (Frontend)
             └── Auto-build & deploy
```

### 8.3 Environment Configuration

**Frontend Environment Variables:**
```
VITE_API_URL=https://numericalanalysiscomparisian.onrender.com/api
```

**Backend CORS Configuration:**
```python
CORS_ORIGINS = [
    "http://localhost:5173",
    "https://numerical-analysis-project-complete-henna.vercel.app",
    "https://numericalanalysiscomparisian.onrender.com",
]
```

---

## 9. UI Implementation

### 9.1 Main Dashboard Interface

[Screenshot Placeholder: Main Dashboard]

*Description: The main dashboard showing function selection, integration bounds input, and method controls.*

---

### 9.2 Function Selection Panel

[Screenshot Placeholder: Function Selection]

*Description: The function selector showing categorized test functions with LaTeX previews and the custom function calculator.*

---

### 9.3 Interactive Calculator

[Screenshot Placeholder: Math Calculator]

*Description: The premium calculator UI with real-time LaTeX preview, quick-insert buttons, and validation feedback.*

---

### 9.4 Visualization Canvas

[Screenshot Placeholder: Integration Visualization]

*Description: The visualization showing the function curve with trapezoids/rectangles/parabolas overlaid, demonstrating the geometric interpretation of each method.*

---

### 9.5 Convergence Analysis Results

[Screenshot Placeholder: Convergence Analysis]

*Description: The convergence analysis table showing n values, step sizes, approximations, errors, and EOC values for each method.*

---

### 9.6 Error Comparison Charts

[Screenshot Placeholder: Log-Log Error Plot]

*Description: Log-log plot of absolute error vs. number of subintervals, showing the convergence rates of all three methods.*

---

### 9.7 Method Comparison Summary

[Screenshot Placeholder: Winner Announcement]

*Description: The summary panel showing the winning method, improvement ratios, and method-specific insights.*

---

## 10. Conclusion

### 10.1 Achievements

The **Numerical Integration Comparator Dashboard** successfully transforms abstract integration formulas into a transparent, interactive learning experience. Key achievements include:

1. **Comprehensive Method Coverage:** All three classic integration methods implemented with accurate mathematical formulations.

2. **Rich Visualization:** Geometric interpretations help students develop intuition for how each method approximates integrals.

3. **Experimental Verification:** The EOC calculations allow students to experimentally verify theoretical convergence rates.

4. **Safe Custom Functions:** The AST-based parser enables exploration beyond preset functions while maintaining security.

5. **Production Deployment:** The application is accessible online for classroom use and self-study.

### 10.2 Learning Outcomes

Students using this dashboard can:
- Understand the geometric basis of numerical integration
- Compare method accuracy across different function types
- Verify theoretical error bounds experimentally
- Develop intuition for method selection in practical applications

### 10.3 Future Enhancements

Potential improvements for future versions:
- **Adaptive Quadrature:** Demonstrate adaptive subdivision methods
- **Higher-Order Methods:** Add Boole's Rule and Romberg integration
- **3D Integration:** Extend to double and triple integrals
- **Export Functionality:** Generate PDF reports of analysis results

---

## 11. References

1. Burden, R. L., & Faires, J. D. (2010). *Numerical Analysis* (9th ed.). Brooks/Cole.

2. Chapra, S. C., & Canale, R. P. (2015). *Numerical Methods for Engineers* (7th ed.). McGraw-Hill.

3. Press, W. H., et al. (2007). *Numerical Recipes: The Art of Scientific Computing* (3rd ed.). Cambridge University Press.

4. FastAPI Documentation. https://fastapi.tiangolo.com/

5. React Documentation. https://react.dev/

6. NumPy Documentation. https://numpy.org/doc/

7. SciPy Documentation. https://docs.scipy.org/doc/scipy/

---

## Appendix A: API Endpoint Reference

### GET /api/functions
Returns list of available test functions with metadata.

### POST /api/calculate
```json
{
  "function_id": "smooth_sin",
  "method": "simpson",
  "a": 0,
  "b": 3.14159,
  "n": 10
}
```

### POST /api/analyze
```json
{
  "function_id": "smooth_sin",
  "methods": ["trapezoidal", "midpoint", "simpson"],
  "a": 0,
  "b": 3.14159,
  "n_values": [4, 8, 16, 32, 64, 128]
}
```

---

## Appendix B: Technology Stack Summary

| Layer | Technology | Version |
|-------|------------|---------|
| Frontend Framework | React | 19.2.0 |
| Build Tool | Vite | 7.2.4 |
| CSS Framework | Tailwind CSS | 4.1.18 |
| Math Rendering | KaTeX | 0.16.27 |
| Charts | Recharts | 3.6.0 |
| HTTP Client | Axios | 1.13.2 |
| Backend Framework | FastAPI | ≥0.109.0 |
| Python | Python | 3.13.4 |
| Numerical Computing | NumPy | ≥1.26.0 |
| Scientific Computing | SciPy | ≥1.12.0 |
| Data Validation | Pydantic | ≥2.6.0 |

---

*End of Report*

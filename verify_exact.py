"""Verify exact value calculations"""
import numpy as np
from scipy import integrate

print("="*60)
print("EXACT VALUE VERIFICATION")
print("="*60)

tests = [
    ("sin(x) from 0 to π", lambda x: np.sin(x), 0, np.pi, 2.0),
    ("e^x from 0 to 1", lambda x: np.exp(x), 0, 1, np.e - 1),
    ("2x+1 from 0 to 5", lambda x: 2*x + 1, 0, 5, 30.0),
    ("x² from 0 to 1", lambda x: x**2, 0, 1, 1/3),
    ("1/(1+x²) from 0 to 1", lambda x: 1/(1+x**2), 0, 1, np.pi/4),
    ("cos(x) from 0 to π/2", lambda x: np.cos(x), 0, np.pi/2, 1.0),
    ("x³ from 0 to 2", lambda x: x**3, 0, 2, 4.0),
]

all_correct = True
for name, func, a, b, analytical in tests:
    scipy_val, _ = integrate.quad(func, a, b)
    diff = abs(scipy_val - analytical)
    is_correct = diff < 1e-10
    
    status = "✓" if is_correct else "✗"
    print(f"\n{status} {name}")
    print(f"   scipy.quad: {scipy_val:.12f}")
    print(f"   analytical: {analytical:.12f}")
    print(f"   difference: {diff:.2e}")
    
    if not is_correct:
        all_correct = False

print("\n" + "="*60)
if all_correct:
    print("ALL EXACT VALUES ARE CORRECT! ✓")
else:
    print("SOME VALUES ARE INCORRECT! ✗")
print("="*60)

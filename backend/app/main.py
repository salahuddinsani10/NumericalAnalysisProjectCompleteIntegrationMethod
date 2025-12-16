"""
Numerical Analysis Dashboard - FastAPI Application
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .core.config import settings
from .api.endpoints import router


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    
    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.API_VERSION,
        description="""
## Numerical Analysis Dashboard API

Compare numerical integration methods (Trapezoidal, Midpoint, Simpson's Rules)
and analyze their convergence rates.

### Features:
- **Calculate**: Single approximation with visualization data
- **Analyze**: Convergence analysis with EOC computation
- **Functions**: Library of test functions with different characteristics

### Test Function Categories:
- **Smooth**: sin(x), e^x
- **Mild Curvature**: 1/(1+x²), √(1+x)
- **Turning Points**: x³ - 3x, cos(5x)
        """,
        docs_url="/docs",
        redoc_url="/redoc",
    )
    
    # Configure CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Include routers
    app.include_router(router)
    
    @app.get("/", tags=["root"])
    async def root():
        """Root endpoint - API health check."""
        return {
            "message": "Numerical Analysis Dashboard API",
            "version": settings.API_VERSION,
            "docs": "/docs",
        }
    
    @app.get("/health", tags=["root"])
    async def health():
        """Health check endpoint."""
        return {"status": "healthy"}
    
    return app


app = create_app()

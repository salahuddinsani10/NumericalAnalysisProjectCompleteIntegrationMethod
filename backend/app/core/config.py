"""
Numerical Analysis Dashboard - Configuration
"""

class Settings:
    APP_NAME: str = "Numerical Analysis Dashboard"
    API_VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    # CORS Origins
    CORS_ORIGINS: list = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    ]

settings = Settings()

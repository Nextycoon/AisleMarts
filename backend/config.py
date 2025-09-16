from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    MONGO_URL: str = os.getenv("MONGO_URL", "mongodb://localhost:27017")
    DB_NAME: str = os.getenv("DB_NAME", "aislemarts")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "your-super-secret-jwt-key-change-this-in-production")
    JWT_ALG: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 30  # 30 days
    STRIPE_SECRET_KEY: str = os.getenv("STRIPE_SECRET_KEY", "sk_test_")
    STRIPE_WEBHOOK_SECRET: str = os.getenv("STRIPE_WEBHOOK_SECRET", "whsec_")
    FRONTEND_ORIGIN: str = os.getenv("FRONTEND_ORIGIN", "exp+aislemarts://localhost")
    OPENAI_API_KEY: str | None = os.getenv("OPENAI_API_KEY")
    EMERGENT_LLM_KEY: str | None = os.getenv("EMERGENT_LLM_KEY")
    
    # Phase 3: Nearby/Onsite Commerce Configuration
    NEARBY_ENABLED: bool = os.getenv("NEARBY_ENABLED", "true").lower() == "true"
    MAP_PROVIDER: str = os.getenv("MAP_PROVIDER", "mapbox")
    MAPBOX_PUBLIC_TOKEN: str = os.getenv("MAPBOX_PUBLIC_TOKEN", "pk.demo_token")
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379")

    class Config:
        env_file = ".env"
        extra = "ignore"  # Allow extra fields from .env

settings = Settings()
from pydantic_settings import BaseSettings
from pydantic import ConfigDict, Field
from typing import Optional
import secrets


class Settings(BaseSettings):
    model_config = ConfigDict(env_file=".env")

    # Database
    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "aislemarts"

    # JWT
    SECRET_KEY: str = Field(default="")  # Will be generated if empty
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Stripe
    STRIPE_SECRET_KEY: Optional[str] = None
    STRIPE_PUBLISHABLE_KEY: Optional[str] = None
    STRIPE_WEBHOOK_SECRET: Optional[str] = None

    # OpenAI
    OPENAI_API_KEY: Optional[str] = None

    # Environment
    ENVIRONMENT: str = "development"

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Generate a secure secret key if not provided or is the default
        if not self.SECRET_KEY or self.SECRET_KEY == "your-secret-key-change-in-production":
            self.SECRET_KEY = secrets.token_urlsafe(32)
            if self.ENVIRONMENT == "production":
                print("WARNING: Using auto-generated SECRET_KEY. Set SECRET_KEY environment variable for production!")


settings = Settings()

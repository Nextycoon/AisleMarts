from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from auth import app as auth_app

# Create main application
app = FastAPI(
    title="AisleMarts API",
    description="AI-powered marketplace platform API",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount auth module
app.mount("/auth", auth_app)

@app.get("/")
async def root():
    return {"message": "AisleMarts API", "version": "1.0.0", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "aislemarts-api"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
# routers/deps.py
import os
from functools import lru_cache
from typing import Any
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

MONGO_URI_ENV = "MONGO_URI"
MONGO_DB_ENV = "MONGO_DB"

class Mongo:
    def __init__(self, uri: str, db_name: str):
        self.client = AsyncIOMotorClient(uri, uuidRepresentation="standard")
        self.db: AsyncIOMotorDatabase = self.client[db_name]

    async def close(self):
        self.client.close()

@lru_cache(maxsize=1)
def _get_mongo_singleton() -> Mongo:
    uri = os.getenv(MONGO_URI_ENV, "mongodb://localhost:27017")
    dbname = os.getenv(MONGO_DB_ENV, "aislemarts")
    return Mongo(uri, dbname)

async def get_db() -> Any:
    # FastAPI dependency — returns an AsyncIOMotorDatabase
    mongo = _get_mongo_singleton()
    return mongo.db
from motor.motor_asyncio import AsyncIOMotorClient
import os

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = "candidate_tracker"

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]
candidates_collection = db["candidates"]
users_collection = db["users"]

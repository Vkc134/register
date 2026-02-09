from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import router as candidate_router
import os

app = FastAPI()

origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(candidate_router, tags=["candidates"])

@app.on_event("startup")
async def startup_db_client():
    # Seed default admin
    from database import users_collection
    from routes import get_password_hash
    
    admin_email = os.getenv("ADMIN_EMAIL", "admin@cloudpyit.com")
    admin_password = os.getenv("ADMIN_PASSWORD", "cloudpyit@1209")
    
    existing_admin = await users_collection.find_one({"email": admin_email})
    
    if not existing_admin:
        hashed_password = get_password_hash(admin_password)
        admin_user = {
            "email": admin_email,
            "password": hashed_password, 
            "role": "admin"
        }
        await users_collection.insert_one(admin_user)
        print(f"Default admin created: {admin_email}")


# @app.get("/health")
# async def health_check():
#     return {"status": "ok"}
@app.api_route("/health", methods=["GET", "HEAD"])
async def health_check():
    return {"status": "ok"}

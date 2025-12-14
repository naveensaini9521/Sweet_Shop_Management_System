from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

client = None

def get_database():
    """Get MongoDB database instance - ensures connection is established"""
    global client
    if client is None:
        # Initialize connection if not already done
        client = AsyncIOMotorClient(settings.MONGODB_URL)
        print("Connected to MongoDB.")
    
    # Return the database instance
    db = client[settings.MONGODB_DB_NAME]
    return db

async def connect_to_mongo():
    """Initialize MongoDB connection (for lifespan events)"""
    # Simply call get_database() which will handle connection
    db = get_database()
    # Optional: Test connection
    try:
        await db.command('ping')
        print("MongoDB connection test successful.")
    except Exception as e:
        print(f"MongoDB connection error: {e}")
        raise

async def close_mongo_connection():
    """Close MongoDB connection (for lifespan events)"""
    global client
    if client:
        client.close()
        client = None
        print("MongoDB connection closed.")
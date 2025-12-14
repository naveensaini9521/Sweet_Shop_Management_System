import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def setup_database():
    """Create database indexes for better performance"""
    client = AsyncIOMotorClient('mongodb://localhost:27017')
    db = client['sweet_shop_db']
    
    try:
        # Create indexes for sweets collection
        await db.sweets.create_index("name", unique=True)
        await db.sweets.create_index("category")
        await db.sweets.create_index("price")
        await db.sweets.create_index([("name", "text"), ("description", "text")])
        logger.info("Created indexes for sweets collection")
        
        # Create indexes for users collection
        await db.users.create_index("email", unique=True)
        await db.users.create_index("username", unique=True)
        logger.info("Created indexes for users collection")
        
        # Create indexes for purchases collection
        await db.purchases.create_index("sweet_id")
        await db.purchases.create_index("purchased_at", -1)
        logger.info("Created indexes for purchases collection")
        
        # Create indexes for restocks collection
        await db.restocks.create_index("sweet_id")
        await db.restocks.create_index("restocked_at", -1)
        logger.info("Created indexes for restocks collection")
        
    except Exception as e:
        logger.error(f"Error setting up database: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(setup_database())
import asyncio
import sys
import os

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
import bcrypt

async def create_admin_user():
    """Create an admin user in MongoDB"""
    # MongoDB connection
    client = AsyncIOMotorClient('mongodb://localhost:27017')
    db = client['sweet_shop_db']
    
    # Password hashing using bcrypt directly (avoid passlib issues)
    password = "admin123"
    
    # Hash the password
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    
    admin_data = {
        "email": "admin123@gmail.com",
        "username": "admin123",
        "hashed_password": hashed_password.decode('utf-8'),  # Store as string
        "is_admin": True,
        "is_active": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    try:
        # Check if admin already exists
        existing_admin = await db.users.find_one({"email": admin_data["email"]})
        
        if existing_admin:
            print("Admin user already exists!")
            print(f"Email: {existing_admin.get('email')}")
            print(f"Username: {existing_admin.get('username')}")
            
            choice = input("Do you want to update the password? (y/n): ").strip().lower()
            if choice == 'y':
                # Update the password
                await db.users.update_one(
                    {"email": admin_data["email"]},
                    {"$set": {
                        "hashed_password": admin_data["hashed_password"],
                        "updated_at": datetime.utcnow()
                    }}
                )
                print("Admin password updated!")
            else:
                print("Password not updated.")
        else:
            # Insert new admin
            result = await db.users.insert_one(admin_data)
            print("Admin user created successfully!")
            print(f"Email: {admin_data['email']}")
            print(f"Username: {admin_data['username']}")
            print(f"Password: {password}")
            print(f"User ID: {result.inserted_id}")
    
    except Exception as e:
        print(f"Error creating admin user: {e}")
    
    finally:
        # Close the connection
        client.close()
        print("📡 Database connection closed.")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    try:
        return bcrypt.checkpw(
            plain_password.encode('utf-8'),
            hashed_password.encode('utf-8')
        )
    except Exception:
        return False

async def test_admin_login():
    """Test if the admin can login"""
    client = AsyncIOMotorClient('mongodb://localhost:27017')
    db = client['sweet_shop_db']
    
    admin = await db.users.find_one({"email": "admin123@gmail.com"})
    
    if admin:
        print("\nTesting admin credentials...")
        is_valid = verify_password("admin123", admin.get("hashed_password", ""))
        if is_valid:
            print("Password verification successful!")
        else:
            print("Password verification failed!")
    else:
        print("Admin not found in database!")
    
    client.close()

if __name__ == "__main__":
    # Create admin user
    asyncio.run(create_admin_user())
    
    # Test the login
    choice = input("\nDo you want to test the admin login? (y/n): ").strip().lower()
    if choice == 'y':
        asyncio.run(test_admin_login())
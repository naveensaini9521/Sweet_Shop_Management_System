from datetime import datetime
from bson import ObjectId
from .base import Base

class User(Base):
    """User model for MongoDB"""
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.email = kwargs.get('email', '')
        self.username = kwargs.get('username', '')
        self.hashed_password = kwargs.get('hashed_password', '')
        self.is_admin = kwargs.get('is_admin', False)
        self.is_active = kwargs.get('is_active', True)
        
    @property
    def id(self):
        """Get string ID"""
        return str(self._id)
    
    def __repr__(self):
        return f"<User {self.email}>"
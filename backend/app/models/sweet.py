from datetime import datetime
from bson import ObjectId
from .base import Base

class Sweet(Base):
    """Sweet model for MongoDB"""
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.name = kwargs.get('name', '')
        self.description = kwargs.get('description', '')
        self.category = kwargs.get('category', '')
        self.price = kwargs.get('price', 0.0)
        self.quantity = kwargs.get('quantity', 0)
        self.image_url = kwargs.get('image_url', '')
        
    @property
    def id(self):
        """Get string ID"""
        return str(self._id)
    
    def __repr__(self):
        return f"<Sweet {self.name}>"
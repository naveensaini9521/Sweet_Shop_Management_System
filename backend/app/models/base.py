from datetime import datetime
from bson import ObjectId

class Base:
    """Base model with common fields and methods"""
    
    def __init__(self, **kwargs):
        self._id = kwargs.get('_id', ObjectId())
        self.created_at = kwargs.get('created_at', datetime.utcnow())
        self.updated_at = kwargs.get('updated_at', datetime.utcnow())
        
    def to_dict(self):
        """Convert model to dictionary"""
        result = {}
        for key, value in self.__dict__.items():
            if not key.startswith('_'):
                if isinstance(value, ObjectId):
                    result[key] = str(value)
                elif isinstance(value, datetime):
                    result[key] = value.isoformat()
                else:
                    result[key] = value
        result['id'] = str(self._id)
        return result
    
    @classmethod
    def from_dict(cls, data):
        """Create model instance from dictionary"""
        if '_id' in data and isinstance(data['_id'], str):
            data['_id'] = ObjectId(data['_id'])
        return cls(**data)
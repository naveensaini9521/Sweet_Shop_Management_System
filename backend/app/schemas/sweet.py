from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime
from bson import ObjectId
from pydantic_core import core_schema

class PyObjectId(ObjectId):
    @classmethod
    def __get_pydantic_core_schema__(cls, _source_type, _handler):
        # This tells Pydantic how to validate this type
        return core_schema.no_info_after_validator_function(
            cls.validate,
            core_schema.str_schema(),
            serialization=core_schema.to_string_ser_schema(),
        )

    @classmethod
    def validate(cls, v):
        # Validation logic: accept a string and convert to ObjectId
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, _core_schema, _handler):
        # This tells Pydantic how to represent this type in JSON Schema
        return {'type': 'string'}

class SweetBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    category: str = Field(..., min_length=1, max_length=50)
    price: float = Field(..., gt=0, description="Price must be greater than 0")
    quantity: int = Field(..., ge=0, description="Quantity cannot be negative")
    description: Optional[str] = Field(None, max_length=500)
    image_url: Optional[str] = None
    tags: List[str] = Field(default_factory=list)

    @validator('price')
    def validate_price(cls, v):
        if v <= 0:
            raise ValueError('Price must be greater than 0')
        return round(v, 2)

    @validator('quantity')
    def validate_quantity(cls, v):
        if v < 0:
            raise ValueError('Quantity cannot be negative')
        return v

class SweetCreate(SweetBase):
    pass

class SweetUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    category: Optional[str] = Field(None, min_length=1, max_length=50)
    price: Optional[float] = Field(None, gt=0)
    quantity: Optional[int] = Field(None, ge=0)
    description: Optional[str] = Field(None, max_length=500)
    image_url: Optional[str] = None
    tags: Optional[List[str]] = None

class SweetInDB(SweetBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    created_at: datetime
    updated_at: datetime
    
    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class Sweet(SweetBase):
    id: str
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_mongo(cls, data):
        """Convert MongoDB document to Sweet schema"""
        if not data:
            return None
        data['id'] = str(data['_id'])
        return cls(**data)

class PurchaseRequest(BaseModel):
    quantity: int = Field(..., gt=0, le=50, description="Quantity to purchase (1-50)")

class RestockRequest(BaseModel):
    quantity: int = Field(..., gt=0, le=1000, description="Quantity to restock (1-1000)")
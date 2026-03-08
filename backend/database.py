"""
TaxNow - Database Module
MongoDB integration for data persistence
"""

import os
from datetime import datetime
from typing import Optional, Dict, Any, List
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import json

# MongoDB connection
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "taxnow")

class Database:
    client: Optional[AsyncIOMotorClient] = None
    db = None
    
    @classmethod
    async def connect(cls):
        """Connect to MongoDB"""
        try:
            cls.client = AsyncIOMotorClient(MONGODB_URL)
            cls.db = cls.client[DB_NAME]
            # Test connection
            await cls.client.admin.command('ping')
            print(f"✅ Connected to MongoDB: {DB_NAME}")
            return True
        except Exception as e:
            print(f"❌ MongoDB connection failed: {e}")
            return False
    
    @classmethod
    async def disconnect(cls):
        """Disconnect from MongoDB"""
        if cls.client:
            cls.client.close()
            print("Disconnected from MongoDB")
    
    @classmethod
    def get_db(cls):
        """Get database instance"""
        return cls.db
    
    # Upload operations
    @classmethod
    async def save_upload(cls, upload_data: Dict[str, Any]) -> str:
        """Save upload metadata"""
        upload_data["created_at"] = datetime.utcnow()
        upload_data["updated_at"] = datetime.utcnow()
        result = await cls.db.uploads.insert_one(upload_data)
        return str(result.inserted_id)
    
    @classmethod
    async def get_upload(cls, upload_id: str) -> Optional[Dict[str, Any]]:
        """Get upload by ID"""
        try:
            return await cls.db.uploads.find_one({"_id": ObjectId(upload_id)})
        except:
            return None
    
    @classmethod
    async def update_upload(cls, upload_id: str, data: Dict[str, Any]):
        """Update upload data"""
        data["updated_at"] = datetime.utcnow()
        await cls.db.uploads.update_one(
            {"_id": ObjectId(upload_id)},
            {"$set": data}
        )
    
    # Invoice operations
    @classmethod
    async def save_invoices(cls, upload_id: str, invoices: List[Dict[str, Any]]):
        """Save invoices for an upload"""
        for invoice in invoices:
            invoice["upload_id"] = upload_id
            invoice["created_at"] = datetime.utcnow()
        if invoices:
            await cls.db.invoices.insert_many(invoices)
    
    @classmethod
    async def get_invoices(
        cls, 
        upload_id: str, 
        invoice_type: Optional[str] = None,
        skip: int = 0,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """Get invoices with pagination"""
        query = {"upload_id": upload_id}
        if invoice_type:
            query["invoice_type"] = invoice_type
        
        cursor = cls.db.invoices.find(query).skip(skip).limit(limit)
        invoices = await cursor.to_list(length=limit)
        return invoices
    
    @classmethod
    async def count_invoices(cls, upload_id: str, invoice_type: Optional[str] = None) -> int:
        """Count invoices"""
        query = {"upload_id": upload_id}
        if invoice_type:
            query["invoice_type"] = invoice_type
        return await cls.db.invoices.count_documents(query)
    
    # Summary operations
    @classmethod
    async def save_summary(cls, upload_id: str, summary: Dict[str, Any]):
        """Save summary for an upload"""
        summary["upload_id"] = upload_id
        summary["created_at"] = datetime.utcnow()
        await cls.db.summaries.update_one(
            {"upload_id": upload_id},
            {"$set": summary},
            upsert=True
        )
    
    @classmethod
    async def get_summary(cls, upload_id: str) -> Optional[Dict[str, Any]]:
        """Get summary by upload ID"""
        return await cls.db.summaries.find_one({"upload_id": upload_id})
    
    # User operations (for future auth)
    @classmethod
    async def create_user(cls, user_data: Dict[str, Any]) -> str:
        """Create a new user"""
        user_data["created_at"] = datetime.utcnow()
        user_data["updated_at"] = datetime.utcnow()
        result = await cls.db.users.insert_one(user_data)
        return str(result.inserted_id)
    
    @classmethod
    async def get_user_by_email(cls, email: str) -> Optional[Dict[str, Any]]:
        """Get user by email"""
        return await cls.db.users.find_one({"email": email})

# JSON encoder for MongoDB ObjectId
class MongoJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        if isinstance(obj, datetime):
            return obj.isoformat()
        return super().default(obj)

def serialize_mongo_doc(doc: Dict[str, Any]) -> Dict[str, Any]:
    """Serialize MongoDB document to JSON-compatible dict"""
    if doc is None:
        return None
    
    result = {}
    for key, value in doc.items():
        if key == "_id":
            result["id"] = str(value)
        elif isinstance(value, ObjectId):
            result[key] = str(value)
        elif isinstance(value, datetime):
            result[key] = value.isoformat()
        elif isinstance(value, dict):
            result[key] = serialize_mongo_doc(value)
        elif isinstance(value, list):
            result[key] = [
                serialize_mongo_doc(item) if isinstance(item, dict) else 
                str(item) if isinstance(item, ObjectId) else 
                item.isoformat() if isinstance(item, datetime) else item
                for item in value
            ]
        else:
            result[key] = value
    return result

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.core.database import get_database
from app.core.dependencies import get_current_user


# ---- Motor-style async cursor ----
class FakeAsyncCursor:
    async def to_list(self, length=None):
        return []


class FakeSweetsCollection:
    def find(self, *args, **kwargs):
        return FakeAsyncCursor()

    async def find_one(self, *args, **kwargs):
        return None

    async def insert_one(self, *args, **kwargs):
        class Result:
            inserted_id = "sweet_id"
        return Result()


class FakeUsersCollection:
    async def find_one(self, *args, **kwargs):
        return {
            "_id": "user_id",
            "email": "test@example.com",
            "username": "testuser",
            "hashed_password": "$2b$12$mockhashedpassword",
            "is_active": True,
            "is_admin": False
        }

    async def insert_one(self, *args, **kwargs):
        class Result:
            inserted_id = "user_id"
        return Result()


class FakeDB:
    def __init__(self):
        self.sweets = FakeSweetsCollection()
        self.users = FakeUsersCollection()
        self.purchases = None
        self.restocks = None


@pytest.fixture
def mock_db():
    return FakeDB()


@pytest.fixture
def client(mock_db):
    app.dependency_overrides[get_database] = lambda: mock_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def authenticated_client(client):
    app.dependency_overrides[get_current_user] = lambda: {
        "id": "user123",
        "email": "test@example.com",
        "username": "testuser",
        "is_admin": False,
        "is_active": True
    }
    yield client
    app.dependency_overrides.pop(get_current_user, None)

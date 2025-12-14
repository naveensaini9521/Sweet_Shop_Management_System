import pytest
from unittest.mock import AsyncMock, patch
from fastapi import HTTPException


@pytest.mark.asyncio
async def test_sweet_service_create():
    from app.services.sweet_service import SweetService
    from app.schemas.sweet import SweetCreate

    with patch("app.services.sweet_service.get_database") as mock_db:
        mock_db_instance = AsyncMock()
        mock_db_instance.sweets.find_one = AsyncMock(
            return_value={"name": "Existing Sweet"}
        )
        mock_db.return_value = mock_db_instance

        service = SweetService()

        with pytest.raises(HTTPException) as exc:
            await service.create_sweet(
                SweetCreate(
                    name="Existing Sweet",
                    price=10.0,
                    quantity=100,
                    category="chocolate",
                    description="Test"
                ),
                "user123"
            )

        assert exc.value.status_code == 400


def test_auth_service_hash_password():
    from app.services.auth_service import hash_password, verify_password

    password = "test123"
    hashed = hash_password(password)

    assert hashed != password
    assert verify_password(password, hashed) is True
    assert verify_password("wrong", hashed) is False

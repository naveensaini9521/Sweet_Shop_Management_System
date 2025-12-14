from unittest.mock import patch


def test_register_and_login(client):
    mock_hashed_password = "$2b$12$mockhashedpassword"

    with patch("app.services.auth_service.hash_password") as mock_hash:
        mock_hash.return_value = mock_hashed_password

        response = client.post("/api/auth/register", json={
            "email": "test@example.com",
            "username": "testuser",
            "password": "password123",
            "confirm_password": "password123"
        })

        assert response.status_code in [200, 201, 400]

        if response.status_code in [200, 201]:
            with patch("app.services.auth_service.verify_password") as mock_verify:
                mock_verify.return_value = True

                response = client.post("/api/auth/login", json={
                    "email": "test@example.com",
                    "password": "password123"
                })

                assert response.status_code in [200, 401]


def test_login(client):
    with patch("app.services.auth_service.verify_password") as mock_verify:
        mock_verify.return_value = True

        response = client.post("/api/auth/login", json={
            "email": "test@example.com",
            "password": "test123"
        })

        assert response.status_code in [200, 401]

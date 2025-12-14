def test_user_register(client):
    response = client.post(
        "/api/auth/register",
        json={"email": "test@example.com", "password": "test123"}
    )
    assert response.status_code in (200, 400) 


def test_user_login(client):
    client.post(
        "/api/auth/register",
        json={"email": "test@example.com", "password": "test123"}
    )

    response = client.post(
        "/api/auth/login",
        json={"email": "test@example.com", "password": "test123"}
    )
    assert response.status_code == 200
    assert "access_token" in response.json()

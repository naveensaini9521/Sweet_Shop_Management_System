def get_token(client):
    client.post(
        "/api/auth/register",
        json={"email": "test@example.com", "password": "test123"}
    )
    res = client.post(
        "/api/auth/login",
        json={"email": "test@example.com", "password": "test123"}
    )
    return res.json()["access_token"]



def test_create_sweet_unauthorized(client):
    response = client.post("/api/sweets", json={})
    assert response.status_code == 401


def test_list_sweets_authorized(client):
    token = get_token(client)
    response = client.get(
        "/api/sweets",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
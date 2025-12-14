def test_purchase_invalid_sweet(client):
    client.post(
        "/api/auth/register",
        json={"email": "test@example.com", "password": "test123"}
    )

    token = client.post(
        "/api/auth/login",
        json={"email": "test@example.com", "password": "test123"}
    ).json()["access_token"]

    response = client.post(
        "/api/inventory/purchase/999",
        json={"quantity": 1},
        headers={"Authorization": f"Bearer {token}"}
    )

    assert response.status_code == 404

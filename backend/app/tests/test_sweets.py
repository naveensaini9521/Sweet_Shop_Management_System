from unittest.mock import AsyncMock, patch


# def test_list_sweets(authenticated_client):
#     with patch("app.api.v1.sweets.SweetService") as MockService:
#         service = AsyncMock()
#         service.get_all_sweets.return_value = [
#             {"id": "1", "name": "Chocolate Bar", "category": "chocolate"},
#             {"id": "2", "name": "Gummy Bears", "category": "gummies"},
#         ]
#         MockService.return_value = service

#         response = authenticated_client.get("/api/sweets/")
#         assert response.status_code == 200
#         assert len(response.json()) == 2


def test_create_sweet_unauthorized(client):
    response = client.post("/api/sweets/", json={
        "name": "Test Sweet",
        "price": 10,
        "quantity": 100,
        "category": "chocolate"
    })
    assert response.status_code in [401, 403]


# def test_get_sweet_by_id(authenticated_client):
#     with patch("app.api.v1.sweets.SweetService") as MockService:
#         service = AsyncMock()
#         service.get_sweet_by_id.return_value = {
#             "id": "123",
#             "name": "Test Sweet"
#         }
#         MockService.return_value = service

#         response = authenticated_client.get("/api/sweets/123")
#         assert response.status_code in [200, 404]


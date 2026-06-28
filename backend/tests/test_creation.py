# backend/tests/test_creation.py
def test_create_creation(client, auth_headers):
    mat_res = client.post("/api/v1/materials", json={"title": "测试古籍", "material_type": "ancient_book", "content": "宋子曰：水火既济而土合"}, headers=auth_headers)
    mat_id = mat_res.json()["data"]["id"]
    res = client.post("/api/v1/creations", json={"material_id": mat_id, "scenario": "classroom", "audience": "child"}, headers=auth_headers)
    assert res.status_code == 200
    data = res.json()["data"]
    assert data["scenario"] == "classroom"
    assert len(data["content_items"]) > 0
    assert len(data["craft_graph"]["nodes"]) > 0

def test_list_creations(client, auth_headers):
    mat_res = client.post("/api/v1/materials", json={"title": "素材", "material_type": "ancient_book", "content": "内容"}, headers=auth_headers)
    mat_id = mat_res.json()["data"]["id"]
    client.post("/api/v1/creations", json={"material_id": mat_id, "scenario": "classroom", "audience": "child"}, headers=auth_headers)
    res = client.get("/api/v1/creations", headers=auth_headers)
    assert res.status_code == 200
    assert res.json()["data"]["total"] >= 1

def test_get_creation_detail(client, auth_headers):
    mat_res = client.post("/api/v1/materials", json={"title": "素材", "material_type": "ancient_book", "content": "内容"}, headers=auth_headers)
    mat_id = mat_res.json()["data"]["id"]
    create_res = client.post("/api/v1/creations", json={"material_id": mat_id, "scenario": "exhibition", "audience": "adult"}, headers=auth_headers)
    creation_id = create_res.json()["data"]["id"]
    res = client.get(f"/api/v1/creations/{creation_id}", headers=auth_headers)
    assert res.status_code == 200
    assert res.json()["data"]["scenario"] == "exhibition"

def test_delete_creation(client, auth_headers):
    mat_res = client.post("/api/v1/materials", json={"title": "素材", "material_type": "ancient_book", "content": "内容"}, headers=auth_headers)
    mat_id = mat_res.json()["data"]["id"]
    create_res = client.post("/api/v1/creations", json={"material_id": mat_id, "scenario": "video", "audience": "teenager"}, headers=auth_headers)
    creation_id = create_res.json()["data"]["id"]
    res = client.delete(f"/api/v1/creations/{creation_id}", headers=auth_headers)
    assert res.status_code == 200

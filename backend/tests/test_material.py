# backend/tests/test_material.py
def test_create_material(client, auth_headers):
    res = client.post("/api/v1/materials", json={"title": "测试素材", "material_type": "ancient_book", "content": "古文内容"}, headers=auth_headers)
    assert res.status_code == 200
    assert res.json()["data"]["title"] == "测试素材"

def test_list_materials(client, auth_headers):
    client.post("/api/v1/materials", json={"title": "素材1", "material_type": "ancient_book", "content": "内容1"}, headers=auth_headers)
    client.post("/api/v1/materials", json={"title": "素材2", "material_type": "craft_text", "content": "内容2"}, headers=auth_headers)
    res = client.get("/api/v1/materials", headers=auth_headers)
    assert res.status_code == 200
    assert res.json()["data"]["total"] == 2

def test_get_material(client, auth_headers):
    create_res = client.post("/api/v1/materials", json={"title": "素材", "material_type": "ancient_book", "content": "内容"}, headers=auth_headers)
    mat_id = create_res.json()["data"]["id"]
    res = client.get(f"/api/v1/materials/{mat_id}", headers=auth_headers)
    assert res.status_code == 200

def test_update_material(client, auth_headers):
    create_res = client.post("/api/v1/materials", json={"title": "旧标题", "material_type": "ancient_book", "content": "内容"}, headers=auth_headers)
    mat_id = create_res.json()["data"]["id"]
    res = client.put(f"/api/v1/materials/{mat_id}", json={"title": "新标题"}, headers=auth_headers)
    assert res.json()["data"]["title"] == "新标题"

def test_delete_material(client, auth_headers):
    create_res = client.post("/api/v1/materials", json={"title": "素材", "material_type": "ancient_book", "content": "内容"}, headers=auth_headers)
    mat_id = create_res.json()["data"]["id"]
    res = client.delete(f"/api/v1/materials/{mat_id}", headers=auth_headers)
    assert res.status_code == 200

def test_material_no_auth(client):
    res = client.post("/api/v1/materials", json={"title": "素材", "material_type": "ancient_book", "content": "内容"})
    assert res.status_code == 401

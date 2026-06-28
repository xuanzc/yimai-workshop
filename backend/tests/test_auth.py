# backend/tests/test_auth.py
def test_register(client):
    res = client.post("/api/v1/auth/register", json={"username": "newuser", "email": "new@test.com", "password": "pass123456"})
    assert res.status_code == 200
    assert res.json()["data"]["token"]

def test_register_duplicate(client):
    client.post("/api/v1/auth/register", json={"username": "dup", "email": "dup@test.com", "password": "pass123456"})
    res = client.post("/api/v1/auth/register", json={"username": "dup", "email": "other@test.com", "password": "pass123456"})
    assert res.status_code == 400

def test_login_success(client):
    client.post("/api/v1/auth/register", json={"username": "loginuser", "email": "l@test.com", "password": "pass123456"})
    res = client.post("/api/v1/auth/login", json={"account": "loginuser", "password": "pass123456"})
    assert res.status_code == 200
    assert res.json()["data"]["token"]

def test_login_wrong_password(client):
    client.post("/api/v1/auth/register", json={"username": "wp", "email": "wp@test.com", "password": "pass123456"})
    res = client.post("/api/v1/auth/login", json={"account": "wp", "password": "wrong"})
    assert res.status_code == 401

def test_me(client, auth_headers):
    res = client.get("/api/v1/auth/me", headers=auth_headers)
    assert res.status_code == 200
    assert res.json()["data"]["username"] == "testuser"

def test_me_no_token(client):
    res = client.get("/api/v1/auth/me")
    assert res.status_code == 401

"""End-to-end CRUD against the FastAPI app (in-memory client, fresh sqlite)."""

from __future__ import annotations

import os
import tempfile

import pytest
from fastapi.testclient import TestClient


@pytest.fixture()
def client(monkeypatch):
    # Use a temp sqlite file per test invocation so state is isolated.
    tf = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
    tf.close()
    monkeypatch.setenv("RESUME_BUILDER_DB_URL", f"sqlite:///{tf.name}")
    # Re-import the app *after* the env var is set so the engine binds correctly.
    import importlib

    import app.db as db_mod

    importlib.reload(db_mod)
    import app.main as main_mod

    importlib.reload(main_mod)

    try:
        yield TestClient(main_mod.app)
    finally:
        os.unlink(tf.name)


def test_crud_roundtrip(client: TestClient) -> None:
    # Initially empty
    r = client.get("/api/resumes")
    assert r.status_code == 200
    assert r.json() == []

    # Create
    r = client.post("/api/resumes", json={"name": "Test"})
    assert r.status_code == 201
    entry = r.json()
    rid = entry["id"]
    assert entry["name"] == "Test"
    assert "data" in entry

    # List shows one
    assert len(client.get("/api/resumes").json()) == 1

    # Get
    r = client.get(f"/api/resumes/{rid}")
    assert r.status_code == 200
    assert r.json()["id"] == rid

    # Rename via PUT
    r = client.put(f"/api/resumes/{rid}", json={"name": "Renamed"})
    assert r.status_code == 200
    assert r.json()["name"] == "Renamed"

    # Duplicate
    r = client.post(f"/api/resumes/{rid}/duplicate")
    assert r.status_code == 201
    dup_id = r.json()["id"]
    assert dup_id != rid
    assert client.get(f"/api/resumes/{dup_id}").json()["name"] == "Renamed (Copy)"

    # Delete
    r = client.delete(f"/api/resumes/{rid}")
    assert r.status_code == 204
    r = client.get(f"/api/resumes/{rid}")
    assert r.status_code == 404


def test_pdf_endpoint_stateless(client: TestClient) -> None:
    from tests.smoke_classic import SAMPLE

    r = client.post("/api/resumes/pdf", json=SAMPLE)
    assert r.status_code == 200
    assert r.headers["content-type"] == "application/pdf"
    assert r.content.startswith(b"%PDF")
    assert len(r.content) > 1000


def test_pdf_endpoint_by_id(client: TestClient) -> None:
    from tests.smoke_classic import SAMPLE

    created = client.post("/api/resumes", json={"name": "PDF test", "data": SAMPLE}).json()
    rid = created["id"]
    r = client.get(f"/api/resumes/{rid}/pdf")
    assert r.status_code == 200
    assert r.content.startswith(b"%PDF")

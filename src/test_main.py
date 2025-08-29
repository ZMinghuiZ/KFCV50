import pytest
from fastapi.testclient import TestClient
from main import app
import os
import json
import shutil

test_client = TestClient(app)

def setup_module(module):
    # Ensure test data exists by copying from src/data/knit.json
    os.makedirs("data", exist_ok=True)
    src_path = os.path.join("src", "data", "knit.json")
    dst_path = os.path.join("data", "knit.json")
    shutil.copyfile(src_path, dst_path)

def teardown_module(module):
    # Clean up test data
    dst_path = os.path.join("data", "knit.json")
    if os.path.exists(dst_path):
        os.remove(dst_path)

def test_get_graph():
    response = test_client.get("/graph")
    assert response.status_code == 200
    data = response.json()
    assert "nodes" in data
    assert "edges" in data
    # Check some known nodes from knit.json
    assert any(node["id"] == "knit/demo/AuditLogger" for node in data["nodes"])
    assert any(node["id"] == "knit/demo/AddCommand" for node in data["nodes"])

def test_get_base_classes():
    response = test_client.get("/base-classes")
    assert response.status_code == 200
    data = response.json()
    assert "base_classes" in data
    assert data["parent_class"] == "java.lang.Object"
    # Check that AuditLogger is a base class
    base_names = [cls["name"] for cls in data["base_classes"]]
    assert "knit/demo/AuditLogger" in base_names

def test_get_class_details_success():
    response = test_client.get("/class-info/knit/demo/AuditLogger")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "knit/demo/AuditLogger"
    assert data["parent_class"] == "java.lang.Object"
    assert data["is_provider"] is True
    assert data["provider_class"] == "knit.demo.AuditLogger"
    assert any(param["name"] == "knit.demo.EventBus" for param in data["parameters"])

def test_get_class_details_not_found():
    response = test_client.get("/class-info/NonExistentClass")
    assert response.status_code == 404
    assert "detail" in response.json()

def test_get_child_classes():
    response = test_client.get("/child-classes/knit.demo.GitCommand")
    assert response.status_code == 200
    data = response.json()
    assert "child_classes" in data
    assert data["parent_class"] == "knit.demo.GitCommand"
    # Check that AddCommand and CommitCommand are children
    child_names = [cls["name"] for cls in data["child_classes"]]
    assert "knit/demo/AddCommand" in child_names
    assert "knit/demo/CommitCommand" in child_names

def test_upload_knit_data_success():
    # Read the actual knit.json file
    with open("data/knit.json", "rb") as f:
        file_content = f.read()
    response = test_client.post(
        "/upload-knit-data",
        files={"file": ("knit.json", file_content, "application/json")}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "File uploaded and saved successfully"
    assert data["filename"] == "knit.json"
    assert data["saved_as"] == "data/knit.json"
    assert data["size"] == len(file_content)


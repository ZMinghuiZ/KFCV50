from fastapi.testclient import TestClient
from main import app
import os
import shutil

test_client = TestClient(app)

def setup_sample_data():
    # Ensure test data exists by copying from src/data/knit.json
    os.makedirs("data", exist_ok=True)
    src_path = os.path.join("src", "data", "knit.json")
    dst_path = os.path.join("data", "knit.json")
    shutil.copyfile(src_path, dst_path)

def print_sample_outputs():
    setup_sample_data()
    print("Sample output for /graph:")
    response = test_client.get("/graph")
    print(response.json())

    print("\nSample output for /base-classes:")
    response = test_client.get("/base-classes")
    print(response.json())

    print("\nSample output for /class-info/knit/demo/AuditLogger:")
    response = test_client.get("/class-info/knit/demo/AuditLogger")
    print(response.json())

    print("\nSample output for /child-classes/knit.demo.GitCommand:")
    response = test_client.get("/child-classes/knit.demo.GitCommand")
    print(response.json())

    print("\nSample output for /upload-knit-data:")
    json_path = os.path.join("data", "knit.json")
    with open(json_path, "rb") as f:
        file_content = f.read()
    response = test_client.post(
        "/upload-knit-data",
        files={"file": ("knit.json", file_content, "application/json")}
    )
    print(response.json())

if __name__ == "__main__":
    print_sample_outputs()

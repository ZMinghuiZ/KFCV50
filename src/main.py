from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.responses import JSONResponse
from convert import get_all_base_classes, get_class_info, get_all_child_classes
import json
import os

app = FastAPI(title="Class Info API", version="1.0.0")

@app.get("/base-classes")
async def get_base_classes():
    result = get_all_base_classes("data/knit.json")
    return JSONResponse(content=json.loads(result))

@app.get("/class-info/{class_name:path}")
async def get_class_details(class_name: str):
    result = get_class_info("data/knit.json", class_name)
    data = json.loads(result)
    if "error" in data:
        raise HTTPException(status_code=404, detail=data["error"])
    return JSONResponse(content=data)

@app.get("/child-classes/{parent_class:path}")
async def get_child_classes(parent_class: str):
    result = get_all_child_classes("data/knit.json", parent_class)
    return JSONResponse(content=json.loads(result))

@app.post("/upload-knit-data")
async def upload_knit_data(file: UploadFile = File(...)):
    """
    Upload a JSON file and save it as data/knit.json
    """
    # Validate that the uploaded file is JSON
    if not file.filename.endswith('.json'):
        raise HTTPException(status_code=400, detail="File must be a JSON file")
    
    try:
        # Read the uploaded file content
        content = await file.read()
        
        # Parse JSON to validate it's valid JSON
        json_data = json.loads(content.decode('utf-8'))
        
        # Ensure the data directory exists
        os.makedirs("data", exist_ok=True)
        
        # Save to data/knit.json
        with open("data/knit.json", "w", encoding='utf-8') as f:
            json.dump(json_data, f, indent=2, ensure_ascii=False)
        
        return JSONResponse(
            content={
                "message": "File uploaded and saved successfully",
                "filename": file.filename,
                "saved_as": "data/knit.json",
                "size": len(content)
            }
        )
    
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=400, detail=f"Invalid JSON format: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving file: {str(e)}")


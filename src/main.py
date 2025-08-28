from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from convert import get_all_base_classes, get_class_info, get_all_child_classes
import json

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
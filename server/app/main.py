from fastapi import FastAPI, UploadFile, File, HTTPException
import uuid, os, shutil
app = FastAPI()
UPLOAD_DIR = "/tmp/salaryhelper_uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/api/v1/auth/login")
async def login(payload: dict):
    return {"code":0,"data":{"token":"demo-token","user":{"id":"demo","phone":payload.get("phone")}}}

@app.post("/api/v1/conversations")
async def create_conversation(payload: dict):
    return {"code":0,"data":{"id": str(uuid.uuid4()), "title": payload.get("title", "会话")}}

@app.post("/api/v1/conversations/{convId}/messages")
async def post_message(convId: str, payload: dict):
    return {"code":0,"data":{"message_id": str(uuid.uuid4()), "status":"queued"}}

@app.post("/api/v1/upload")
async def upload(file: UploadFile = File(...)):
    file_id = str(uuid.uuid4())
    dest = os.path.join(UPLOAD_DIR, f"{file_id}_{file.filename}")
    with open(dest, "wb") as f:
        shutil.copyfileobj(file.file, f)
    return {"code":0,"data":{"file_id": file_id, "url": f"/tmp/{file_id}_{file.filename}"}}

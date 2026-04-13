import os
import uuid
import json
from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
import redis

from app.tasks import process_transcription
from app.models import TranscribeRequest, JobStatus

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

redis_url = os.environ.get("REDIS_URL", "redis://localhost:6379")
r = redis.from_url(redis_url)

@app.get("/")
def root():
    return {
        "message": "Bollywood Guitar Tab Generator API is running",
        "endpoints": ["/health", "/transcribe", "/transcribe/status/{job_id}"]
    }

@app.post("/transcribe")
async def transcribe(request: TranscribeRequest, background_tasks: BackgroundTasks):
    job_id = str(uuid.uuid4())
    r.setex(f"job:{job_id}", 3600, json.dumps({"status": "processing"}))
    background_tasks.add_task(process_transcription, job_id, request.youtube_url, r)
    return {"job_id": job_id}

@app.get("/transcribe/status/{job_id}")
async def get_status(job_id: str):
    data = r.get(f"job:{job_id}")
    if not data:
        raise HTTPException(status_code=404, detail="Job not found")
    return json.loads(data)

@app.get("/health")
def health():
    return {"status": "ok"}
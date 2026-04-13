import os
import uuid
import json
from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any

from app.tasks import process_transcription
from app.models import TranscribeRequest, JobStatus

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory job storage
jobs: Dict[str, Dict[str, Any]] = {}

@app.get("/")
def root():
    return {
        "message": "Bollywood Guitar Tab Generator API is running",
        "endpoints": ["/health", "/transcribe", "/transcribe/status/{job_id}"]
    }

@app.post("/transcribe")
async def transcribe(request: TranscribeRequest, background_tasks: BackgroundTasks):
    job_id = str(uuid.uuid4())
    # Store initial status in memory
    jobs[job_id] = {"status": "processing"}
    background_tasks.add_task(process_transcription, job_id, request.youtube_url, jobs)
    return {"job_id": job_id}

@app.get("/transcribe/status/{job_id}")
async def get_status(job_id: str):
    data = jobs.get(job_id)
    if not data:
        raise HTTPException(status_code=404, detail="Job not found")
    return data

@app.get("/health")
def health():
    return {"status": "ok"}
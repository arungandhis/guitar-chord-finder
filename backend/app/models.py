from pydantic import BaseModel
from typing import List, Optional

class TranscribeRequest(BaseModel):
    youtube_url: str

class MelodyNote(BaseModel):
    string: int
    fret: int
    timestamp: float
    duration: Optional[float] = None

class JobStatus(BaseModel):
    status: str  # "processing", "completed", "failed"
    result: Optional[dict] = None
    error: Optional[str] = None
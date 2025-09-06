import os
import google.auth
from fastapi import FastAPI, HTTPException
from google.adk.cli.fast_api import get_fast_api_app
from google.cloud import logging as google_cloud_logging
import google.generativeai as genai
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider, export
from dotenv import load_dotenv

from app.utils.gcs import create_bucket_if_not_exists, generate_upload_url
from app.utils.tracing import CloudTraceLoggingSpanExporter
from app.utils.typing import Feedback
from pydantic import BaseModel
from fastapi.staticfiles import StaticFiles

# Load environment variables from .env file
load_dotenv()

# Explicitly configure the Gemini API key
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

_, project_id = google.auth.default()
logging_client = google_cloud_logging.Client()
logger = logging_client.logger(__name__)
allow_origins = ["http://localhost:3000", "http://127.0.0.1:3000"]

# Bucket for logs and artifacts
logs_bucket_name = f"gs://{project_id}-my-content-pipeline-logs-data"
create_bucket_if_not_exists(
    bucket_name=logs_bucket_name, project=project_id, location="us-central1"
)

# Bucket for user uploads
uploads_bucket_name = f"gs://{project_id}-cocreator-uploads"
create_bucket_if_not_exists(
    bucket_name=uploads_bucket_name, project=project_id, location="us-central1"
)

provider = TracerProvider()
processor = export.BatchSpanProcessor(CloudTraceLoggingSpanExporter())
provider.add_span_processor(processor)
trace.set_tracer_provider(provider)

AGENT_DIR = os.path.dirname(os.path.abspath(__file__))
app: FastAPI = get_fast_api_app(
    agents_dir=AGENT_DIR,
    web=True,
    session_service_uri="sqlite:///sessions.db",
    artifact_service_uri=logs_bucket_name,
    allow_origins=allow_origins,
)
app.title = "my-content-pipeline"
app.description = "API for interacting with the Agent my-content-pipeline"

app.mount("/sessions", StaticFiles(directory="sessions"), name="sessions")

class UploadUrlRequest(BaseModel):
    file_name: str
    content_type: str

@app.post("/generate-upload-url")
def get_upload_url(request: UploadUrlRequest) -> dict[str, str]:
    """Generates a signed URL for uploading a file."""
    try:
        url = generate_upload_url(
            bucket_name=uploads_bucket_name,
            file_name=request.file_name,
            content_type=request.content_type,
        )
        return {"url": url}
    except Exception as e:
        logger.error(f"Error generating upload URL: {e}")
        return {"error": str(e)}

@app.post("/feedback")
def collect_feedback(feedback: Feedback) -> dict[str, str]:
    """Collect and log feedback."""
    logger.log_struct(feedback.model_dump(), severity="INFO")
    return {"status": "success"}

# New Interactive Endpoints

class ImageRequest(BaseModel):
    prompt: str

@app.post("/api/v1/sessions/{session_id}/image")
async def generate_image_endpoint(session_id: str, request: ImageRequest):
    # Placeholder logic
    logger.info(f"Generating image for session {session_id} with prompt: {request.prompt}")
    return {"status": "success", "message": "Image generation started", "artifact_url": f"/sessions/{session_id}/image/placeholder.png"}

class AudioRequest(BaseModel):
    text: str
    voice_name: str = "en-US-Neural2-D"

@app.post("/api/v1/sessions/{session_id}/audio")
async def synthesize_audio_endpoint(session_id: str, request: AudioRequest):
    # Placeholder logic
    logger.info(f"Synthesizing audio for session {session_id} with text: {request.text}")
    return {"status": "success", "message": "Audio synthesis started", "artifact_url": f"/sessions/{session_id}/audio/placeholder.mp3"}

class SocialPostRequest(BaseModel):
    text: str

@app.post("/api/v1/sessions/{session_id}/social")
async def generate_social_post_endpoint(session_id: str, request: SocialPostRequest):
    # Placeholder logic
    logger.info(f"Generating social post for session {session_id} with text: {request.text}")
    return {"status": "success", "message": "Social post generation started", "post": {"title": "Placeholder Title", "description": "Placeholder description", "hashtags": "#placeholder"}}

@app.get("/api/v1/sessions/{session_id}/assets")
async def list_assets_endpoint(session_id: str):
    # Placeholder logic
    logger.info(f"Listing assets for session {session_id}")
    return {"status": "success", "assets": []}

class ComposeRequest(BaseModel):
    timeline: list

@app.post("/api/v1/sessions/{session_id}/compose")
async def compose_video_endpoint(session_id: str, request: ComposeRequest):
    # Placeholder logic
    logger.info(f"Composing video for session {session_id} with timeline: {request.timeline}")
    return {"status": "success", "message": "Video composition started", "video_url": f"/sessions/{session_id}/video/final_video.mp4"}


# Main execution
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)

import os
import google.auth
from fastapi import FastAPI
from google.adk.cli.fast_api import get_fast_api_app
from google.cloud import logging as google_cloud_logging
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider, export

from app.utils.gcs import create_bucket_if_not_exists
from app.utils.tracing import CloudTraceLoggingSpanExporter
from app.utils.typing import Feedback

# Explicitly set the GOOGLE_CLOUD_PROJECT environment variable
os.environ["GOOGLE_CLOUD_PROJECT"] = "cocreator-470801"

_, project_id = google.auth.default()
logging_client = google_cloud_logging.Client()
logger = logging_client.logger(__name__)
allow_origins = ["http://localhost:3000", "http://127.0.0.1:3000"]

bucket_name = f"gs://{project_id}-my-content-pipeline-logs-data"
create_bucket_if_not_exists(
    bucket_name=bucket_name, project=project_id, location="us-central1"
)

provider = TracerProvider()
processor = export.BatchSpanProcessor(CloudTraceLoggingSpanExporter())
provider.add_span_processor(processor)
trace.set_tracer_provider(provider)

AGENT_DIR = os.path.dirname(os.path.abspath(__file__))
app: FastAPI = get_fast_api_app(
    agents_dir=AGENT_DIR,
    web=False,
    session_service_uri="sqlite:///sessions.db",
    artifact_service_uri=bucket_name,
    allow_origins=allow_origins,
)
app.title = "my-content-pipeline"
app.description = "API for interacting with the Agent my-content-pipeline"


@app.post("/feedback")
def collect_feedback(feedback: Feedback) -> dict[str, str]:
    """Collect and log feedback."""
    logger.log_struct(feedback.model_dump(), severity="INFO")
    return {"status": "success"}


# Main execution
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)

from app.config import DEFAULT_LLM_MODEL
from google.adk.agents import LlmAgent
from app.tools import read_session_artifacts
from app.utils.typing import VideoAssetsResponse

reporting_agent = LlmAgent(
    model=DEFAULT_LLM_MODEL,
    name="reporting_agent",
    instruction='''You are a reporting agent. Your task is to take the session artifacts and format them into a JSON object that matches the VideoAssetsResponse schema.
    Each video should have a title, description, hashtags, image_prompt, transcript, video_url, image_url, and audio_url.
    You will need to read the artifacts from the session, which are stored as individual text files. You should group the artifacts by video, assuming that the filenames indicate which video they belong to (e.g., "title_1.txt", "description_1.txt").
    The video_url, image_url, and audio_url should be constructed as full public GCS URLs in the format: https://storage.googleapis.com/<bucket-name>/<session_id>/<artifact_type>/<filename>.
    You will need to get the bucket name from the GCP_PROJECT_ID environment variable, constructing it as '${GCP_PROJECT_ID}-my-content-pipeline-file-uploads'.
    Your final output must be a JSON object that includes these public URLs in the format expected by the frontend: [MEDIA: <URL>]
    ''',
    description="Generates a JSON report from the session artifacts.",
    output_key="report",
    output_schema=VideoAssetsResponse,
    tools=[read_session_artifacts],
    disallow_transfer_to_parent=True,
    disallow_transfer_to_peers=True
)

import os
import logging
import shutil
from google.adk.tools import ToolContext
import firebase_admin
from firebase_admin import credentials, firestore

logger = logging.getLogger(__name__)

# Initialize Firebase Admin SDK
# Note: This assumes that the GOOGLE_APPLICATION_CREDENTIALS environment variable is set.
try:
    cred = credentials.ApplicationDefault()
    firebase_admin.initialize_app(cred)
    db = firestore.client()
    logger.info("Firebase Admin SDK initialized successfully.")
except Exception as e:
    db = None
    logger.warning(f"Firebase Admin SDK initialization failed: {e}. Firestore tools will not be available.")

def setup_session_directories(tool_context: ToolContext) -> dict:
    """
    Sets up the directory structure for the current session.
    The structure is sessions/<session_id>/{audio, image, text, video}.
    """
    session_id = tool_context._invocation_context.session.id
    if not session_id:
        return {"status": "error", "message": "Session ID not found in tool context."}

    base_dir = f"sessions/{session_id}"
    subfolders = ["audio", "image", "text", "video"]

    for folder in subfolders:
        os.makedirs(os.path.join(base_dir, folder), exist_ok=True)

    logger.info(f"Created directory structure for session {session_id} at {base_dir}")
    return {"status": "success", "session_path": base_dir}

def save_text_artifact(session_id: str, filename: str, content: str) -> dict:
    """
    Saves a text artifact to the session's text directory.
    """
    if not session_id:
        return {"status": "error", "message": "Session ID is required."}
    
    file_path = os.path.join("sessions", session_id, "text", filename)
    try:
        with open(file_path, "w") as f:
            f.write(content)
        logger.info(f"Saved text artifact to {file_path}")
        return {"status": "success", "file_path": file_path}
    except Exception as e:
        logger.error(f"Error saving text artifact to {file_path}: {e}")
        return {"status": "error", "message": str(e)}

def move_artifact_to_session_folder(session_id: str, source_path: str, artifact_type: str) -> dict:
    """
    Moves a generated artifact to the appropriate session subfolder.
    artifact_type can be 'audio', 'image', or 'video'.
    """
    if not session_id:
        return {"status": "error", "message": "Session ID is required."}
    if not os.path.exists(source_path):
        return {"status": "error", "message": f"Source file not found: {source_path}"}

    destination_dir = os.path.join("sessions", session_id, artifact_type)
    destination_path = os.path.join(destination_dir, os.path.basename(source_path))
    
    try:
        shutil.move(source_path, destination_path)
        logger.info(f"Moved artifact from {source_path} to {destination_path}")
        return {"status": "success", "new_path": destination_path}
    except Exception as e:
        logger.error(f"Error moving artifact to {destination_path}: {e}")
        return {"status": "error", "message": str(e)}

def save_session_to_firestore(session_id: str, session_data: dict) -> dict:
    """
    Saves session data to Firestore.
    """
    if not db:
        return {"status": "error", "message": "Firestore is not initialized."}
    if not session_id:
        return {"status": "error", "message": "Session ID is required."}

    try:
        doc_ref = db.collection("sessions").document(session_id)
        doc_ref.set(session_data, merge=True)
        logger.info(f"Saved session data for {session_id} to Firestore.")
        return {"status": "success"}
    except Exception as e:
        logger.error(f"Error saving session data to Firestore: {e}")
        return {"status": "error", "message": str(e)}

def read_session_artifacts(session_id: str) -> dict:
    """
    Reads all text artifacts from the session's text directory.
    """
    if not session_id:
        return {"status": "error", "message": "Session ID is required."}
    
    text_dir = os.path.join("sessions", session_id, "text")
    if not os.path.exists(text_dir):
        return {"status": "error", "message": f"Text directory not found for session: {session_id}"}

    artifacts = {}
    for filename in os.listdir(text_dir):
        file_path = os.path.join(text_dir, filename)
        with open(file_path, "r") as f:
            artifacts[filename] = f.read()
            
    return {"status": "success", "artifacts": artifacts}

def set_video_count(count: int, tool_context: ToolContext) -> dict:
    """Sets the number of videos to create in the session state."""
    if not isinstance(count, int) or count <= 0:
        return {"status": "error", "message": "Number of videos must be a positive integer."}
    tool_context.state['num_videos'] = count
    logger.info(f"Number of videos set to {count} in session state.")
    return {"status": "success", "message": f"Number of videos set to {count}"}

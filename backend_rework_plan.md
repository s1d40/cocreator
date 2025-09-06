# Backend Rework Plan: From Pipeline to Interactive Studio

**Objective:** Refactor the backend from a sequential, autonomous pipeline into an interactive, tool-based service that empowers user-driven video creation.

---

## Phase 1: Decoupling and Exposing Tools via a New API

The core of this rework is to break the monolithic `content_creation_pipeline` and expose its underlying capabilities through a granular, on-demand API.

### Step 1.1: Design New API Endpoints

Modify `my-content-pipeline/app/server.py` to include new RESTful endpoints for interactive asset generation. All endpoints should be session-based.

*   **Generate Image:**
    *   `POST /api/v1/sessions/{session_id}/image`
    *   **Request Body:** `{"prompt": "A futuristic cityscape"}`
    *   **Response:** A JSON object with the path or URL to the generated image artifact.

*   **Synthesize Audio:**
    *   `POST /api/v1/sessions/{session_id}/audio`
    *   **Request Body:** `{"text": "Hello, world!", "voice_name": "en-US-Neural2-D"}`
    *   **Response:** A JSON object with the path or URL to the generated audio artifact.

*   **Generate Social Media Post:**
    *   `POST /api/v1/sessions/{session_id}/social`
    *   **Request Body:** `{"text": "Some content to summarize."}`
    *   **Response:** A JSON object containing `{"title": "...", "description": "...", "hashtags": "..."}`.

*   **List Session Assets:**
    *   `GET /api/v1/sessions/{session_id}/assets`
    *   **Response:** A JSON array of all artifacts generated for that session, including their type, name, and URL.

*   **Compose Final Video:**
    *   `POST /api/v1/sessions/{session_id}/compose`
    *   **Request Body:** A JSON object representing the timeline, e.g., `{"timeline": [{"asset_id": "image_1.png", "duration": 5}, {"asset_id": "audio_1.mp3"}]}`.
    *   **Response:** A JSON object with the URL to the final composed video.

### Step 1.2: Refactor the Root Agent

The `interactive_coordinator_agent` in `my-content-pipeline/app/agents/coordinator.py` must be updated to handle both interactive and automatic modes.

*   **Interactive Mode (Default):** The agent's primary instruction will be to act as a tool dispatcher. It will parse user requests (e.g., "Generate an image of a cat") and directly call the appropriate tool (`generate_image`, `synthesize_voiceover`, etc.). It will then return the result of that single tool call to the user.
*   **Automatic Mode:** The existing `content_creation_pipeline` will be wrapped into a single tool (e.g., `run_full_pipeline`). If the user chooses the automatic mode, the coordinator agent will call this single tool to execute the original sequential workflow.

## Phase 2: Session and State Management

The concept of a "session" becomes central to the user's creation process.

### Step 2.1: Enhance Session Artifacts

Modify the session management tools in `my-content-pipeline/app/tools/sessions.py`.

*   When an asset is created, it must be saved with clear metadata (e.g., type, name, creation timestamp) and be strongly associated with the `session_id`.
*   The `read_session_artifacts` tool will be the foundation for the new `GET /api/v1/sessions/{session_id}/assets` endpoint.

### Step 2.2: Final Video Composition Logic

The `create_video_from_assets` tool in `my-content-pipeline/app/tools/multimedia.py` will be the engine for the new `POST /.../compose` endpoint. It needs to be robust enough to handle a timeline data structure, correctly sequencing the specified image and audio assets.

## Phase 3: Implementation and Testing

*   **Implement New Endpoints:** Add the new routes to the FastAPI app. Each route will call a corresponding function that invokes the appropriate agent tool.
*   **Refactor Agent Instructions:** Update the prompt for the `interactive_coordinator_agent` to reflect its new dual-mode responsibility.
*   **Unit Tests:** Create unit tests for each of the new API endpoints and the refactored agent logic to ensure they function correctly in isolation.
*   **Integration Tests:** Develop integration tests that simulate a full user session: creating assets interactively and then composing them into a final video.

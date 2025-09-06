# Cocreator Studio: UX Improvement and Multimedia Plan

This document outlines the plan to evolve the current simple chat interface into a rich, multimedia-enabled Cocreator Studio experience.

### 1. Core Principles

*   **User-Centric Design:** The user experience will be intuitive, responsive, and provide clear feedback at every stage of the content creation process.
*   **Leverage Existing Stack:** We will build upon our existing Next.js and Google Cloud Run architecture, using industry-standard libraries to accelerate development.
*   **Phased Implementation:** We will implement the new features in a phased approach, starting with the most critical components.

### 2. Frontend UX Enhancements

The frontend will be the primary focus of this effort.

*   **File Uploads:**
    *   **Drag-and-Drop:** We will implement a drag-and-drop file upload area to make it easy for users to add documents for analysis.
    *   **Multiple File Types:** The interface will clearly indicate that it accepts a variety of file types (PDF, TXT, etc.).
    *   **Upload Progress:** A progress indicator will be displayed for large file uploads.

*   **Real-Time Interaction:**
    *   **Streaming Responses:** We will ensure that the agent's responses are streamed to the UI in real time, as they are generated.
    *   **Typing Indicators:** A typing indicator will be displayed while the agent is processing a request.

*   **Multimedia Display:**
    *   **Dedicated Results View:** A dedicated view will be created to display the final generated video assets.
    *   **Interactive Media:** The results view will include an embedded video player, image viewer, and audio player.
    *   **Downloadable Assets:** Users will be able to easily download all generated assets.

### 3. Backend Architecture

The backend will be updated to support the new multimedia features.

*   **File Handling:**
    *   **Google Cloud Storage (GCS):** All user-uploaded files will be securely stored in a dedicated GCS bucket.
    *   **Signed URLs:** The backend will generate signed URLs to allow the frontend to upload large files directly to GCS, which is more efficient and scalable.

*   **Asynchronous Processing:**
    *   **Cloud Tasks:** For time-consuming operations like video rendering, we will use Google Cloud Tasks to process them asynchronously. This will prevent the main application from becoming unresponsive.
    *   **Real-Time Updates:** The backend will use our existing SSE (Server-Sent Events) connection to push real-time progress updates to the frontend.

### 4. Implementation Plan

This is a high-level overview of the implementation steps.

*   **Phase 0: Foundational Chat Interface**
    1.  **Backend (Next.js API Route):**
        *   [ ] Create a new API route (`/api/chat`) to act as a proxy to the ADK `api_server`.
        *   [ ] This route will handle POST requests, forward them to the ADK's `/run_sse` endpoint, and stream the response back to the client.
    2.  **Frontend:**
        *   [ ] Create a basic chat component with a message display area and a text input.
        *   [ ] Use the browser's `EventSource` API to connect to the `/api/chat` endpoint.
        *   [ ] Implement logic to send user messages and display the streaming response from the agent.
        *   [ ] Handle basic state management for the conversation history.
        *   [ ] Implement session management to create and reuse sessions.

*   **Phase 1: File Uploads**
    1.  **Backend:**
        *   [ ] Create a GCS bucket for file uploads.
        *   [ ] Implement an API endpoint to generate signed URLs for GCS uploads.
    2.  **Frontend:**
        *   [ ] Create a drag-and-drop file upload component.
        *   [ ] Integrate the new component with the signed URL endpoint.
        *   [ ] Update the `useCocreator` hook to handle file uploads.

*   **Phase 2: Multimedia Display**
    1.  **Backend:**
        *   [ ] Update the `reporting_agent` to include the correct, publicly accessible URLs for all generated media.
    2.  **Frontend:**
        *   [ ] Create the `ResultsView` component to display the final video assets.
        *   [ ] Add video, image, and audio players to the `ResultsView`.
        *   [ ] Implement the logic to download the generated assets.

*   **Phase 3: Asynchronous Processing (Optional but Recommended)**
    1.  **Backend:**
        *   [ ] Create a Cloud Task queue for video processing.
        *   [ ] Implement a Cloud Function or Cloud Run service to process the video rendering tasks.
        *   [ ] Update the `multimedia_producer_agent` to use the Cloud Task queue.

### 5. Session and Log Management

*   **Frontend Logging:** We will implement a simple, client-side logging utility to capture the raw data received from the backend. This will be invaluable for debugging.
*   **Session Persistence:** The existing session management system will be maintained to ensure a seamless user experience.

This plan provides a clear path forward for transforming our simple chat application into a powerful and user-friendly Cocreator Studio.

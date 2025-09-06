# Frontend Rework Plan: From Chat to Interactive Studio

**Objective:** Transform the frontend from a simple chat interface into a dynamic, interactive video editing studio that communicates with the refactored, tool-based backend.

---

## Phase 1: UI/UX Overhaul and Component Scaffolding

The user interface will be completely redesigned to support a non-linear, creative workflow.

### Step 1.1: Design the New Studio Layout

The main view will be a multi-panel layout, common in creative tools:

1.  **Chat/Prompt Panel:** A persistent chat interface where the user interacts with the AI assistant to request assets.
2.  **Media Bin:** A gallery or list view that displays all assets (images, audio clips, text snippets) generated during the current session.
3.  **Timeline:** The central component. A multi-track, horizontal view where users can drag and drop assets from the Media Bin to build their video sequence.
4.  **Preview Player:** A video player that shows a real-time preview of the content arranged on the timeline.

### Step 1.2: Create New React Components

Build the new core components in `frontend/src/components/`:

*   `MediaBin.tsx`: Fetches and displays a grid of asset thumbnails from the session. Each item should be draggable.
*   `Timeline.tsx`: The most complex component. It will need to:
    *   Manage multiple tracks (e.g., one for video/images, one for audio, one for text overlays).
    *   Accept dropped items from the `MediaBin`.
    *   Allow for reordering and basic trimming of clips on the timeline.
*   `PreviewPlayer.tsx`: A component that takes the current timeline data and attempts to render a preview. A simple first version could just play the selected assets in sequence.
*   `Studio.tsx`: The main container component that assembles the new layout and manages the overall state of the editing session.

## Phase 2: State Management and API Integration

The frontend's logic needs to be updated to support the new interactive paradigm.

### Step 2.1: Overhaul State Management (`useCocreator` hook)

The existing `useCocreator.ts` hook will be heavily modified or replaced. The new state management solution must handle:

*   **Asset List:** The state of the `MediaBin`, fetched from the new `GET /api/v1/sessions/{session_id}/assets` backend endpoint.
*   **Timeline State:** A data structure (likely an array of objects) that represents the content on the timeline, including asset IDs, order, start times, and durations.
*   **Real-time Updates:** Use the existing SSE (Server-Sent Events) connection to receive real-time updates when a newly requested asset is ready, automatically adding it to the Media Bin.

### Step 2.2: Integrate with New Backend API

*   The chat input will no longer trigger a single, long-running pipeline. Instead, it will send the user's prompt to the new interactive endpoint (e.g., `POST /api/v1/sessions/{session_id}/image`).
*   Implement a "Render Video" button in the UI. When clicked, it will send the current timeline state to the new `POST /api/v1/sessions/{session_id}/compose` endpoint and display the final rendered video upon completion.

## Phase 3: Implementing the "Automatic Mode"

To preserve the original functionality, we will add a simple way for the user to opt-out of the interactive studio.

### Step 3.1: Add a UI Toggle

*   In the `ChatView`, add a button or toggle labeled "Automatic Mode" or "Let the AI do everything."

### Step 3.2: Conditional API Calls

*   If Automatic Mode is enabled, the chat prompt will be sent to the original `/run_sse` endpoint, triggering the legacy sequential pipeline.
*   The UI will switch back to the simpler `GeneratingView` and `ResultsView` from the original design, bypassing the new studio components entirely for that session.

# Front-End Design & Product Brief: Cocreator

## 1. Product Vision & Goal

**Product Name:** Cocreator

**Tagline:** Turn any topic or URL into an engaging video, instantly.

**Core Value Proposition:** Cocreator is a micro-SaaS platform that empowers content creators, marketers, and educators to effortlessly transform written content (from a URL or a simple topic) into short, shareable videos. Our automated pipeline handles everything from research and scriptwriting to generating visuals and voiceovers, delivering a ready-to-use video in minutes.

**Target User Persona:**
*   **Name:** Alex, a Content Marketer
*   **Goal:** To increase audience engagement by producing regular video content for social media and blog posts.
*   **Pain Point:** Lacks the time, budget, and technical skills for traditional video production. Needs a fast, simple, and cost-effective solution.

---

## 2. Core User Flow

The user journey should be simple and intuitive, guiding the user from idea to finished video with minimal friction.

1.  **Sign Up / Login:** User creates an account or logs in.
2.  **Dashboard:** User lands on their dashboard, which displays a list of their previously generated videos ("Projects").
3.  **Initiate Creation:** User clicks a prominent "Create New Video" button.
4.  **Input:** On the creation page, the user provides input:
    *   **Option A:** Paste a URL to an article.
    *   **Option B:** Type in a topic (e.g., "The Future of Artificial Intelligence").
5.  **Configure (Optional):** The user can tweak simple settings, such as voice gender for the voiceover.
6.  **Generate:** The user clicks "Generate Video." The backend process begins.
7.  **Processing View:** The UI updates to show the video is being created, displaying the current stage of the pipeline (e.g., "Researching topic...", "Writing script...", "Generating images...", "Rendering video...").
8.  **View & Download:** Once complete, the final video is displayed in a player. The user can watch it, download the MP4 file, or get a shareable link.

---

## 3. Recommended Technology Stack

To ensure a modern, fast, and maintainable front-end, the following stack is recommended:

*   **Framework:** **React** (or Next.js for its routing and server-side rendering capabilities).
*   **Build Tool:** **Vite** for a fast development experience.
*   **Styling:** **Tailwind CSS** for utility-first styling.
*   **Component Library:** **Shadcn/ui** or **Material-UI (MUI)** to build a clean, consistent, and accessible interface.
*   **State Management:** React Query (TanStack Query) for managing server state (API calls) and Zustand or Redux Toolkit for global UI state.

---

## 4. Page-by-Page Breakdown

### Page 1: Landing & Login

*   **Purpose:** Attract new users and provide a login portal.
*   **Components:**
    *   **Navbar:** Logo, "Login" button.
    *   **Hero Section:** Compelling headline (e.g., "AI-Powered Video Creation at Your Fingertips"), the tagline, a brief description, and a "Get Started for Free" (Sign Up) button.
    *   **Login/Sign Up Modals:** Simple forms for authentication.

### Page 2: Dashboard ("My Projects")

*   **Purpose:** The user's home base. Display all their video projects and allow them to start a new one.
*   **Layout:** A grid or list view.
*   **Components:**
    *   **Navbar:** Logo, User Profile/Account dropdown (links to Settings, Logout).
    *   **Header:** "My Projects" title and a prominent **"Create New Video"** button.
    *   **Project Card (Grid Item):**
        *   Video thumbnail (a placeholder can be used initially).
        *   Video Title.
        *   Creation Date.
        *   Status indicator (e.g., "Completed", "Processing", "Failed").
        *   Action buttons (on hover): "View", "Download", "Delete".
    *   **Empty State:** A message to display if the user has no projects yet, encouraging them to create their first video.

### Page 3: Create New Video

*   **Purpose:** The main creation interface.
*   **Layout:** A clean, single-column form.
*   **Components:**
    *   **Input Section:**
        *   A large text input field where the user can paste a URL or type a topic.
        *   Clear labels to guide the user.
    *   **Configuration Panel:**
        *   **Voice Style:** A dropdown or radio button group (e.g., "Male", "Female", "Random").
        *   **Aspect Ratio:** Button group (e.g., "16:9 Landscape", "9:16 Portrait").
    *   **Action Button:** A "Generate Video" button. This button should show a loading state after being clicked.

### Page 4: Project View & Processing

*   **Purpose:** Show generation progress and display the final video.
*   **Layout:** Centered content area.
*   **Components:**
    *   **While Processing:**
        *   A progress indicator (e.g., a spinner or a multi-step progress bar).
        *   Text that updates with the current status from the backend (e.g., "Step 3/4: Generating voiceover...").
    *   **When Complete:**
        *   **Video Player:** A standard HTML5 video player displaying the generated MP4.
        *   **Header:** The video title.
        *   **Action Buttons:**
            *   "Download Video" (downloads the MP4).
            *   "Copy Shareable Link".
            *   "Back to Dashboard" link.

---

## 5. API Interaction Guide

The front-end will communicate with the backend agent via a simple RESTful API.

*   **Endpoint:** `POST /api/v1/create-video`
*   **Request Body:**
    ```json
    {
      "inputType": "url" | "topic",
      "inputValue": "https://example.com/article" | "The History of Space Exploration",
      "config": {
        "voiceGender": "female",
        "aspectRatio": "16:9"
      }
    }
    ```
*   **Response Handling:**
    *   The backend process is long-running. The API should immediately return a `202 Accepted` response with a `projectId` or a polling URL.
    *   The front-end will then poll a status endpoint (`GET /api/v1/videos/{projectId}/status`) every few seconds.
    *   The status response will contain the current stage:
        ```json
        {
          "status": "processing",
          "stage": "writing_script",
          "message": "Step 2/5: Writing script..."
        }
        ```
    *   When complete, the status response will be:
        ```json
        {
          "status": "completed",
          "videoUrl": "https://storage.googleapis.com/..."
        }
        ```
    *   The front-end then loads the `videoUrl` into the player.

---

## 6. Design & UX Principles

*   **Clarity and Simplicity:** The interface must be extremely easy to understand. Avoid clutter. Every element should have a clear purpose.
*   **Modern & Professional:** Use a clean font, a simple color palette (e.g., a primary brand color, neutrals like gray, and plenty of white space), and subtle animations.
*   **Feedback:** The user must always know what's happening. Use loading states on buttons, progress indicators, and clear status messages during video generation.
*   **Mobile-First:** The design should be responsive and work seamlessly on both desktop and mobile devices.

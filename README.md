# The AI Content Engine

This project is an advanced, agent-based system designed to automate the entire content creation pipeline, transforming a single topic or source URL into a complete multimedia package, including a full article, a synchronized video, and a rich set of downloadable assets.

## Core Features

- **Automated Research & Analysis:** The agent takes a high-level topic, scours the web for relevant information, and analyzes the content to identify key themes and talking points.
- **Human-in-the-Loop Workflow:** It generates a structured content outline that the user can review and edit, ensuring the final product aligns perfectly with their creative vision.
- **Rich Multimedia Generation:** With a single approval, the agent:
    - Writes a full, well-structured article.
    - Generates 8-12 distinct, high-quality images that are thematically synchronized with the article's content.
    - Produces a full audio voiceover, intelligently handling long-form text.
- **Synchronized Video Creation:** It automatically combines the generated images and audio segments into a 6-8 minute video where the visuals directly correspond to the narration.
- **The Content Studio:** The final output is a complete asset package, providing the user with:
    - The final article.
    - The full video.
    - Individual image files.
    - The specific text prompt used to generate each image.
    - The full audio transcript, broken down by scene.

## How It Works

The system is built on a sophisticated multi-agent architecture using the Google Agent Development Kit (ADK). A central `CoordinatorAgent` dispatches tasks to a series of specialized agents responsible for research, writing, multimedia production, and video creation, ensuring a seamless and efficient workflow from start to finish.

This project represents a powerful solution for content marketers, agencies, and businesses looking to scale their content production at a fraction of the cost and time of traditional methods.

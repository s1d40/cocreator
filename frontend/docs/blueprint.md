# **App Name**: Cocreator

## Core Features:

- Landing Page: Attractive landing page with clear value proposition and login/signup options.
- Dashboard: User dashboard to view and manage existing video projects, initiate new projects, and show video previews with options to View, Download, and Delete.
- AI Video Generation: Automatically generate short videos from URL or topic, using a backend service with the aid of LLMs as a tool to convert research, scripting, and visualizations into video content.
- Configuration Settings: Voice selection and aspect ratio customization.
- Real-time Generation Status: Inform users on video creation with current progress in an easily comprehensible processing view. Each step of the video creation should have it's status properly reflected and updatable as well as provide appropriate download links once created.
- Video Player Integration: Play the finished video using a built-in video player with standard controls such as download and a link that can be used for easy sharing.
- API Interaction: Enable backend-frontend API interaction for processing. Handle communication of different steps, like `POST /api/v1/create-video`, manage state during processing by polling to  `GET /api/v1/videos/{projectId}/status`.

## Style Guidelines:

- Primary color: Dark violet (#4A148C) for a modern and innovative feel.
- Background color: Dark gray (#212121), near-black for a sophisticated interface.
- Accent color: Deep Lavender (#7952B3), analogous to the primary color for highlighting calls to action without overpowering the primary aesthetic.
- Body and headline font: 'Inter' (sans-serif) for a modern, neutral and highly readable design.
- Simple, consistent icons that reinforce usability.
- Clean and simple layout with single-column forms, grid-based project displays, and clearly defined content areas.
- Subtle transition and loading animations to provide feedback.
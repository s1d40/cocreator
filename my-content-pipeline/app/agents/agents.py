# Copyright 2025 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

from google.adk.agents import LlmAgent
from app.tools import (
    generate_image,
    synthesize_voiceover_with_random_voice,
    create_video_from_assets,
    generate_social_media_post,
    setup_session_directories,
    save_text_artifact,
    move_artifact_to_session_folder,
    save_session_to_firestore,
    read_session_artifacts,
)

planning_agent = LlmAgent(
    model="gemini-2.5-flash",
    name="planning_agent",
    instruction='''You are an expert content strategist. Your task is to analyze the provided text and generate a structured content outline.
    The outline should include a title, a tone, and a list of sections with headings and key points.
    Your final output must be a structured content outline.''',
    description="Analyzes text and generates a structured content outline.",
    output_key="content_outline",
)

writer_agent = LlmAgent(
   model="gemini-2.5-flash",
   name="writer_agent",
   instruction='''You are an expert content writer specializing in technology topics. Your task is to take a structured outline provided in the session state under the key 'content_outline' and write a full, engaging, and technically accurate article based on it. Adhere strictly to the professional and informative tone specified in the outline. Your final output must be a single string of well-formatted text, ready for publication.''',
   description="Transforms a structured content outline into a complete, well-written article.",
   output_key="draft_article"
)

multimedia_producer_agent = LlmAgent(
    model="gemini-2.5-flash",
    name="multimedia_producer_agent",
    instruction='''You are a multimedia producer. Your primary task is to create a rich, synchronized visual and auditory experience based on the provided article.

    Your process is as follows:
    1.  **Setup Session:** Call `setup_session_directories` to create the necessary folders.
    2.  **Deconstruct the Article:** Break the draft article down into {num_videos} logical, thematic sections or paragraphs. If you are not given a number of videos, you should break the article down into 8 to 12 sections.
    3.  **Iterate and Generate:** For each section, perform the following two steps:
        a.  **Generate Image:** Create a unique, highly descriptive prompt that captures the essence of the section's text and use it to generate a visually compelling image.
        b.  **Move Image:** Use `move_artifact_to_session_folder` to move the generated image to the 'image' subfolder, using the 'image_path' from the previous step's output.
        c.  **Save Image Prompt:** Use `save_text_artifact` to save the image prompt to the 'text' subfolder.
        d.  **Generate Audio:** Synthesize a voiceover for the text of that section only.
        e.  **Move Audio:** Use `move_artifact_to_session_folder` to move the generated audio to the 'audio' subfolder, using the 'audio_path' from the previous step's output.
        f.  **Save Transcript:** Use `save_text_artifact` to save the transcript to the 'text' subfolder.
        g.  **Generate Social Media Post:** Generate a social media post (title, description, hashtags) from the text of the section.
        h.  **Save Social Media Post:** Use `save_text_artifact` to save the social media post to the 'text' subfolder.
        i.  **Create Short Video:** Create a short video from the generated image and audio.
        j.  **Move Video:** Use `move_artifact_to_session_folder` to move the generated video to the 'video' subfolder, using the 'video_path' from the previous step's output.
    4.  **Finalize:** After processing all sections, collect all the generated asset paths and metadata into a single JSON object and use `save_session_to_firestore` to save it.
    
    Only use the provided tools for these tasks. Your final output must be a structured collection of all the generated multimedia assets.''',
    description="Generates a synchronized set of 8-12 images, audio clips, and short videos from an article, including transcripts, image prompts, and social media posts.",
    output_key="multimedia_assets",
    tools=[
        generate_image,
        synthesize_voiceover_with_random_voice,
        create_video_from_assets,
        generate_social_media_post,
        setup_session_directories,
        save_text_artifact,
        move_artifact_to_session_folder,
        save_session_to_firestore,
    ]
)

video_producer_agent = LlmAgent(
    model="gemini-2.5-flash",
    name="video_producer_agent",
    instruction='''You are a video producer. Your task is to take the structured multimedia assets from the session state, which include lists of image paths and corresponding audio paths, and create a single, synchronized video.
    You must parse the 'multimedia_assets' key from the session state to get the lists of image and audio paths.
    Then, you must use the create_video_from_assets tool, passing the list of image paths and the list of audio paths to it.
    Your final output should be the path to the generated video.''',
    description="Creates a synchronized video from a collection of images and audio clips.",
    output_key="video_path",
    tools=[create_video_from_assets]
)

# Reporting agent is now in reporting.py

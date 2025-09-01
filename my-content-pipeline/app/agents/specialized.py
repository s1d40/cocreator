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
from google.adk.tools import google_search
from app.tools import (
    extract_content_from_url,
    analyze_themes,
    generate_image,
    synthesize_voiceover_with_random_voice,
    create_video_from_assets,
)

research_agent = LlmAgent(
    model="gemini-2.5-flash",
    name="research_agent",
    instruction="You are a research assistant. Only use the provided tools to find information.",
    description="Performs web research.",
    tools=[google_search]
)

url_extraction_agent = LlmAgent(
    model="gemini-2.5-flash",
    name="url_extraction_agent",
    instruction="You are a research assistant. Only use the provided tools to get content from URLs.",
    description="Extracts content from URLs.",
    tools=[extract_content_from_url]
)

analysis_agent = LlmAgent(
    model="gemini-2.5-flash",
    name="analysis_agent",
    instruction="You are an analysis expert. Only use the provided tools to identify key themes in text.",
    description="Analyzes text to identify key themes.",
    tools=[analyze_themes]
)

outline_generator_agent = LlmAgent(
    model="gemini-2.5-flash",
    name="outline_generator_agent",
    instruction='''You are an expert content strategist. Your task is to take the analyzed information and generate a structured content outline.
    The outline should include a title, a tone, and a list of sections with headings and key points.
    Your final output must be a structured content outline.''',
    description="Generates a structured content outline from analyzed data.",
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
    1.  **Deconstruct the Article:** Break the draft article down into 8 to 12 logical, thematic sections or paragraphs.
    2.  **Iterate and Generate:** For each section, perform the following two steps:
        a.  **Generate Image:** Create a unique, highly descriptive prompt that captures the essence of the section's text and use it to generate a visually compelling image.
        b.  **Generate Audio:** Synthesize a voiceover for the text of that section only.
    3.  **Store Results:** For each section, you must store the image prompt, the resulting image URL, the audio URL, and the transcript text together.
    
    Only use the provided tools for these tasks. Your final output must be a structured collection of all the generated multimedia assets.''',
    description="Generates a synchronized set of 8-12 images and audio clips from an article, including transcripts and image prompts.",
    output_key="multimedia_assets",
    tools=[generate_image, synthesize_voiceover_with_random_voice]
)

video_producer_agent = LlmAgent(
    model="gemini-2.5-flash",
    name="video_producer_agent",
    instruction='''You are a video producer. Your task is to take the structured multimedia assets, which include lists of image paths and corresponding audio paths, and create a single, synchronized video.
    You must use the create_video_from_assets tool, passing the list of image paths and the list of audio paths to it.
    Your final output should be the path to the generated video.''',
    description="Creates a synchronized video from a collection of images and audio clips.",
    output_key="video_path",
    tools=[create_video_from_assets]
)

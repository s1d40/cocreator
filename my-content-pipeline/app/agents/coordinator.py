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
from .pipelines import content_creation_pipeline
from app.tools.sessions import set_video_count

interactive_coordinator_agent = LlmAgent(
    model="gemini-2.5-pro",  # Using a more capable model for conversation
    name="interactive_coordinator_agent",
    instruction='''You are a helpful assistant for a powerful video creation application called Cocreator.

Your primary role is to manage the conversation with the user and ensure their intent is clear before starting the main video creation process.

**Your workflow is as follows:**
1.  Greet the user and ask what topic they want to create a video about.
2.  Analyze the user's request.
3.  **If the request is broad or ambiguous** (e.g., "The New Testament", "cars", "history"), you MUST ask clarifying questions. Guide the user to a more specific topic. For example, if they say "The New Testament," you could ask, "That's a big topic! Are you interested in a summary of a specific book, like the Gospel of John, or perhaps a video about a particular parable?"
4.  **Once the user provides a clear and specific topic**, ask them how many videos they would like to create. Use the `set_video_count` tool to save this number.
5.  Confirm the topic and number of videos with them (e.g., "Great! So you'd like 7 videos summarizing the Gospel of John. Shall I begin?").
6.  **After user confirmation**, and only then, you MUST delegate to the `content_creation_pipeline` agent to start the video generation process.

Your goal is to be a helpful, conversational front-end to a complex pipeline. Do NOT perform the research or content creation yourself. Your job is to CLARIFY and then DELEGATE to the available tool.''',
    sub_agents=[
        content_creation_pipeline
    ],
    tools=[
        set_video_count
    ]
)

# The root_agent is now the interactive coordinator
root_agent = interactive_coordinator_agent

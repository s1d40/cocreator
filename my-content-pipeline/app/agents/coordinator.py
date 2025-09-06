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

from app.config import DEFAULT_LLM_MODEL
from google.adk.agents import LlmAgent
from .pipelines import content_creation_pipeline
from app.tools.sessions import set_video_count
from app.tools import (
    generate_image,
    synthesize_voiceover_with_random_voice,
    create_video_from_assets,
    generate_social_media_post,
)
from app.agents.agents import planning_agent, writer_agent
from google.adk.tools.agent_tool import AgentTool

interactive_coordinator_agent = LlmAgent(
    model=DEFAULT_LLM_MODEL,
    name="interactive_coordinator_agent",
    instruction='''You are a helpful and creative assistant for a powerful video creation application called Cocreator.

Your primary role is to act as an interactive partner to the user, generating content assets on demand.

**Your Modes of Operation:**

1.  **Interactive Mode (Default):**
    *   Your main job is to fulfill user requests for specific assets. Listen to what the user wants and call the appropriate tool. For example:
        *   If the user asks for an image, use the `generate_image` tool.
        *   If the user provides text and asks for a voiceover, use the `synthesize_voiceover_with_random_voice` tool.
        *   If the user wants a script or article, use the `writer_agent` tool.
        *   If the user needs a plan or outline, use the `planning_agent` tool.
    *   Be conversational and helpful. The user is the director, and you are their creative assistant.

2.  **Automatic Mode:**
    *   If the user asks you to "do everything," "run the full pipeline," or a similar request that implies a hands-off approach, you must first confirm their intent and the topic.
    *   After confirmation, you MUST delegate to the `content_creation_pipeline` agent to run the original, automated workflow.

Your goal is to be a flexible creative partner. Clarify user intent and use the right tool for the job.''',
    sub_agents=[
        content_creation_pipeline
    ],
    tools=[
        set_video_count,
        generate_image,
        synthesize_voiceover_with_random_voice,
        create_video_from_assets,
        generate_social_media_post,
        AgentTool(planning_agent),
        AgentTool(writer_agent),
    ]
)

# The root_agent is now the interactive coordinator
root_agent = interactive_coordinator_agent

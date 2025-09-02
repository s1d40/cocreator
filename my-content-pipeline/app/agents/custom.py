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

import logging
from google.adk.agents import SequentialAgent
from google.adk.agents.invocation_context import InvocationContext
from google.adk.events import Event
from app.utils.typing import Progress
from google.genai.types import Content, Part

logger = logging.getLogger(__name__)

class LoggingSequentialAgent(SequentialAgent):
    async def run_async(self, context: InvocationContext):
        total_steps = len(self.sub_agents)
        for i, agent in enumerate(self.sub_agents):
            logger.info(f"Starting agent: {agent.name}")
            progress = Progress(
                current_step=i + 1,
                total_steps=total_steps,
                message=f"Starting agent: {agent.name}",
            )
            yield Event(author=self.name, content=Content(parts=[Part(text=progress.model_dump_json())]))
            async for event in agent.run_async(context):
                yield event
            logger.info(f"Finished agent: {agent.name}")
            progress = Progress(
                current_step=i + 1,
                total_steps=total_steps,
                message=f"Finished agent: {agent.name}",
            )
            yield Event(author=self.name, content=Content(parts=[Part(text=progress.model_dump_json())]))

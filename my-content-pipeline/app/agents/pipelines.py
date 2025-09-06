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

from google.adk.agents import SequentialAgent
from .agents import (
    thoughtful_planning_agent,
    thoughtful_writer_agent,
    thoughtful_multimedia_producer_agent,
)
from .reporting import reporting_agent

content_creation_pipeline = SequentialAgent(
   name="content_creation_pipeline",
   description="A full pipeline that takes a topic, researches it, and generates a complete video with a script, images, and voiceover. Use this tool when a user has confirmed a clear and specific request.",
   sub_agents=[
       thoughtful_planning_agent,
       thoughtful_writer_agent,
       thoughtful_multimedia_producer_agent,
       reporting_agent,
   ]
)

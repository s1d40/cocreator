from google.adk.agents import BaseAgent, LlmAgent
from google.adk.agents.invocation_context import InvocationContext
from google.adk.events import Event, EventActions
from typing import AsyncGenerator

class ThoughtfulAgent(BaseAgent):
    def __init__(self, agent: LlmAgent):
        super().__init__(name=f"thoughtful_{agent.name}")
        self._agent = agent

    async def _run_async_impl(self, ctx: InvocationContext) -> AsyncGenerator[Event, None]:
        async for event in self._agent.run_async(ctx):
            if event.content and event.content.parts and event.content.parts[0].thought:
                thought_text = event.content.parts[0].text
                thought_type = self._get_thought_type(thought_text)
                thought = {
                    "type": thought_type,
                    "message": thought_text,
                }
                yield Event(
                    author=self.name,
                    actions=EventActions(
                        custom_metadata={"thought": thought}
                    )
                )
            else:
                yield event

    def _get_thought_type(self, thought_text: str) -> str:
        lower_thought = thought_text.lower()
        if 'search' in lower_thought or 'browsing' in lower_thought:
            return 'search'
        if 'writing' in lower_thought or 'generating' in lower_thought or 'creating' in lower_thought:
            return 'writing'
        if 'generate_image' in lower_thought:
            return 'generating_image'
        if 'analyzing' in lower_thought or 'reading' in lower_thought or 'extracting' in lower_thought:
            return 'analyzing'
        return 'unknown'
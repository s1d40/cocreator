# Backend Changes for Frontend Improvements

To support the new frontend features, the following changes are required in the backend.

## 1. Send Structured "Thoughts"

The frontend now expects structured "thought" objects to display a richer real-time feedback to the user.
The `Thought` object has the following structure:

```typescript
type Thought = {
  type: 'search' | 'writing' | 'generating_image' | 'analyzing' | 'reading' | 'extracting' | 'creating' | 'unknown';
  message: string;
};
```

To send these structured thoughts, we need to intercept the "thought" events from the ADK, create a `Thought` object, and send it in the `customMetadata` of a new event.

### Suggested Implementation

We can create a custom `BaseAgent` that wraps an `LlmAgent` and processes its events.

**`my-content-pipeline/app/agents/custom.py`**

```python
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

```

Then, we need to wrap our existing agents with this `ThoughtfulAgent`.

**`my-content-pipeline/app/agents/agents.py`**

```python
# ... (imports)
from .custom import ThoughtfulAgent

# ... (planning_agent, writer_agent, etc. definitions)

# Wrap the agents
thoughtful_planning_agent = ThoughtfulAgent(planning_agent)
thoughtful_writer_agent = ThoughtfulAgent(writer_agent)
thoughtful_multimedia_producer_agent = ThoughtfulAgent(multimedia_producer_agent)
thoughtful_video_producer_agent = ThoughtfulAgent(video_producer_agent)

# ... (update the pipelines to use the thoughtful agents)
```

This approach allows us to add the structured thoughts without modifying the core logic of the existing agents.

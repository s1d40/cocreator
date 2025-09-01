import asyncio
import os

from dotenv import load_dotenv

from google.adk.agents import LlmAgent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.adk.artifacts import InMemoryArtifactService
from google.genai import types as genai_types

from app.tools import synthesize_voiceover

load_dotenv()

os.environ.setdefault("GOOGLE_CLOUD_PROJECT", os.getenv("GOOGLE_CLOUD_PROJECT"))
os.environ.setdefault("GOOGLE_CLOUD_LOCATION", os.getenv("GOOGLE_CLOUD_LOCATION", "global"))
os.environ.setdefault("GOOGLE_GENAI_USE_VERTEXAI", os.getenv("GOOGLE_GENAI_USE_VERTEXAI", "True"))


async def main():
    """Runs the speech synthesis agent with a sample query."""
    session_service = InMemorySessionService()
    await session_service.create_session(
        app_name="speech_test_app", user_id="test_user", session_id="test_session"
    )

    speech_agent = LlmAgent(
        model="gemini-2.5-pro",
        name="speech_synthesis_agent",
        instruction="You are a speech synthesis expert. Only use the provided tools to synthesize speech.",
        description="Synthesizes speech from text.",
        tools=[synthesize_voiceover]
    )

    runner = Runner(
        agent=speech_agent, app_name="speech_test_app", session_service=session_service, artifact_service=InMemoryArtifactService()
    )

    query = "Hello, this is a test of the speech synthesis agent."
    async for event in runner.run_async(
        user_id="test_user",
        session_id="test_session",
        new_message=genai_types.Content(
            role="user", 
            parts=[genai_types.Part.from_text(text=query)]
        ),
    ):
        if event.is_final_response():
            print(f"Final Response: {event.content.parts[0].text}")
        elif event.get_function_calls():
            for call in event.get_function_calls():
                print(f"Tool Call: {call.name}({call.args})")
        elif event.get_function_responses():
            for response in event.get_function_responses():
                print(f"Tool Response: {response.response}")


if __name__ == "__main__":
    asyncio.run(main())

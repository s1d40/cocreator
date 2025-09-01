import asyncio
import os

from dotenv import load_dotenv

from google.adk.agents import LlmAgent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types as genai_types
from google.adk.artifacts import InMemoryArtifactService

from app.tools import generate_image

load_dotenv()

os.environ.setdefault("GOOGLE_CLOUD_PROJECT", os.getenv("GOOGLE_CLOUD_PROJECT"))
os.environ.setdefault("GOOGLE_CLOUD_LOCATION", os.getenv("GOOGLE_CLOUD_LOCATION", "global"))
os.environ.setdefault("GOOGLE_GENAI_USE_VERTEXAI", os.getenv("GOOGLE_GENAI_USE_VERTEXAI", "True"))


async def main():
    """Runs the image generation agent with a sample query."""
    session_service = InMemorySessionService()
    await session_service.create_session(
        app_name="image_test_app", user_id="test_user", session_id="test_session"
    )

    image_agent = LlmAgent(
        model="gemini-2.5-pro",
        name="image_generator_agent",
        instruction="You are an image generation expert. Only use the provided tools to generate images.",
        description="Generates images based on user prompts.",
        tools=[generate_image]
    )

    runner = Runner(
        agent=image_agent, app_name="image_test_app", session_service=session_service, artifact_service=InMemoryArtifactService()
    )

    query = "Generate an image of a cat playing a piano."
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

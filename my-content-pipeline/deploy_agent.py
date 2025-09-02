import asyncio
from app.agents import root_agent
from vertexai.preview import reasoning_engines

async def main():
    """Deploys the agent to Vertex AI Reasoning Engines."""
    # Wrap the root_agent for deployment
    app_for_engine = reasoning_engines.AdkApp(agent=root_agent, enable_tracing=True)

    # Deploy
    remote_app = reasoning_engines.create(
        reasoning_engine=app_for_engine,
        requirements=[
            "google-cloud-aiplatform[adk,reasoning_engines]",
            "google-generativeai",
            "python-dotenv"
        ],
        display_name="cocreator-agent"
    )
    print(f"Deployed agent resource name: {remote_app.resource_name}")

if __name__ == "__main__":
    asyncio.run(main())

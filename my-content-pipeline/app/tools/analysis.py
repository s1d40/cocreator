import gensim
from gensim.corpora import Dictionary
from gensim.models import LdaModel
from sklearn.feature_extraction.text import CountVectorizer

def analyze_themes(text: str, num_topics: int = 5, num_words: int = 5) -> str:
    """
    Analyzes the themes of a given text using LDA topic modeling.

    Args:
        text: The text to analyze.
        num_topics: The number of topics to extract.
        num_words: The number of words to display per topic.

    Returns:
        A string containing the extracted themes.
    """
    try:
        # Preprocess the text
        vectorizer = CountVectorizer(stop_words='english')
        data_vectorized = vectorizer.fit_transform([text])

        # Create a dictionary and corpus
        corpus = gensim.matutils.Sparse2Corpus(data_vectorized, documents_columns=False)
        id2word = dict((v, k) for k, v in vectorizer.vocabulary_.items())

        # Build the LDA model
        lda = LdaModel(corpus=corpus, id2word=id2word, num_topics=num_topics)

        # Get the topics
        topics = lda.print_topics(num_words=num_words)

        return str(topics)
    except Exception as e:
                return f"Error analyzing themes: {e}"

import asyncio
import json
from app.config import DEFAULT_LLM_MODEL
from google.adk.agents import LlmAgent

async def generate_social_media_post(text: str) -> dict:
    """
    Generates a social media post (title, description, hashtags) from a given text.

    Args:
        text: The text to generate the social media post from.

    Returns:
        A dictionary containing the title, description, and hashtags.
    """
    agent = LlmAgent(
        name="social_media_post_generator",
        model=DEFAULT_LLM_MODEL,
        instruction=f"""Generate a social media post from the following text: "{text}".
        Your response must be a single, raw JSON object with the keys "title", "description", and "hashtags".
        The title should be catchy and under 60 characters.
        The description should be engaging and under 280 characters.
        The hashtags must be a list of relevant string keywords.
        Do not include any other text or formatting.
        """,
    )
    
    # This is a simplified way to run an agent and get its final response.
    # Note: This approach doesn't use the full runner and context, so it's best for simple, one-off tasks.
    final_response = ""
    try:
        # The run_async method is an async generator
        async for event in agent.run_async(user_content=f"Generate post for: {text}"):
            if event.is_final_response() and event.content and event.content.parts:
                final_response = event.content.parts[0].text
                break # Stop after getting the first final response
        
        # Clean up the response and parse the JSON
        if final_response:
            # The model might wrap the JSON in ```json ... ```, so we need to strip that
            clean_json_str = final_response.strip().removeprefix("```json").removesuffix("```").strip()
            return json.loads(clean_json_str)
        else:
            return {"status": "error", "message": "Agent did not produce a final response."}

    except Exception as e:
        return {"status": "error", "message": f"Failed to generate or parse social media post: {e}"}

import requests
from bs4 import BeautifulSoup

def extract_content_from_url(url: str) -> str:
    """
    Extracts the text content from a given URL.

    Args:
        url: The URL to extract content from.

    Returns:
        The text content of the URL.
    """
    try:
        response = requests.get(url)
        response.raise_for_status()  # Raise an exception for bad status codes
        soup = BeautifulSoup(response.content, 'html.parser')
        # Remove script and style elements
        for script in soup(["script", "style"]):
            script.extract()
        return soup.get_text()
    except requests.exceptions.RequestException as e:
        return f"Error fetching URL: {e}"
from markdownify import markdownify as md

def convert_to_markdown(text: str, image_urls: list[str]) -> str:
    """
    Converts a given text to Markdown and embeds images.

    Args:
        text: The text to convert to Markdown.
        image_urls: A list of image URLs to embed in the Markdown.

    Returns:
        The Markdown string.
    """
    markdown = md(text)
    for url in image_urls:
        markdown += f"\n\n![Image]({url})"
    return markdown

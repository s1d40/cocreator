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
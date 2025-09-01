import os
from google import genai

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

with open("models.txt", "w") as f:
    f.write("List of models that support generateContent:\n\n")
    for m in client.models.list():
        for action in m.supported_actions:
            if action == "generateContent":
                f.write(m.name + "\n")

    f.write("\nList of models that support embedContent:\n\n")
    for m in client.models.list():
        for action in m.supported_actions:
            if action == "embedContent":
                f.write(m.name + "\n")

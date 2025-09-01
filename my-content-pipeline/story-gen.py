from google import genai
from google.genai import types
import os
import contextlib
import wave
import uuid
import re
from generate_story_prompt import generate_story_prompts
from config import INITIAL_PROMPT, LANGUAGES, AMOUNT, GENDERS, FEMALE_VOICES, MALE_VOICES
import random


client = genai.Client(api_key = os.environ.get("GEMINI_API_KEY"))
OUTPUT_DIR = "output"


def generate_story(prompt, language):
    # Create a request for the story generation
    
    contents = []
    config = types.GenerateContentConfig(
        system_instruction=f"""
        Generate a story based on the following prompt.
The story should be written in the {language} language.

The story MUST be written in the first person perspective (e.g., using "I", "me", "my").

The story MUST begin with a very strong, attention-grabbing opening line or a short, impactful scene that hooks the reader immediately. This opening should be a glimpse of a pivotal or intense moment from later in the story.

After this captivating opening, the narrative MUST then smoothly transition or "roll back" to the actual beginning of the story, explaining the events that led up to that initial hook.

The story should be grounded in realistic, everyday situations, avoiding overly fantastical or exaggerated elements, while still maintaining an engaging narrative. Focus on relatable characters and common life experiences.

The story MUST be written in a way that is easy to read and understand, avoiding overly complex language or convoluted sentence structures.

Do not include names of Companies, Products, or Services in the story.

""",
    top_k=40,
    top_p=0.95,
    response_mime_type="text/plain",
    )
    print(f"Generating story for prompt: {prompt}")
    response_text = []
    # Call the API to generate the story
    for chunk in client.models.generate_content_stream(
        model="gemini-2.5-flash-preview-05-20",
        contents=[
            types.Content(
                role="user",
                parts=[
                    types.Part.from_text(text=prompt),
                ],
            ),
        ],
        config=config,
    ):
        # Print the generated text
        response_text.append(chunk.text)
        #print(chunk.text, end="")

    # Print the generated story
    story = "".join(response_text)
    # Remove any unwanted characters from the story
    return story.replace("\n", " ").replace("\r", "").replace("\t", "").replace("  ", " ").strip()






@contextlib.contextmanager
def wave_file(filename, channels=1, rate=24000, sample_width=2):
    with wave.open(filename, "wb") as wf:
        wf.setnchannels(channels)
        wf.setsampwidth(sample_width)
        wf.setframerate(rate)
        yield wf



def generate_audio(content, voice_name):
    MODEL_ID = "gemini-2.5-pro-preview-tts" # @param ["gemini-2.5-flash-preview-tts","gemini-2.5-pro-preview-tts"] {"allow-input":true, isTemplate: true}
    print(f"Generating audio for voice: {voice_name}")
    # Generate audio content
    response = client.models.generate_content(
    model=MODEL_ID,
    contents=f"Read the following story with emotion as if you were the author'{content}'",
    # Set the configuration for the audio generation
    config={"response_modalities": ['Audio'],
            "speech_config":{
                "voice_config":{
                    "prebuilt_voice_config":{
                        "voice_name": voice_name,
                        
                    }
                }  
            }},
    )
    return response.candidates[0].content.parts[0].inline_data
   
def write_audio_to_file(blob, filename):
    with wave_file(filename=filename) as wf:
        wf.writeframes(blob.data)
        print(f"Audio saved to {filename}")
    

def write_text_to_file(text, filename):
    with open(filename, "w") as text_file:
        text_file.write(text)
        print(f"Text saved to {filename}")



if __name__ == "__main__":
    # Create the output directory if it doesn't exist
    
    # select a random gender from list of genders
    for i in range(AMOUNT):
        story_uuid = str(uuid.uuid4())
        os.makedirs(story_uuid, exist_ok=True)
        gender = random.choice(GENDERS)
        
        last_phrase = f"\n \n VERY IMPORTANT !! The character must be a {gender}"


        prompt = generate_story_prompts(INITIAL_PROMPT + last_phrase)
        

        
        
        
        for language in LANGUAGES:
                audio_filename = os.path.join(story_uuid, f"{language}_story_{story_uuid}.wav")
                text_filename = os.path.join(story_uuid, f"{language}_story_{story_uuid}.txt")
                # Example prompt
                
                story = generate_story(prompt, language=language)
                if gender == "FEMALE":
                    voice_name = random.choice(FEMALE_VOICES)
                else:
                    voice_name = random.choice(MALE_VOICES)
                print("using voice: ", voice_name, f"for {gender} character")
                story_audio = generate_audio(story, voice_name)
                print(type(story_audio))
                write_audio_to_file(story_audio, audio_filename)
                write_text_to_file(story, text_filename)
                # print the generated story
                print(story)   
                # Play the audio file
                #os.system(f"aplay {audio_filename}")
    







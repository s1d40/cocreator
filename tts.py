from google import genai
from google.genai import types
import os
import contextlib
import wave

api_key = os.environ.get("GEMINI_API_KEY")

MODEL_ID = "gemini-2.5-flash-preview-tts" # @param ["gemini-2.5-flash-preview-tts","gemini-2.5-pro-preview-tts"] {"allow-input":true, isTemplate: true}

client = genai.Client(api_key=api_key)


voice_names = ["Zephyr", "Puck", "Charon", "Kore", "Fenrir", "Leda", "Orus", "Aoede", "Callirrhoe", "Autonoe", "Enceladus", "Iapetus", "Umbriel", "Algieba", "Despina", "Erinome", "Algenib", "Rasalgethi", "Laomedeia", "Achernar", "Alnilam", "Schedar", "Gacrux", "Pulcherrima", "Achird", "Zubenelgenubi", "Vindemiatrix", "Sadachbia", "Sadaltager", "Sulafar"]



@contextlib.contextmanager
def wave_file(filename, channels=1, rate=24000, sample_width=2):
    with wave.open(filename, "wb") as wf:
        wf.setnchannels(channels)
        wf.setsampwidth(sample_width)
        wf.setframerate(rate)
        yield wf



def generate_audio(voice_name, content):
    print(f"Hello! my name is {voice_name}")
    # Generate audio content
    response = client.models.generate_content(
    model=MODEL_ID,
    contents=f"Say '{content}'",
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
    with open(filename, "wb") as audio_file:
        audio_file.write(blob.data)
        print(f"Audio saved to {filename}")
    # Save the audio content to a file  
    with wave_file(filename) as wf:
        wf.writeframes(blob.data)
        print(f"Audio saved to {filename}")
    # Play the audio file
    os.system(f"aplay {filename}")

    
def main():
    for voice_name in voice_names:
        content = f"Hello! my name is {voice_name}"
        audio_blob = generate_audio(voice_name, content)
        write_audio_to_file(audio_blob, f"{voice_name}.wav")
        # Play the audio file
        #print(f"Audio saved to {voice_name}.wav")
        # Play the audio blob


female = ["Zephyr", "Kore", "Leda", "Aoede", "Callirrhoe", "Despina", "Erinome", "Laomedeia", "Achernar", "Gacrux", "Pulcherrima", "Autonoe", "Vindemiatrix"]

male = ['Puck', 'Charon', 'Fenrir', 'Orus', 'Enceladus', 'Iapetus', 'Umbriel', 'Algieba', 'Algenib', 'Rasalgethi', 'Alnilam', 'Schedar', 'Achird', 'Zubenelgenubi', 'Sadachbia', 'Sadaltager', 'Sulafar']
for voice_name in voice_names:
    if voice_name not in female:
        male.append(voice_name)
print(male)

main()
import logging
import os
import uuid
import random
from typing import Any

from google.cloud import texttospeech
from google.adk.tools import ToolContext
from vertexai.generative_models import Part
from vertexai.vision_models import ImageGenerationModel
from moviepy import ImageClip, concatenate_videoclips, AudioFileClip, concatenate_audioclips

logger = logging.getLogger(__name__)

# Voice lists updated for the standard Text-to-Speech API
female_voices = ["en-US-Wavenet-F", "en-US-Wavenet-H", "en-US-Neural2-C", "en-GB-Neural2-F"]
male_voices = ['en-US-Wavenet-D', 'en-US-Wavenet-J', 'en-US-Neural2-I', 'en-GB-Neural2-D']

image_model = ImageGenerationModel.from_pretrained("imagen-3.0-fast-generate-001")

async def generate_image(prompt: str, tool_context: ToolContext) -> dict[str, Any]:
    """
    Generates an image based on the given prompt.
    """
    logger.info("Generating image for prompt: %s", prompt)
    images = image_model.generate_images(
        prompt=prompt,
        number_of_images=1,
        aspect_ratio="16:9",
    )
    image_bytes = images[0]._image_bytes
    image_id = str(uuid.uuid4())
    image_part = Part.from_data(data=image_bytes, mime_type="image/png")
    output_dir = "generated_images"
    os.makedirs(output_dir, exist_ok=True)
    local_file_path = os.path.join(output_dir, f"image_{image_id}.png")
    with open(local_file_path, "wb") as f:
        f.write(image_bytes)
    logger.info(f"Image saved locally to: {local_file_path}")
    image_url = await tool_context.save_artifact(f"image_{image_id}.png", image_part)
    logger.info("Generated image (artifact service): %s", image_url)
    if image_url == 0:
        return {"status": "success", "image_url": f"Image generated and saved locally to: {local_file_path} (In-memory ID: image_{image_id}.png)"}
    else:
        return {"status": "success", "image_url": image_url}

async def synthesize_voiceover(text: str, voice_name: str = "en-US-Neural2-D", tool_context: ToolContext = None) -> dict[str, Any]:
    """
    Converts the given text to speech (voiceover) using the standard Google Cloud TTS API.
    Handles long text by chunking it into smaller segments.
    Returns the audio URL and the original transcript.
    """
    logger.info(f"Generating voiceover for text: '{text[:50]}...' with voice: {voice_name}")
    try:
        client = texttospeech.TextToSpeechClient()
        
        # Chunk the text into smaller parts
        text_chunks = [text[i:i+4500] for i in range(0, len(text), 4500)]
        audio_segments = []
        
        output_dir = "generated_audio"
        os.makedirs(output_dir, exist_ok=True)

        for i, chunk in enumerate(text_chunks):
            synthesis_input = texttospeech.SynthesisInput(text=chunk)
            voice = texttospeech.VoiceSelectionParams(
                language_code=voice_name.split('-')[0] + '-' + voice_name.split('-')[1],
                name=voice_name,
            )
            audio_config = texttospeech.AudioConfig(
                audio_encoding=texttospeech.AudioEncoding.MP3
            )
            response = client.synthesize_speech(
                input=synthesis_input, voice=voice, audio_config=audio_config
            )
            
            segment_path = os.path.join(output_dir, f"segment_{i}.mp3")
            with open(segment_path, "wb") as f:
                f.write(response.audio_content)
            audio_segments.append(AudioFileClip(segment_path))

        final_audio = concatenate_audioclips(audio_segments)
        audio_id = str(uuid.uuid4())
        local_file_path = os.path.join(output_dir, f"audio_{audio_id}.mp3")
        final_audio.write_audiofile(local_file_path)

        # Clean up segment files
        for segment_path in [seg.filename for seg in audio_segments]:
            os.remove(segment_path)

        with open(local_file_path, "rb") as f:
            audio_bytes = f.read()

    except Exception as e:
        logger.error(f"Error synthesizing speech: {e}")
        return {"status": "error", "message": f"Error synthesizing speech: {e}"}
    
    audio_part = Part.from_data(data=audio_bytes, mime_type="audio/mp3")
    audio_url = await tool_context.save_artifact(f"audio_{audio_id}.mp3", audio_part)
    logger.info("Generated audio artifact: %s", audio_url)
    
    response = {
        "status": "success",
        "transcript": text,
        "audio_url": f"Audio generated and saved locally to: {local_file_path} (In-memory ID: audio_{audio_id}.mp3)"
    }
    if audio_url != 0:
        response["audio_url"] = audio_url
        
    return response

async def synthesize_voiceover_with_random_voice(text: str, tool_context: ToolContext) -> dict[str, Any]:
    """
    Synthesizes a voiceover from a given text using a randomly selected voice.
    """
    selected_voice = random.choice(female_voices + male_voices)
    return await synthesize_voiceover(text, voice_name=selected_voice, tool_context=tool_context)

async def create_video_from_assets(image_paths: list[str], audio_paths: list[str], tool_context: ToolContext) -> dict[str, Any]:
    """
    Creates a video from a list of images and a corresponding list of audio files.
    Each image is displayed for the duration of its corresponding audio clip.
    """
    logger.info("Creating synchronized video from assets.")
    try:
        temp_dir = "/tmp/generated_videos"
        os.makedirs(temp_dir, exist_ok=True)
        video_filename = f"{uuid.uuid4()}.mp4"
        video_path = os.path.join(temp_dir, video_filename)

        audio_clips = [AudioFileClip(path) for path in audio_paths]
        final_audio = concatenate_audioclips(audio_clips)

        clips = []
        for i, image_path in enumerate(image_paths):
            duration = audio_clips[i].duration
            clips.append(ImageClip(image_path, duration=duration))

        video = concatenate_videoclips(clips, method="compose")
        video.audio = final_audio
        video.write_videofile(video_path, fps=24)

        with open(video_path, "rb") as f:
            video_bytes = f.read()
        video_url = await tool_context.save_artifact(f"video_{uuid.uuid4()}.mp4", Part.from_data(data=video_bytes, mime_type="video/mp4"))
        logger.info("Generated video: %s", video_url)
        return {"status": "success", "video_url": video_url}
    except Exception as e:
        logger.error("Error creating video: %s", e)
        return {"status": "error", "message": f"Error creating video: {e}"}

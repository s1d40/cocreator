# Copyright 2025 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

from google.cloud import translate_v2 as translate
from google.adk import tool

translate_client = translate.Client()

@tool
def translate_text(text: str, target_language: str) -> str:
    """Translates text into the target language using Google Cloud Translation.

    Args:
        text: The text to translate.
        target_language: The ISO 639-1 code for the target language (e.g., 'pt' for Portuguese).

    Returns:
        The translated text.
    """
    result = translate_client.translate(text, target_language=target_language)
    return result["translatedText"]
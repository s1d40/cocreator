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

import os
from dotenv import load_dotenv
import google.auth

# Load environment variables
load_dotenv()

# Set default environment variables for Vertex AI
try:
    _, project_id = google.auth.default()
    os.environ.setdefault("GOOGLE_CLOUD_PROJECT", project_id)
except (google.auth.exceptions.DefaultCredentialsError, FileNotFoundError):
    # Use a default project ID or raise an error if credentials are not found
    os.environ.setdefault("GOOGLE_CLOUD_PROJECT", "your-gcp-project-id")

os.environ.setdefault("GOOGLE_CLOUD_LOCATION", os.getenv("GOOGLE_CLOUD_LOCATION", "global"))
os.environ.setdefault("GOOGLE_GENAI_USE_VERTEXAI", os.getenv("GOOGLE_GENAI_USE_VERTEXAI", "True"))

# Import the final root_agent from the refactored agents package
from app.agents import root_agent
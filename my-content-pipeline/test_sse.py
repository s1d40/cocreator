import requests
import json
import sys

BASE_URL = "http://127.0.0.1:8000"
APP_NAME = "app"
USER_ID = "user" # Using "user" as the user ID

def create_session():
    """Creates a new session and returns the session ID."""
    url = f"{BASE_URL}/apps/{APP_NAME}/users/{USER_ID}/sessions"
    response = requests.post(url)
    response.raise_for_status()
    # The session ID is in the 'id' field of the response
    return response.json()["id"]

def run_sse(session_id: str):
    """Runs the SSE endpoint with a sample message and saves the response to a file."""
    url = f"{BASE_URL}/run_sse"
    payload = {
        "appName": APP_NAME,
        "userId": USER_ID,
        "sessionId": session_id,
        "newMessage": {
            "parts": [
                {
                    "text": "Hello"
                }
            ],
            "role": "user"
        }
    }
    headers = {"Content-Type": "application/json"}
    response = requests.post(url, headers=headers, data=json.dumps(payload), stream=True)
    response.raise_for_status()

    with open("sse_response.json", "w") as f:
        for line in response.iter_lines():
            if line:
                decoded_line = line.decode('utf-8')
                if decoded_line.startswith('data:'):
                    try:
                        data = json.loads(decoded_line[5:])
                        print(json.dumps(data, indent=2))
                        f.write(json.dumps(data) + "\n")
                    except json.JSONDecodeError:
                        print(f"Could not decode line: {decoded_line}")


if __name__ == "__main__":
    session_id_arg = sys.argv[1] if len(sys.argv) > 1 else None
    try:
        if session_id_arg:
            session_id = session_id_arg
            print(f"Using provided session ID: {session_id}")
        else:
            session_id = create_session()
            print(f"Successfully created session: {session_id}")
        run_sse(session_id)
    except requests.exceptions.RequestException as e:
        print(f"An error occurred: {e}")
    except KeyError:
        print("Error: 'id' key not found in the create session response.")

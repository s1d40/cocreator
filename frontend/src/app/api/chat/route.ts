
import { NextRequest } from 'next/server';

// The URL of your running ADK api_server
const ADK_API_SERVER_URL = 'http://localhost:8000';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, app_name, user_id, session_id } = body;

    if (!message || !app_name || !user_id || !session_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400 }
      );
    }

    // Prepare the request to the ADK /run_sse endpoint
    const adkRequestPayload = {
      app_name,
      user_id,
      session_id,
      new_message: {
        role: 'user',
        parts: [{ text: message }],
      },
    };

    const adkResponse = await fetch(`${ADK_API_SERVER_URL}/run_sse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
      },
      body: JSON.stringify(adkRequestPayload),
    });

    if (!adkResponse.ok) {
      const errorText = await adkResponse.text();
      return new Response(
        JSON.stringify({ error: `ADK server error: ${errorText}` }),
        { status: adkResponse.status }
      );
    }

    // Create a ReadableStream to proxy the response from the ADK server
    const stream = new ReadableStream({
      async start(controller) {
        if (!adkResponse.body) {
          controller.close();
          return;
        }
        const reader = adkResponse.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }
          const chunk = decoder.decode(value);
          controller.enqueue(new TextEncoder().encode(chunk));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Error in chat API route:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
    });
  }
}

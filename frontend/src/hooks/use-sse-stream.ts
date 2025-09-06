import { useState, useRef } from 'react';
import { toast } from '../hooks/use-toast';

type SseHook = {
  startSseStream: (url: string, body: any) => Promise<void>;
  abortSseStream: () => void;
  sseData: any | null;
  sseError: Error | null;
  isSseLoading: boolean;
};

export function useSseStream(): SseHook {
  const [sseData, setSseData] = useState<any | null>(null);
  const [sseError, setSseError] = useState<Error | null>(null);
  const [isSseLoading, setIsSseLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const startSseStream = async (url: string, body: any) => {
    setIsSseLoading(true);
    setSseError(null);
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: abortControllerRef.current.signal,
      });

      if (!response.body) {
        const error = new Error('Response body is null');
        setSseError(error);
        toast({
          title: "Streaming Error",
          description: error.message,
          variant: "destructive",
        });
        throw error; // Re-throw to ensure finally block is reached
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const rawJsonString = line.substring(6);
            console.log("SSE Raw Line:", rawJsonString); // Log the raw line

            try {
              const json = JSON.parse(rawJsonString);
              setSseData(json);
            } catch (parseError: any) {
              // Attempt to handle malformed error responses from backend
              // This is a specific workaround for the known malformed error format
              if (rawJsonString.includes("400 Bad Request") && rawJsonString.includes("Request contains an invalid argument.")) {
                console.error("Malformed error JSON received from backend:", rawJsonString);
                // Extract the message part from the malformed string
                const messageMatch = rawJsonString.match(/'message': '(.*?)', 'status'/);
                let errorMessage = "An unknown backend error occurred.";
                if (messageMatch && messageMatch[1]) {
                  // Attempt to parse the inner message string as JSON
                  try {
                    // Replace single quotes with double quotes for valid JSON parsing
                    const cleanedInnerJsonString = messageMatch[1].replace(/\n/g, '').replace(/'/g, '"');
                    const innerJson = JSON.parse(cleanedInnerJsonString);
                    errorMessage = innerJson.error.message || errorMessage;
                  } catch (innerParseError) {
                    // Fallback if inner JSON parsing also fails
                    errorMessage = "Backend Error: Request contains an invalid argument. (Malformed response)";
                  }
                }

                setSseError(new Error(errorMessage));
                toast({
                  title: "Backend Error",
                  description: errorMessage,
                  variant: "destructive",
                });
              } else {
                console.error("Failed to parse SSE data:", rawJsonString, parseError);
                setSseError(new Error(`Failed to parse SSE data: ${parseError.message}`));
                toast({
                  title: "Streaming Error",
                  description: `Failed to parse SSE data: ${parseError.message}`,
                  variant: "destructive",
                });
              }
            }
          }
        }
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error("Error in SSE stream:", error);
        setSseError(error);
        toast({
          title: "Streaming Error",
          description: error.message || "An unknown streaming error occurred.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSseLoading(false);
    }
  };

  const abortSseStream = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  return {
    startSseStream,
    abortSseStream,
    sseData,
    sseError,
    isSseLoading,
  };
}

"use client";

import { useState, useEffect, useRef } from 'react';

type Message = {
  role: 'user' | 'agent';
  text: string;
};

type VideoAsset = {
  title: string;
  description: string;
  hashtags: string;
  image_prompt: string;
  transcript: string;
  video_url: string;
  image_url: string;
  audio_url: string;
};

type Progress = {
  current_step: number;
  total_steps: number;
  message: string;
};

export function useCocreatorStudio() {
  const [currentInput, setCurrentInput] = useState('');
  const [conversation, setConversation] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<{ videos: VideoAsset[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [thoughts, setThoughts] = useState<string[]>([]);
  const [keyInfo, setKeyInfo] = useState<Record<string, any> | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const initializeSession = async () => {
      let sid = localStorage.getItem('sessionId');
      if (!sid) {
        sid = `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        localStorage.setItem('sessionId', sid);
      }
      setSessionId(sid);
      // You could fetch conversation history here if you were storing it
    };

    initializeSession();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const sendMessage = async (messageText: string, currentSessionId?: string) => {
    const sid = currentSessionId || sessionId;
    if (!sid) {
      setError("Session not established.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedContent(null);
    setProgress(null);
    setThoughts([]);
    abortControllerRef.current = new AbortController();

    if (messageText !== '' && messageText !== '__START_CONVERSATION__') {
      setConversation(prev => [...prev, { role: 'user', text: messageText }]);
    }

    try {
      const response = await fetch('/api/run_sse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          app_name: 'app',
          user_id: 'test_user',
          session_id: sid,
          new_message: {
            role: 'user',
            parts: [{ text: messageText }],
          },
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.body) throw new Error('Response body is null');

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
            const json = JSON.parse(line.substring(6));
            console.log("Received SSE data:", json);

            if (json.event === 'data' && json.data.content?.parts?.[0]?.text) {
              const agentMessage = json.data.content.parts[0].text;
              
              try {
                const progressData = JSON.parse(agentMessage);
                if (progressData.current_step && progressData.total_steps && progressData.message) {
                  setProgress(progressData);
                  continue;
                }
              } catch (e) {
                // Not a progress message
              }

              if (json.data.is_final_response) {
                try {
                  const finalData = JSON.parse(agentMessage);
                  if (finalData.videos) {
                    setGeneratedContent(finalData);
                  } else {
                    setConversation(prev => [...prev, { role: 'agent', text: agentMessage }]);
                  }
                } catch (e) {
                  setConversation(prev => [...prev, { role: 'agent', text: agentMessage }]);
                }
              } else {
                setConversation(prev => [...prev, { role: 'agent', text: agentMessage }]);
              }
            } else if (json.event === 'data' && json.data.content?.parts?.[0]?.thought_signature) {
              const thought = json.data.content.parts[0].thought_signature.thought;
              setThoughts(prev => [...prev, thought]);
            }
          }
        }
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error("Error calling agent:", error);
        setError("An error occurred while communicating with the agent.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInput.trim()) {
      setError("Please enter a message.");
      return;
    }
    await sendMessage(currentInput);
    setCurrentInput('');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const fileContent = event.target?.result as string;
        const message = `Filename: ${file.name}\n\nContent:\n${fileContent}`;
        sendMessage(message);
      };
      reader.readAsText(file);
    }
  };

  const clearSession = () => {
    localStorage.removeItem('sessionId');
    const newSid = `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem('sessionId', newSid);
    setSessionId(newSid);
    setConversation([]);
    setGeneratedContent(null);
    setError(null);
    setProgress(null);
    setThoughts([]);
  };

  return {
    currentInput,
    setCurrentInput,
    conversation,
    isLoading,
    generatedContent,
    error,
    progress,
    thoughts,
    handleSubmit,
    handleFileChange,
    clearSession,
  };
}

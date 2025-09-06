'use client';

import { useState, FormEvent, useEffect } from 'react';
import { FileUploader } from '../../components/FileUploader';
import { ResultsView } from '../../components/ResultsView';
import { logger } from '../../lib/logger';

// Define a type for the chat message structure
interface Message {
  role: 'user' | 'agent';
  text: string;
}

// Define a type for the ADK Event object structure (simplified)
interface AdkEvent {
  author: string;
  content?: {
    parts: Array<{ text?: string }>;
  };
  is_final_response: boolean;
}

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

// Component to render a single chat message, handling media links
const ChatMessage = ({ message }: { message: Message }) => {
  const mediaRegex = /\n\[MEDIA: (https?:\/\/[^\]]+)\]/;
  const match = message.text.match(mediaRegex);

  if (message.role === 'agent' && match) {
    const textBeforeMedia = message.text.split(match[0])[0];
    const mediaUrl = match[1];
    return (
      <div>
        <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{textBeforeMedia}</p>
        <ResultsView url={mediaUrl} />
      </div>
    );
  }

  return <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{message.text}</p>;
};

export default function ChatPage() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');

  // File upload state
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);

  useEffect(() => {
    let storedSessionId = localStorage.getItem('chatSessionId');
    if (storedSessionId) {
      logger.info('Restoring session', { sessionId: storedSessionId });
      setSessionId(storedSessionId);
    } else {
      storedSessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      logger.info('Starting new session', { sessionId: storedSessionId });
      localStorage.setItem('chatSessionId', storedSessionId);
      setSessionId(storedSessionId);
    }
  }, []);

  const handleFileUpload = async (selectedFile: File) => {
    setFile(selectedFile);
    setUploadStatus('uploading');
    logger.info('File upload started', { filename: selectedFile.name });

    try {
      const response = await fetch('/api/generate-upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: selectedFile.name,
          contentType: selectedFile.type,
        }),
      });

      if (!response.ok) throw new Error('Failed to get signed URL.');
      const { url } = await response.json();

      const uploadResponse = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': selectedFile.type },
        body: selectedFile,
      });

      if (!uploadResponse.ok) throw new Error('File upload to GCS failed.');

      const gcsUri = `gs://${process.env.NEXT_PUBLIC_GCP_PROJECT_ID}-my-content-pipeline-file-uploads/${selectedFile.name}`;
      setUploadedFileUrl(gcsUri);
      setUploadStatus('success');
      logger.info('File upload successful', { gcsUri });

    } catch (error) {
      logger.error('File upload error', { error });
      setUploadStatus('error');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !uploadedFileUrl) return;

    let messageToSend = input;
    if (uploadedFileUrl) {
        messageToSend += `\n\n[File attached: ${uploadedFileUrl}]`;
        setFile(null);
        setUploadedFileUrl(null);
        setUploadStatus('idle');
    }

    logger.info('Submitting message', { message: messageToSend });
    const userMessage: Message = { role: 'user', text: messageToSend };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const agentMessage: Message = { role: 'agent', text: '' };
    setMessages((prev) => [...prev, agentMessage]);

    const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            message: messageToSend,
            app_name: 'my-content-pipeline',
            user_id: 'test-user-123',
            session_id: sessionId,
        }),
    });

    if (!response.body) return;

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        const chunk = decoder.decode(value, { stream: true });
        
        const lines = chunk.split('\n').filter(line => line.trim().startsWith('data:'));

        for (const line of lines) {
            const jsonString = line.replace(/^data: /, '');
            if (jsonString.trim() === '[DONE]') {
                done = true;
                break;
            }
            try {
                const eventData: AdkEvent = JSON.parse(jsonString);
                if (eventData.content?.parts?.[0]?.text) {
                    logger.info('Received agent response chunk', { text: eventData.content.parts[0].text });
                    setMessages((prev) =>
                        prev.map((msg, index) =>
                            index === prev.length - 1 ? { ...msg, text: msg.text + eventData.content!.parts[0].text! } : msg
                        )
                    );
                }

                if (eventData.is_final_response) {
                    done = true;
                    break;
                }
            } catch (e) {
                logger.error('Failed to parse SSE event', { error: e, chunk: jsonString });
            }
        }
    }

    setIsLoading(false);
    logger.info('Message stream finished');
  };

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: '600px', margin: 'auto', padding: '20px' }}>
      <div style={{ height: '400px', border: '1px solid #ccc', overflowY: 'auto', padding: '10px', marginBottom: '10px' }}>
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: '10px' }}>
            <strong>{m.role === 'user' ? 'You' : 'Agent'}:</strong>
            <ChatMessage message={m} />
          </div>
        ))}
      </div>

      <div style={{ marginBottom: '10px' }}>
        <FileUploader onFileUpload={handleFileUpload} disabled={isLoading || uploadStatus === 'uploading'} />
        {file && (
            <div style={{ marginTop: '10px' }}>
                <span>Selected file: {file.name}</span>
                {uploadStatus === 'uploading' && <p>Uploading...</p>}
                {uploadStatus === 'success' && <p>Upload successful!</p>}
                {uploadStatus === 'error' && <p>Upload failed. Please try again.</p>}
            </div>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading || uploadStatus === 'uploading'}
          style={{ width: '80%', padding: '8px' }}
          placeholder="Ask the agent..."
        />
        <button type="submit" disabled={isLoading || uploadStatus === 'uploading'} style={{ width: '18%', padding: '8px' }}>
          {isLoading ? '...' : 'Send'}
        </button>
      </form>
    </div>
  );
}

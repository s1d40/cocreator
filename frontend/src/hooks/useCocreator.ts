"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSseStream } from './use-sse-stream';
import { useConversationManager } from './use-conversation-manager';
import { toast } from '../hooks/use-toast';

  type Message = {
    role: 'user' | 'agent';

    content?: string;
    fileUri?: string;
    mimeType?: string;
    displayName?: string;
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

type ErrorState = {
  title: string;
  message: string;
  details?: string;
};

type Thought = {
  type: 'search' | 'writing' | 'generating_image' | 'analyzing' | 'reading' | 'extracting' | 'creating' | 'unknown';
  message: string;
};

export function useCocreator() {
  const [currentInput, setCurrentInput] = useState('');
  const [stagedFile, setStagedFile] = useState<File | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [uiState, setUiState] = useState<'CHAT' | 'GENERATING' | 'RESULTS'>('CHAT');
  const [generatedContent, setGeneratedContent] = useState<any | null>(null);
  const [progress, setProgress] = useState<any | null>(null);
  const [thoughts, setThoughts] = useState<any[]>([]);
  
  const { conversation, addMessage, clearConversation } = useConversationManager();
  const { startSseStream, abortSseStream, sseData, sseError, isSseLoading } = useSseStream();

  const APP_NAME = 'app';
  const USER_ID = 'test_user';

  const initializeSession = useCallback(async (id?: string) => {
    setIsInitializing(true);
    let sid = id || localStorage.getItem('sessionId');
    if (sid) {
      try {
        const response = await fetch(`/api/apps/${APP_NAME}/users/${USER_ID}/sessions/${sid}`);
        if (!response.ok) {
          sid = null;
          localStorage.removeItem('sessionId');
          toast({
            title: "Session Expired",
            description: "Your previous session has expired. A new one will be created.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error validating session:', error);
        sid = null;
        localStorage.removeItem('sessionId');
        toast({
          title: "Session Validation Error",
          description: "Could not validate session. Creating a new one.",
          variant: "destructive",
        });
      }
    }

    if (!sid) {
      try {
        const response = await fetch(`/api/apps/${APP_NAME}/users/${USER_ID}/sessions`, {
          method: 'POST',
        });
        if (!response.ok) throw new Error('Failed to create session');
        const data = await response.json();
        sid = data.id;
        localStorage.setItem('sessionId', sid);
        toast({
          title: "New Session Created",
          description: `Session ID: ${sid}`,
        });
      } catch (error) {
        console.error('Error creating session:', error);
        toast({
          title: "Session Creation Failed",
          description: "Could not create a new session. Please try again later.",
          variant: "destructive",
        });
        setIsInitializing(false);
        return;
      }
    }
    setSessionId(sid);
    setIsInitializing(false);
  }, [APP_NAME, USER_ID]);

  useEffect(() => {
    initializeSession();
    return () => {
      abortSseStream();
    };
  }, [initializeSession]);

  useEffect(() => {
    if (sseData) {
      if (sseData.customMetadata?.progress) {
        setProgress(sseData.customMetadata.progress);
        setUiState('GENERATING');
      }
      if (sseData.customMetadata?.thought) {
        setThoughts(prev => [...prev, sseData.customMetadata.thought]);
      }
      if (sseData.content?.parts) {
        sseData.content.parts.forEach((part: any) => {
          if (part.text) {
            addMessage({ role: 'agent', content: part.text });
          } else if (part.fileData) {
            addMessage({
              role: 'agent',
              fileUri: part.fileData.fileUri,
              mimeType: part.fileData.mimeType,
              displayName: part.fileData.displayName || 'Attachment',
            });
          }
        });

        // Remove thoughtSignature from the parts before processing for finalData
        const contentPartsWithoutThoughtSignature = sseData.content.parts.map((part: any) => {
          const newPart = { ...part };
          if (newPart.thoughtSignature) {
            delete newPart.thoughtSignature;
          }
          return newPart;
        });

        if (sseData.customMetadata?.thought) {
          setThoughts(prev => [...prev, sseData.customMetadata.thought]);
        } else {
          const lastPart = contentPartsWithoutThoughtSignature[contentPartsWithoutThoughtSignature.length - 1];
          if (lastPart && lastPart.text) {
            try {
              const finalData = JSON.parse(lastPart.text);
              if (finalData.videos) {
                setGeneratedContent(finalData);
                setUiState('RESULTS');
              }
            } catch (e) {
            }
          }
        }
      }
    }
  }, [sseData, addMessage]);

  useEffect(() => {
    if (sseError) {
      toast({
        title: "Streaming Error",
        description: sseError.message || "An unknown streaming error occurred.",
        variant: "destructive",
      });
    }
  }, [sseError]);

  const sendMessage = useCallback(async (messageText: string, file: File | null) => {
    if (!sessionId) {
      console.error("Session ID not initialized");
      return;
    }

    const parts: any[] = [];
    if (messageText) {
        parts.push({ text: messageText });
    }

    const sendRequest = async (finalParts: any[]) => {
        const body = {
            appName: APP_NAME,
            userId: USER_ID,
            sessionId: sessionId,
            newMessage: { role: 'user', parts: finalParts },
            streaming: true,
        };
        await startSseStream('/api/run_sse', body);
    };

    if (file) {
      await new Promise<void>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const url = event.target?.result as string;
            const mediaPart = {
              inlineData: {
                displayName: file.name,
                data: url.split(',')[1],
                mimeType: file.type
              }
            };
            await sendRequest([...parts, mediaPart]);
            resolve();
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = (error) => {
          reject(error);
        };
        reader.readAsDataURL(file);
      });
    } else {
      await sendRequest(parts);
    }
  }, [sessionId, startSseStream, APP_NAME, USER_ID]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInput.trim() && !stagedFile) return;

    let messageForHistory = currentInput;
    if (stagedFile) {
        messageForHistory += `\n\n(File attached: ${stagedFile.name})`;
    }
    addMessage({ role: 'user', content: messageForHistory });

    await sendMessage(currentInput, stagedFile);

    setCurrentInput('');
    setStagedFile(null);
  }, [currentInput, stagedFile, addMessage, sendMessage]);

  const handleFileUpload = useCallback((file: File) => {
    setStagedFile(file);
  }, []);
  
  const removeStagedFile = useCallback(() => {
    setStagedFile(null);
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem('sessionId');
    setSessionId(null);
    clearConversation();
    setGeneratedContent(null);
    setProgress(null);
    setThoughts([]);
    setUiState('CHAT');
    initializeSession();
  }, [clearConversation, initializeSession]);

  const onSessionSelect = useCallback((id: string) => {
    setSessionId(id);
    clearConversation();
    setGeneratedContent(null);
    setProgress(null);
    setThoughts([]);
    setUiState('CHAT');
    initializeSession(id);
  }, [clearConversation, initializeSession]);

  const exportSession = useCallback(() => {
    if (conversation.length === 0) {
      toast({
        title: "No conversation to export",
        description: "The current session is empty.",
        variant: "destructive",
      });
      return;
    }

    const sessionData = {
      sessionId: sessionId,
      timestamp: new Date().toISOString(),
      conversation: conversation,
    };

    const filename = `session_${sessionId || 'new'}_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    const jsonStr = JSON.stringify(sessionData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Session Exported",
      description: `Conversation saved to ${filename}`,
    });
  }, [conversation, sessionId]);

  return {
    currentInput,
    setCurrentInput,
    conversation,
    isLoading: isSseLoading || isInitializing,
    handleSubmit,
    clearSession,
    uiState,
    progress,
    thoughts,
    generatedContent,
    error: sseError,
    stagedFile,
    handleFileUpload,
    removeStagedFile,
    userId: USER_ID,
    appName: APP_NAME,
    onSessionSelect,
    exportSession,
  };
}

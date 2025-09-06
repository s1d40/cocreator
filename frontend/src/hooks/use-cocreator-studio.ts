"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSseStream } from './use-sse-stream';
import { useConversationManager } from './use-conversation-manager';

type Message = {
  role: 'user' | 'agent';
  text: string;
};

export function useCocreatorStudio() {
  const [currentInput, setCurrentInput] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const { conversation, addMessage, clearConversation } = useConversationManager();
  const { startSseStream, sseData, isSseLoading } = useSseStream();

  const initializeSession = useCallback(async () => {
    let sid = localStorage.getItem('sessionId');
    if (!sid) {
      try {
        const response = await fetch('/api/apps/app/users/test_user/sessions', {
          method: 'POST',
        });
        if (!response.ok) {
          throw new Error('Failed to create session');
        }
        const data = await response.json();
        sid = data.id;
        localStorage.setItem('sessionId', sid);
      } catch (error) {
        console.error('Error creating session:', error);
        return;
      }
    }
    setSessionId(sid);
  }, []);

  useEffect(() => {
    initializeSession();
  }, [initializeSession]);

  useEffect(() => {
    if (sseData && sseData.content?.parts?.[0]?.text) {
      const agentMessage = sseData.content.parts[0].text;
      addMessage({ role: 'agent', text: agentMessage });
    }
  }, [sseData, addMessage]);

  const sendMessage = async (messageText: string) => {
    if (!sessionId) {
      console.error("Session ID not initialized");
      return;
    }

    const body = {
      appName: 'app',
      userId: 'test_user',
      sessionId: sessionId,
      newMessage: {
        role: 'user',
        parts: [{ text: messageText }],
      },
      streaming: true,
    };

    await startSseStream('/api/run_sse', body);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInput.trim()) return;

    addMessage({ role: 'user', text: currentInput });
    await sendMessage(currentInput);
    setCurrentInput('');
  };
  
  const clearSession = async () => {
    localStorage.removeItem('sessionId');
    setSessionId(null);
    clearConversation();
    await initializeSession();
  };

  return {
    currentInput,
    setCurrentInput,
    conversation,
    isLoading: isSseLoading,
    handleSubmit,
    clearSession,
  };
}

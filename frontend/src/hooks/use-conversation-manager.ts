import { useState, useCallback } from 'react';

type Message = {
  role: 'user' | 'agent';
  text: string;
  status?: 'pending' | 'sent';
};

type ConversationHook = {
  conversation: Message[];
  addMessage: (message: Message) => void;
  updateMessageStatus: (messageToUpdate: Message, status: 'pending' | 'sent') => void;
  clearConversation: () => void;
};

export function useConversationManager(): ConversationHook {
  const [conversation, setConversation] = useState<Message[]>([]);

  const addMessage = useCallback((message: Message) => {
    setConversation(prev => [...prev, message]);
  }, []);

  const updateMessageStatus = useCallback((messageToUpdate: Message, status: 'pending' | 'sent') => {
    setConversation(prev => prev.map(msg => msg === messageToUpdate ? { ...msg, status } : msg));
  }, []);

  const clearConversation = useCallback(() => {
    setConversation([]);
  }, []);

  return {
    conversation,
    addMessage,
    updateMessageStatus,
    clearConversation,
  };
}

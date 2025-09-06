"use client";

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, PlusCircle, Sparkles, History, Download } from 'lucide-react';
import { SessionManager } from './SessionManager';

interface Message {
  role: 'user' | 'agent';
  content?: string;
  fileUri?: string;
  mimeType?: string;
  displayName?: string;
}

interface SimpleChatProps {
  currentInput: string;
  setCurrentInput: (value: string) => void;
  conversation: Message[];
  isLoading: boolean;
  handleSubmit: (e: React.FormEvent) => void;
  clearSession: () => void;
  userId: string;
  appName: string;
  onSessionSelect: (sessionId: string) => void;
  onExportSession: () => void;
}

export function SimpleChat({
  currentInput,
  setCurrentInput,
  conversation,
  isLoading,
  handleSubmit,
  clearSession,
  userId,
  appName,
  onSessionSelect,
  onExportSession,
}: SimpleChatProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [showSessionManager, setShowSessionManager] = useState(false);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="container mx-auto h-full px-4 md:px-6">
      <Card className="max-w-2xl mx-auto shadow-lg h-full">
        <CardHeader>
            
        </CardHeader>
        <CardContent className="p-6 flex flex-col h-full">
          <ScrollArea className="flex-grow w-full p-4 border rounded-lg mb-4">
            <div className="flex flex-col space-y-4">
              {conversation.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex items-center gap-2 p-3 rounded-lg ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                    {msg.content && <p>{msg.content}</p>}
                    {msg.fileUri && msg.mimeType?.startsWith('image/') && (
                      <img src={msg.fileUri} alt={msg.displayName || 'Image'} className="max-w-xs rounded-lg" />
                    )}
                    {msg.fileUri && msg.mimeType?.startsWith('audio/') && (
                      <audio controls src={msg.fileUri} className="w-full" />
                    )}
                    {msg.fileUri && !msg.mimeType?.startsWith('image/') && !msg.mimeType?.startsWith('audio/') && (
                      <a href={msg.fileUri} download={msg.displayName} className="text-blue-500 underline">
                        Download {msg.displayName || 'File'}
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <form onSubmit={handleSubmit} className="mt-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                ref={inputRef}
                type="text"
                placeholder="Type your message..."
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                className="flex-grow text-lg"
                disabled={isLoading}
              />
              <Button type="submit" size="lg" className="group" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    Send <Sparkles className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardHeader>
          <div className="flex justify-between">
            <Button variant="outline" size="sm" onClick={clearSession} className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              New Session
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowSessionManager(!showSessionManager)} className="flex items-center gap-2">
              <History className="h-4 w-4" />
              {showSessionManager ? 'Hide Sessions' : 'View Sessions'}
            </Button>
            <Button variant="outline" size="sm" onClick={onExportSession} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Session
            </Button>
          </div>
        </CardHeader>
      </Card>
      {showSessionManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <SessionManager
            userId={userId}
            appName={appName}
            onSessionSelect={(sessionId) => {
              onSessionSelect(sessionId);
              setShowSessionManager(false);
            }}
          />
        </div>
      )}
    </div>
  );
}

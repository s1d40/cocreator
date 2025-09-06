"use client";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ScrollArea } from "@/components/ui/scroll-area"
import { useCocreatorStudio } from '@/hooks/use-cocreator-studio';
import { Loader2, PlusCircle, Sparkles } from 'lucide-react';

export function CocreatorStudio() {
  const {
    currentInput,
    setCurrentInput,
    conversation,
    isLoading,
    handleSubmit,
    clearSession,
  } = useCocreatorStudio();

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader>
            <h1 className="text-2xl font-bold">Simple Chat</h1>
        </CardHeader>
        <CardContent className="p-6">
          <ScrollArea className="h-[400px] w-full p-4 border rounded-lg mb-4">
            <div className="flex flex-col space-y-4">
              {conversation.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex items-center gap-2 p-3 rounded-lg ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
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
          <Button variant="outline" size="sm" onClick={clearSession} className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            New Session
          </Button>
        </CardHeader>
      </Card>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from "@/components/ui/scroll-area";

interface Session {
  id: string;
  created_at: string; // Assuming a timestamp or date string
}

interface SessionManagerProps {
  userId: string;
  appName: string;
  onSessionSelect: (sessionId: string) => void;
}

export function SessionManager({ userId, appName, onSessionSelect }: SessionManagerProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSessions = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Assuming the API endpoint for listing sessions
        const response = await fetch(`/api/apps/${appName}/users/${userId}/sessions`);
        if (!response.ok) {
          throw new Error(`Failed to fetch sessions: ${response.statusText}`);
        }
        const data = await response.json();
        // Assuming the API returns an array of session objects with 'id' and 'created_at'
        setSessions(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessions();
  }, [userId, appName]);

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader>
        <CardTitle>Your Sessions</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && <p>Loading sessions...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}
        {!isLoading && !error && sessions.length === 0 && (
          <p>No sessions found.</p>
        )}
        <ScrollArea className="h-64 w-full rounded-md border p-4">
          <div className="flex flex-col space-y-2">
            {sessions.map((session) => (
              <Button
                key={session.id}
                variant="outline"
                className="justify-start"
                onClick={() => onSessionSelect(session.id)}
              >
                Session ID: {session.id.substring(0, 8)}... (Created: {new Date(session.created_at).toLocaleString()})
              </Button>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

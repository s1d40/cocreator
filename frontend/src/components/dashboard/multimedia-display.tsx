'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Download, Share2, Pencil, RefreshCw, FileText } from 'lucide-react';
import { useState } from 'react';

type VideoContent = {
  url: string;
  title: string;
  duration: number; // in seconds
  aspectRatio: '16:9' | '9:16' | '1:1';
  createdAt: string; // ISO date string
};

type MultimediaDisplayProps = {
  content: VideoContent;
  onEdit: () => void; // Renamed from onReset to onEdit for clarity
  onStartNew: () => void; // Added for creating a completely new video
};

export function MultimediaDisplay({ content, onEdit, onStartNew }: MultimediaDisplayProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [videoTitle, setVideoTitle] = useState(content.title);

  const handleTitleSave = () => {
    setIsEditingTitle(false);
    // In a real app, you'd save the new title to your backend here.
    console.log('New title saved:', videoTitle);
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-4xl font-bold tracking-tighter">Your Video is Ready!</h2>
        <p className="text-muted-foreground text-lg mt-2">
          Review your creation, make edits, or start a new project.
        </p>
      </div>

      <Card className="overflow-hidden border-border/50">
        <div className="aspect-video bg-black">
          {/* In a real app, you might use a more advanced player for custom controls */}
          <video src={content.url} controls className="w-full h-full" />
        </div>
        <CardHeader>
          <div className="flex items-center justify-between">
            {isEditingTitle ? (
              <div className="flex items-center gap-2 flex-grow">
                <Input
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  className="text-2xl font-bold"
                  autoFocus
                  onBlur={handleTitleSave}
                  onKeyDown={(e) => e.key === 'Enter' && handleTitleSave()}
                />
                <Button onClick={handleTitleSave}>Save</Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <CardTitle className="text-2xl font-bold">{videoTitle}</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setIsEditingTitle(true)}>
                  <Pencil className="w-5 h-5" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="border-t pt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex flex-col">
            <span className="font-semibold">Duration</span>
            <span className="text-muted-foreground">{formatDuration(content.duration)}</span>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold">Aspect Ratio</span>
            <span className="text-muted-foreground">{content.aspectRatio}</span>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold">Created On</span>
            <span className="text-muted-foreground">{new Date(content.createdAt).toLocaleDateString()}</span>
          </div>
        </CardContent>
      </Card>

      {/* Integrated Action Bar */}
      <div className="bg-background-surface p-4 rounded-lg border border-border/50 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button size="lg" onClick={onEdit}>
            <Pencil className="mr-2 h-5 w-5" />
            Edit & Regenerate
          </Button>
          <Button size="lg" variant="outline">
            <Download className="mr-2 h-5 w-5" />
            Download Video
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <Button size="lg" variant="secondary">
            <Share2 className="mr-2 h-5 w-5" />
            Share
          </Button>
          <Button size="lg" variant="secondary" disabled>
            <FileText className="mr-2 h-5 w-5" />
            Download Transcript (soon)
          </Button>
        </div>
      </div>

      <div className="text-center pt-4">
        <Button onClick={onStartNew} variant="ghost">
          <RefreshCw className="mr-2 h-4 w-4" />
          Start a New Project
        </Button>
      </div>
    </div>
  );
}

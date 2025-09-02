"use client";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ArrowRight, Bot, Clapperboard, FileText, ImageIcon, Loader2, Mic, Sparkles, BrainCircuit, Paperclip, PlusCircle, Search, FileCode, ClipboardList } from 'lucide-react';
import { useCocreatorStudio } from '@/hooks/use-cocreator-studio';
import { Progress } from "@/components/ui/progress"

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

export function CocreatorStudio() {
  const {
    currentInput,
    setCurrentInput,
    conversation,
    isLoading,
    generatedContent,
    error,
    progress,
    thoughts,
    keyInfo,
    handleSubmit,
    handleFileChange,
    clearSession,
  } = useCocreatorStudio();

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h1 className="inline-block text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
          Cocreator Studio
        </h1>
        <p className="mt-4 text-muted-foreground md:text-xl">
          Enter a topic, URL, or upload a document to generate a series of short, captivating videos for social media.
        </p>
      </div>

      <Card className="max-w-2xl mx-auto mb-12 shadow-lg">
        <CardContent className="p-6">
          <ScrollArea className="h-[400px] w-full p-4 border rounded-lg mb-4">
            <div className="flex flex-col space-y-4">
              {conversation.map((msg, index) => (
                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-3 rounded-lg ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
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
                placeholder="e.g., 'The history of ancient Rome' or a https:// link"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                className="flex-grow text-lg"
                disabled={isLoading}
              />
              <Button type="button" size="lg" variant="outline" onClick={() => document.getElementById('file-upload')?.click()} disabled={isLoading}>
                <Paperclip className="h-5 w-5" />
              </Button>
              <input type="file" id="file-upload" style={{ display: 'none' }} onChange={handleFileChange} />
              <Button type="submit" size="lg" className="group" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    Generate <Sparkles className="ml-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  </>
                )}
              </Button>
            </div>
            {error && <p className="text-red-500 text-sm mt-2 text-left">{error}</p>}
          </form>
        </CardContent>
        <CardHeader>
          <Button variant="outline" size="sm" onClick={clearSession} className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            New Session
          </Button>
        </CardHeader>
      </Card>

      {isLoading && (
        <Card className="max-w-2xl mx-auto mb-12 shadow-lg">
          <CardContent className="p-6">
            <div className="text-center mb-4">
              <p className="text-lg text-muted-foreground">The AI is working... Please wait while we generate your content.</p>
            </div>
            {progress && (
              <div className="w-full">
                <Progress value={(progress.current_step / progress.total_steps) * 100} className="w-full" />
                <p className="text-sm text-muted-foreground text-center mt-2">{progress.message}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {(thoughts.length > 0 || keyInfo) && (
        <div className="max-w-2xl mx-auto mb-12 grid gap-8 md:grid-cols-2">
          {thoughts.length > 0 && (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <BrainCircuit className="h-8 w-8 text-primary" />
                  Agent Thoughts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-60">
                  <div className="p-4 bg-secondary rounded-lg">
                    {thoughts.map((thought, index) => (
                      <div key={index} className="flex items-start gap-3 mb-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          {getThoughtIcon(thought)}
                        </div>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap pt-1.5">
                          {thought}
                        </p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
          {keyInfo && (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <ClipboardList className="h-8 w-8 text-primary" />
                  Key Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-60">
                  <div className="p-4 bg-secondary rounded-lg">
                    {Object.entries(keyInfo).map(([key, value]) => (
                      <div key={key} className="mb-3">
                        <h4 className="font-semibold text-sm capitalize">{key.replace(/_/g, ' ')}</h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {generatedContent && (
        <div className="grid gap-8 animate-fade-in-up">
          <h2 className="text-3xl font-bold text-center">Your Generated Content</h2>
          {generatedContent.videos.map((video, index) => (
            <VideoResultCard key={index} video={video} />
          ))}
        </div>
      )}
    </div>
  );
}

function getThoughtIcon(thought: string) {
  const lowerThought = thought.toLowerCase();
  if (lowerThought.includes('search') || lowerThought.includes('browsing')) {
    return <Search className="h-5 w-5 text-primary" />;
  }
  if (lowerThought.includes('analyzing') || lowerThought.includes('reading') || lowerThought.includes('extracting')) {
    return <FileCode className="h-5 w-5 text-primary" />;
  }
  if (lowerThought.includes('generating') || lowerThought.includes('writing') || lowerThought.includes('creating')) {
    return <Sparkles className="h-5 w-5 text-primary" />;
  }
  return <Bot className="h-5 w-5 text-primary" />;
}

function VideoResultCard({ video }: { video: VideoAsset }) {
  return (
    <Card className="shadow-xl overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-2xl">
          <Clapperboard className="h-8 w-8 text-primary" />
          {video.title}
        </CardTitle>
        <CardDescription>{video.description}</CardDescription>
        <p className="text-sm text-primary font-semibold">{video.hashtags}</p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="video">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="video">Video</TabsTrigger>
            <TabsTrigger value="transcript">Transcript</TabsTrigger>
            <TabsTrigger value="image">Image</TabsTrigger>
            <TabsTrigger value="audio">Audio</TabsTrigger>
          </TabsList>
          <TabsContent value="video" className="mt-4">
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              <video src={video.video_url} controls className="w-full h-full" poster={video.image_url}>
                Your browser does not support the video tag.
              </video>
            </div>
          </TabsContent>
          <TabsContent value="transcript" className="mt-4">
            <div className="p-4 bg-secondary rounded-lg max-h-60 overflow-y-auto">
              <h3 className="font-bold mb-2 flex items-center gap-2"><FileText /> Transcript</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{video.transcript}</p>
            </div>
          </TabsContent>
          <TabsContent value="image" className="mt-4">
             <div className="p-4 bg-secondary rounded-lg">
                <h3 className="font-bold mb-2 flex items-center gap-2"><ImageIcon /> Generated Image</h3>
                <img src={video.image_url} alt="Generated visual" className="rounded-md w-full object-cover" />
                <p className="text-sm text-muted-foreground mt-2"><strong>AI Prompt:</strong> {video.image_prompt}</p>
             </div>
          </TabsContent>
          <TabsContent value="audio" className="mt-4">
            <div className="p-4 bg-secondary rounded-lg">
              <h3 className="font-bold mb-2 flex items-center gap-2"><Mic /> Voiceover</h3>
              <audio controls src={video.audio_url} className="w-full">
                Your browser does not support the audio element.
              </audio>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

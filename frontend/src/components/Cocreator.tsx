"use client";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bot, Clapperboard, FileText, ImageIcon, Loader2, Mic, Sparkles, BrainCircuit, Paperclip, PlusCircle, Search, FileCode, ClipboardList, Clock } from 'lucide-react';
import { useCocreator } from '@/hooks/useCocreator';
import { motion } from 'framer-motion';
import { ErrorDisplay } from '@/components/ui/error-display';
import { Progress } from "@/components/ui/progress"
import { useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { FileUpload } from '@/components/ui/file-upload';
import { SimpleChat } from '@/components/SimpleChat';

export function Cocreator() {
  const { uiState, userId, appName, onSessionSelect, exportSession, ...props } = useCocreator();

  return (
    <div className="container mx-auto h-full px-4 md:px-6">
      <div className="max-w-3xl mx-auto text-center mb-6">
        <h1 className="inline-block text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
          Cocreator Studio
        </h1>
        <p className="mt-2 text-muted-foreground text-sm md:text-base">
          Enter a topic, URL, or upload a document to generate a series of short, captivating videos for social media.
        </p>
      </div>

      {uiState === 'CHAT' && <ChatView userId={userId} appName={appName} onSessionSelect={onSessionSelect} onExportSession={exportSession} {...props} />}
      {uiState === 'GENERATING' && <GeneratingView {...props} />}
      {uiState === 'RESULTS' && <ResultsView {...props} />}
    </div>
  );
}

function ChatView(props: any) {
  const {
    handleFileUpload,
    stagedFile,
    removeStagedFile,
    userId,
    appName,
    onSessionSelect,
    ...chatProps
  } = props;

  const [isUploadOpen, setIsUploadOpen] = useState(false);

  return (
    <Card className="max-w-2xl mx-auto mb-12 shadow-lg">
      <CardContent className="p-6">
        <SimpleChat {...chatProps} isLoading={props.isLoading} userId={userId} appName={appName} onSessionSelect={onSessionSelect} />
        <Collapsible open={isUploadOpen} onOpenChange={setIsUploadOpen} className="w-full space-y-2 mt-4">
          <div className="flex items-center justify-between">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full">
                <Paperclip className="mr-2 h-4 w-4" />
                {isUploadOpen ? "Hide Upload" : "Show Upload"}
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent>
            <div className="mb-4">
              <FileUpload
                onFileUpload={handleFileUpload}
                file={stagedFile}
                onFileRemove={removeStagedFile}
              />
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}

function GeneratingView(props: any) {
    const { progress, thoughts } = props;
    return (
        <>
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
                                {thoughts.map((thought: any, index: number) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.5, delay: index * 0.1 }}
                                        className="flex items-start gap-3 mb-3">
                                        <div className="bg-primary/10 p-2 rounded-full">
                                            {getThoughtIcon(thought)}
                                        </div>
                                        <p className="text-sm text-muted-foreground whitespace-pre-wrap pt-1.5">
                                            {thought.message}
                                        </p>
                                    </motion.div>
                                ))}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            )}
        </>
    );
}

function ResultsView(props: any) {
    const { generatedContent } = props;
    return (
        generatedContent && (
            <motion.div
                className="grid gap-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h2 className="text-3xl font-bold text-center">Your Generated Content</h2>
                {generatedContent.videos.map((video: any, index: number) => (
                    <VideoResultCard key={index} video={video} />
                ))}
            </motion.div>
        )
    );
}

function getThoughtIcon(thought: any) {
  switch (thought.type) {
    case 'search':
      return <Search className="h-5 w-5 text-primary" />;
    case 'writing':
      return <Sparkles className="h-5 w-5 text-primary" />;
    case 'generating_image':
      return <ImageIcon className="h-5 w-5 text-primary" />;
    case 'analyzing':
    case 'reading':
    case 'extracting':
      return <FileCode className="h-5 w-5 text-primary" />;
    case 'creating':
      return <Clapperboard className="h-5 w-5 text-primary" />;
    default:
      return <Bot className="h-5 w-5 text-primary" />;
  }
}

function VideoResultCard({ video }: { video: any }) {
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
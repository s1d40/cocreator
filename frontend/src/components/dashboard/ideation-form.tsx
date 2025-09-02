'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wand2, Loader2, Youtube, Instagram, FileVideo, Link, Type, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type AspectRatio = '16:9' | '9:16' | '1:1';
type SourceType = 'topic' | 'url';
type Voice = 'leo' | 'aurora' | 'onyx';

type IdeationData = {
  sourceText: string;
  sourceType: SourceType;
  aspectRatio: AspectRatio;
  voice: Voice;
};

const voices = [
  { id: 'leo', name: 'Leo', description: 'Warm, Confident, Male' },
  { id: 'aurora', name: 'Aurora', description: 'Clear, Professional, Female' },
  { id: 'onyx', name: 'Onyx', description: 'Deep, Storyteller, Male' },
];

type IdeationFormProps = {
  onStartIdeation: (data: IdeationData) => Promise<void>;
  initialData?: IdeationData | null;
};

export function IdeationForm({ onStartIdeation, initialData }: IdeationFormProps) {
  const [sourceText, setSourceText] = useState(initialData?.sourceText || '');
  const [sourceType, setSourceType] = useState<SourceType>(initialData?.sourceType || 'topic');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(initialData?.aspectRatio || '16:9');
  const [selectedVoice, setSelectedVoice] = useState<Voice>(initialData?.voice || 'leo');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!sourceText.trim()) return;
    setIsGenerating(true);
    await onStartIdeation({ sourceText, sourceType, aspectRatio, voice: selectedVoice });
    // In a real app, you might want to reset the generating state based on a parent component's status
    setIsGenerating(false);
  };

  const handleGetIdeas = () => {
    const ideas = [
      'The future of space exploration',
      'The impact of AI on everyday life',
      'A brief history of the internet',
      'The science of sleep',
      'The world of competitive gaming',
    ];
    const randomIdea = ideas[Math.floor(Math.random() * ideas.length)];
    setSourceText(randomIdea);
    setSourceType('topic');
  };

  return (
    <Card className="max-w-2xl mx-auto bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle className="text-3xl font-bold text-center">
          {initialData ? 'Edit Your Video Idea' : 'Create Your Next Video'}
        </CardTitle>
        <CardDescription className="text-center">
          {initialData ? 'Adjust the details below and regenerate your video.' : 'Transform any topic, blog post, or idea into an engaging video with AI.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Content Source */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Content Source</h3>
            <div className="grid grid-cols-2 gap-2 p-1 bg-background-surface rounded-lg">
              <Button type="button" variant={sourceType === 'topic' ? 'default' : 'ghost'} onClick={() => setSourceType('topic')}>
                <Type className="mr-2 h-4 w-4" />
                Topic
              </Button>
              <Button type="button" variant={sourceType === 'url' ? 'default' : 'ghost'} onClick={() => setSourceType('url')}>
                <Link className="mr-2 h-4 w-4" />
                URL
              </Button>
            </div>
            <div className="flex gap-2">
              <Input
                id="sourceText"
                placeholder={sourceType === 'topic' ? "e.g., 'The future of AI marketing'" : "Enter a blog post URL"}
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                disabled={isGenerating}
                required
                className="text-base p-6 flex-grow"
              />
              {sourceType === 'topic' && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGetIdeas}
                  disabled={isGenerating}
                  className="h-auto"
                >
                  <Wand2 className="mr-2 h-4 w-4" />
                  Inspire Me
                </Button>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {sourceType === 'topic' 
                ? 'Provide a topic and our AI will write a script for you.' 
                : 'Provide a link to an article and our AI will summarize it.'}
            </p>
          </div>

          {/* Section 2: Voice Selection */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Choose a Voice</h3>
            <div className="grid grid-cols-3 gap-4">
              {voices.map((voice) => (
                <button
                  key={voice.id}
                  type="button"
                  className={cn(
                    'flex flex-col items-center justify-center p-4 border rounded-lg transition-colors text-center',
                    selectedVoice === voice.id ? 'border-primary ring-2 ring-primary' : 'border-border'
                  )}
                  onClick={() => setSelectedVoice(voice.id as Voice)}
                >
                  <Volume2 className="w-8 h-8 mb-2" />
                  <span className="font-medium">{voice.name}</span>
                  <span className="text-xs text-muted-foreground">{voice.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Video Style */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Select Video Format</h3>
            <div className="grid grid-cols-3 gap-4">
              <button
                type="button"
                className={cn(
                  'flex flex-col items-center justify-center p-4 border rounded-lg transition-colors',
                  aspectRatio === '16:9' ? 'border-primary ring-2 ring-primary' : 'border-border'
                )}
                onClick={() => setAspectRatio('16:9')}
              >
                <Youtube className="w-8 h-8 mb-2" />
                <span className="font-medium">16:9</span>
                <span className="text-xs text-muted-foreground">Landscape (YouTube)</span>
              </button>
              <button
                type="button"
                className={cn(
                  'flex flex-col items-center justify-center p-4 border rounded-lg transition-colors',
                  aspectRatio === '9:16' ? 'border-primary ring-2 ring-primary' : 'border-border'
                )}
                onClick={() => setAspectRatio('9:16')}
              >
                <Instagram className="w-8 h-8 mb-2" />
                <span className="font-medium">9:16</span>
                <span className="text-xs text-muted-foreground">Portrait (TikTok/Reels)</span>
              </button>
              <button
                type="button"
                className={cn(
                  'flex flex-col items-center justify-center p-4 border rounded-lg transition-colors',
                  aspectRatio === '1:1' ? 'border-primary ring-2 ring-primary' : 'border-border'
                )}
                onClick={() => setAspectRatio('1:1')}
              >
                <FileVideo className="w-8 h-8 mb-2" />
                <span className="font-medium">1:1</span>
                <span className="text-xs text-muted-foreground">Square (Social)</span>
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isGenerating || !sourceText.trim()}
            className="w-full text-lg py-6"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generating...
              </>
            ) : (
              initialData ? 'Regenerate Video' : 'Generate My Video'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
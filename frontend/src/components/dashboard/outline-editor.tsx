'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Check, Loader2, Wand2 } from 'lucide-react';

type Outline = {
  title: string;
  tone: string;
  sections: { id: string; heading: string; points: string[] }[];
};

type OutlineEditorProps = {
  initialOutline: Outline;
  onFinalize: (outline: Outline) => Promise<void>;
};

export function OutlineEditor({ initialOutline, onFinalize }: OutlineEditorProps) {
  const [outline, setOutline] = useState(initialOutline);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleFinalize = async () => {
    setIsGenerating(true);
    await onFinalize(outline);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline">Your AI-Generated Outline</h2>
        <p className="text-muted-foreground md:text-xl mt-2">Review and edit the proposed structure for your content.</p>
      </div>

      <Card>
        <CardHeader>
          <Label htmlFor="title" className="text-sm font-medium text-muted-foreground">Title</Label>
          <Input id="title" value={outline.title} onChange={(e) => setOutline({ ...outline, title: e.target.value })} className="text-2xl font-bold h-auto p-2 border-0 shadow-none focus-visible:ring-0" />
        </CardHeader>
        <CardContent className="space-y-6">
          {outline.sections.map((section, sectionIndex) => (
            <div key={section.id} className="space-y-3">
              <Label htmlFor={`section-heading-${sectionIndex}`} className="text-sm font-medium text-muted-foreground">Section Heading</Label>
              <Input
                id={`section-heading-${sectionIndex}`}
                value={section.heading}
                onChange={(e) => {
                  const newSections = [...outline.sections];
                  newSections[sectionIndex].heading = e.target.value;
                  setOutline({ ...outline, sections: newSections });
                }}
                className="text-lg font-semibold h-auto p-2 border-0 shadow-none focus-visible:ring-0"
              />
              <ul className="space-y-2 pl-6">
                {section.points.map((point, pointIndex) => (
                  <li key={pointIndex} className="flex items-start">
                    <Check className="h-4 w-4 text-primary mr-3 mt-1 flex-shrink-0" />
                    <Textarea
                      value={point}
                      onChange={(e) => {
                        const newSections = [...outline.sections];
                        newSections[sectionIndex].points[pointIndex] = e.target.value;
                        setOutline({ ...outline, sections: newSections });
                      }}
                      className="text-muted-foreground p-1 border-0 shadow-none focus-visible:ring-0 resize-none"
                      rows={1}
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleFinalize} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Bring it to Life
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

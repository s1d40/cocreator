'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Loader2, FileText, Video, BrainCircuit, Search, MicVocal } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const generationSteps = [
  { name: 'Analyzing content', icon: BrainCircuit },
  { name: 'Writing video script', icon: FileText },
  { name: 'Searching for stock footage', icon: Search },
  { name: 'Generating voiceover', icon: MicVocal },
  { name: 'Rendering final video', icon: Video },
];

const tips = [
  "A strong opening hook is key to grabbing your audience's attention.",
  "Keep your videos concise and to the point for maximum impact.",
  "Use high-quality visuals and audio to create a professional look and feel.",
  "A clear call-to-action can significantly boost engagement.",
  "Consistency in your content style helps in building a loyal audience.",
];

type GenerationProgressProps = {
  currentStep: number; // 0-indexed
  totalSteps: number;
};

export function GenerationProgress({ currentStep, totalSteps }: GenerationProgressProps) {
  const [currentTip, setCurrentTip] = useState(tips[0]);
  const isComplete = currentStep >= totalSteps;

  useEffect(() => {
    if (isComplete) return;
    const interval = setInterval(() => {
      setCurrentTip(tips[Math.floor(Math.random() * tips.length)]);
    }, 5000);
    return () => clearInterval(interval);
  }, [isComplete]);

  const progressPercentage = isComplete ? 100 : (currentStep / totalSteps) * 100;
  const currentStepName = isComplete 
    ? 'All steps completed!' 
    : generationSteps[currentStep]?.name || 'Processing...';

  return (
    <div className="max-w-3xl mx-auto w-full">
      <Card className="bg-card/50 backdrop-blur-sm">
        <CardHeader className="text-center">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            {isComplete ? (
              <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
            ) : (
              <Loader2 className="w-16 h-16 text-primary mx-auto mb-4 animate-spin" />
            )}
          </motion.div>
          <CardTitle className="text-3xl font-bold">
            {isComplete ? 'Generation Complete!' : 'Your Video is Being Created'}
          </CardTitle>
          <p className="text-muted-foreground">
            {isComplete ? 'Your video is now ready for review.' : 'Our AI is working its magic. Please wait a few moments.'}
          </p>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          <div>
            <div className="flex justify-between mb-2 text-sm font-medium text-muted-foreground">
              <span>{currentStepName}</span>
              <span>Step {Math.min(currentStep + 1, totalSteps)} of {totalSteps}</span>
            </div>
            <Progress value={progressPercentage} className="w-full" />
          </div>

          <div className="grid grid-cols-5 gap-4 text-center">
            {generationSteps.map((step, index) => {
              const isActive = index === currentStep && !isComplete;
              const isCompleted = index < currentStep || isComplete;
              const Icon = step.icon;

              return (
                <div key={step.name} className="flex flex-col items-center space-y-2">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-300 ${
                    isCompleted ? 'bg-success' : isActive ? 'bg-primary' : 'bg-muted'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="w-6 h-6 text-success-foreground" />
                    ) : (
                      <Icon className={`w-6 h-6 ${isActive ? 'text-primary-foreground animate-spin' : 'text-muted-foreground'}`} />
                    )}
                  </div>
                  <span className={`text-sm font-medium transition-colors duration-300 ${
                    isCompleted ? 'text-success' : isActive ? 'text-primary-foreground' : 'text-muted-foreground'
                  }`}>
                    {step.name}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      {!isComplete && (
        <div className="mt-6 text-center p-4 bg-muted/50 rounded-lg">
          <p className="font-semibold">💡 Pro Tip</p>
          <p className="text-muted-foreground text-sm">{currentTip}</p>
        </div>
      )}
    </div>
  );
}

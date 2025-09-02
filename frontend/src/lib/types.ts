export type Project = {
  id: string;
  topic: string;
  videoUrl?: string;
  summary?: string;
  status: 'generating' | 'completed' | 'error';
  aspectRatio: '16:9' | '9:16';
  voice: string;
  error?: string;
};

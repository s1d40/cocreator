'use client';

import { useState, useMemo } from 'react';
import { SiteHeader } from '@/components/site-header';
import { IdeationForm } from '@/components/dashboard/ideation-form';
import { GenerationProgress } from '@/components/dashboard/generation-progress';
import { MultimediaDisplay } from '@/components/dashboard/multimedia-display';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  PlusCircle, 
  Video, 
  Search, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Pencil, 
  Copy, 
  Trash2 
} from 'lucide-react';

type Phase = 'dashboard' | 'ideation' | 'generating' | 'multimedia';
type AspectRatio = '16:9' | '9:16' | '1:1';
type SourceType = 'topic' | 'url';
type Voice = 'leo' | 'aurora' | 'onyx';

type IdeationData = {
  sourceText: string;
  sourceType: SourceType;
  aspectRatio: AspectRatio;
  voice: Voice;
};

type ProjectStatus = 'Completed' | 'Failed' | 'Generating';

type Project = {
  id: string;
  title: string;
  status: ProjectStatus;
  thumbnailUrl: string;
};

// MOCK DATA
const MOCK_PROJECTS: Project[] = [
  { id: 'proj1', title: 'The Future of Renewable Energy', status: 'Completed', thumbnailUrl: 'https://picsum.photos/seed/proj1/640/360' },
  { id: 'proj2', title: 'A Journey Through Ancient Rome', status: 'Completed', thumbnailUrl: 'https://picsum.photos/seed/proj2/640/360' },
  { id: 'proj3', title: 'The Science of Black Holes', status: 'Failed', thumbnailUrl: 'https://picsum.photos/seed/proj3/640/360' },
  { id: 'proj4', title: 'The Art of Storytelling', status: 'Generating', thumbnailUrl: 'https://picsum.photos/seed/proj4/640/360' },
];

const MOCK_VIDEO_CONTENT = {
  url: "#",
  title: "The Cinematic Singularity",
  duration: 125,
  aspectRatio: '16:9' as AspectRatio,
  createdAt: new Date().toISOString(),
};

export default function DashboardPage() {
  const [phase, setPhase] = useState<Phase>('dashboard');
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [videoContent, setVideoContent] = useState<any>(null);
  const [lastIdeationData, setLastIdeationData] = useState<IdeationData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'All'>('All');

  const { toast } = useToast();

  const handleStartIdeation = async (data: IdeationData) => {
    setLastIdeationData(data);
    setPhase('generating');
    const totalSteps = 5;
    setCurrentProgress(0);
    for (let i = 0; i < totalSteps; i++) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setCurrentProgress(i + 1);
    }
    await new Promise(resolve => setTimeout(resolve, 1500));
    setVideoContent({ ...MOCK_VIDEO_CONTENT, title: data.sourceText, aspectRatio: data.aspectRatio });
    setPhase('multimedia');
    toast({ title: 'Success!', description: 'Your video is ready.' });
  };

  const handleEdit = () => setPhase('ideation');
  const handleStartNew = () => {
    setLastIdeationData(null);
    setVideoContent(null);
    setPhase('ideation');
  };

  const filteredProjects = useMemo(() => {
    return projects
      .filter(p => statusFilter === 'All' || p.status === statusFilter)
      .filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [projects, statusFilter, searchQuery]);

  const StatusBadge = ({ status }: { status: ProjectStatus }) => {
    const statusMap = {
      Completed: { icon: CheckCircle, color: 'text-success', bgColor: 'bg-success/20' },
      Failed: { icon: XCircle, color: 'text-destructive', bgColor: 'bg-destructive/20' },
      Generating: { icon: Video, color: 'text-warning', bgColor: 'bg-warning/20' },
    };
    const { icon: Icon, color, bgColor } = statusMap[status];
    return (
      <span className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full ${color} ${bgColor}`}>
        <Icon className="w-3 h-3 mr-1.5" />
        {status}
      </span>
    );
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <h1 className="text-3xl font-bold">My Projects</h1>
        <Button size="lg" onClick={handleStartNew}>
          <PlusCircle className="mr-2 h-5 w-5" />
          New Video
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input 
            placeholder="Search projects..." 
            className="pl-10" 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          {(['All', 'Completed', 'Generating', 'Failed'] as const).map(status => (
            <Button 
              key={status} 
              variant={statusFilter === status ? 'default' : 'outline'}
              onClick={() => setStatusFilter(status)}
            >
              {status}
            </Button>
          ))}
        </div>
      </div>

      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map(project => (
            <Card key={project.id} className="overflow-hidden group">
              <CardHeader className="p-0 relative">
                <div className="absolute inset-0 bg-black/50 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button variant="secondary" size="icon"><Eye className="w-5 h-5" /></Button>
                  <Button variant="secondary" size="icon"><Pencil className="w-5 h-5" /></Button>
                  <Button variant="secondary" size="icon"><Copy className="w-5 h-5" /></Button>
                  <Button variant="destructive" size="icon"><Trash2 className="w-5 h-5" /></Button>
                </div>
                <div className="aspect-video bg-muted flex items-center justify-center">
                  <img src={project.thumbnailUrl} alt={project.title} className="w-full h-full object-cover" />
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <CardTitle className="text-lg font-semibold truncate">{project.title}</CardTitle>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <StatusBadge status={project.status} />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <Video className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No Projects Found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {projects.length > 0 ? "Try adjusting your search or filter." : "Get started by creating your first video."}
          </p>
          {projects.length === 0 && (
            <div className="mt-6">
              <Button onClick={handleStartNew}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create New Video
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderPhase = () => {
    switch (phase) {
      case 'dashboard':
        return renderDashboard();
      case 'ideation':
        return <IdeationForm onStartIdeation={handleStartIdeation} initialData={lastIdeationData} />;
      case 'generating':
        return <GenerationProgress currentStep={currentProgress} totalSteps={5} />;
      case 'multimedia':
        return <MultimediaDisplay content={videoContent} onEdit={handleEdit} onStartNew={handleStartNew} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <SiteHeader />
      <main className="flex-1 container py-8 px-4 md:px-6">
        <motion.div
          key={phase}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderPhase()}
        </motion.div>
      </main>
    </div>
  );
}
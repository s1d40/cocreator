import { SiteHeader } from '@/components/site-header';
import { Cocreator } from '@/components/Cocreator';

export default function CocreatorStudioPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <SiteHeader />
      <main className="flex-1">
        <Cocreator />
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; 2024 SFAI Solutions. All rights reserved.</p>
      </footer>
    </div>
  );
}

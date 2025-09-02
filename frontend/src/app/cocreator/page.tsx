import { SiteHeader } from '@/components/site-header';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function CocreatorComingSoonPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center text-center px-4 md:px-6">
        <div className="space-y-4 max-w-md">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            Coming Soon
          </h1>
          <p className="text-muted-foreground md:text-xl">
            We're putting the finishing touches on Cocreator. Get ready to revolutionize your social media content creation.
          </p>
          <div>
            <Button asChild>
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; 2024 SFAI Solutions. All rights reserved.</p>
      </footer>
    </div>
  );
}
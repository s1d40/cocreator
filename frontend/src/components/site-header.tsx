'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Gem } from 'lucide-react';

export function SiteHeader() {
  const pathname = usePathname();
  const isDashboard = pathname === '/dashboard';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/10 bg-background/10 backdrop-blur-lg">
      <div className="container flex h-20 items-center justify-center gap-x-16">
        <Link href="/" className="flex flex-row items-center space-x-4 group">
          <Logo className="h-12 w-12 text-muted-foreground logo-glow group-hover:text-white" />
          <span className="font-bold text-2xl nav-button-glow text-muted-foreground">SFAI Solutions</span>
        </Link>
        <nav className="hidden md:flex items-center space-x-4">
          <Link href="/cocreator" className="nav-button-glow">
            <Button variant="link" className="text-xl px-5 py-3 text-muted-foreground hover:text-white">Cocreator</Button>
          </Link>
          <Link href="/pricing" className="nav-button-glow">
            <Button variant="link" className="text-xl px-5 py-3 text-muted-foreground hover:text-white">Pricing</Button>
          </Link>
          <Link href="/contact" className="nav-button-glow">
            <Button variant="link" className="text-xl px-5 py-3 text-muted-foreground hover:text-white">Contact</Button>
          </Link>
          <Link href="/credit-request" className="nav-button-glow">
            <Button variant="link" className="text-xl px-5 py-3 text-muted-foreground hover:text-white">Credit Request</Button>
          </Link>
        </nav>
        <div className="flex items-center space-x-2">
          {isDashboard ? (
            <Button variant="default" size="lg" className="nav-button-glow text-lg px-8">
              <Gem className="mr-2 h-5 w-5" />
              Upgrade
            </Button>
          ) : (
            <Link href="/login">
              <Button size="lg" className="nav-button-glow text-lg px-8">Dashboard</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

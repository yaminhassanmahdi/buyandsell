
import { Logo } from '@/components/logo';
import { MainNav } from '@/components/main-nav';
import { UserNav } from '@/components/user-nav';
import { Button } from './ui/button';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        <Logo />
        <MainNav className="mx-6" />
        <div className="ml-auto flex items-center space-x-4">
          <Link href="/sell" passHref>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Sell Your Item
            </Button>
          </Link>
          <UserNav />
        </div>
      </div>
    </header>
  );
}

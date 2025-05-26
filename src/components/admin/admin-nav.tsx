
"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ADMIN_NAVIGATION } from '@/lib/constants';
import { Button } from '@/components/ui/button';

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="grid items-start gap-2">
      {ADMIN_NAVIGATION.map((item) => (
        <Link key={item.name} href={item.href} passHref>
          <Button
            variant={pathname === item.href ? "default" : "ghost"}
            className={cn(
              "w-full justify-start text-left",
              pathname === item.href && "bg-primary text-primary-foreground hover:bg-primary/90"
            )}
          >
            {item.icon && <item.icon className="mr-2 h-4 w-4" />}
            {item.name}
          </Button>
        </Link>
      ))}
    </nav>
  );
}

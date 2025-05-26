
"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { SITE_NAVIGATION } from '@/lib/constants';
import { useAuth } from '@/contexts/auth-context';

export function MainNav({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      {SITE_NAVIGATION.map((item) => {
        if (item.authRequired && !isAuthenticated) {
          return null;
        }
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              pathname === item.href ? "text-primary" : "text-foreground/80"
            )}
          >
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}

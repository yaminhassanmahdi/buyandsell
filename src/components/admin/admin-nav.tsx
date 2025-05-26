
"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ADMIN_NAVIGATION, type AdminNavItem } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import React from 'react'; // Import React for Fragment

export function AdminNav() {
  const pathname = usePathname();

  const renderNavItem = (item: AdminNavItem, isSubItem: boolean = false) => {
    const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/admin/dashboard' && item.subItems && item.subItems.some(sub => pathname.startsWith(sub.href)));
    
    // For parent items that just act as headers and link to their first sub-item
    const effectiveHref = item.href;

    return (
      <Link key={item.name} href={effectiveHref} passHref>
        <Button
          variant={isActive ? "default" : "ghost"}
          className={cn(
            "w-full justify-start text-left mb-1",
            isActive && "bg-primary text-primary-foreground hover:bg-primary/90",
            isSubItem && "pl-8" // Indent sub-items
          )}
        >
          {item.icon && <item.icon className="mr-2 h-4 w-4" />}
          {item.name}
        </Button>
      </Link>
    );
  };

  return (
    <nav className="grid items-start gap-1"> {/* Reduced gap for tighter packing */}
      {ADMIN_NAVIGATION.map((item) => (
        <React.Fragment key={item.name}>
          {renderNavItem(item)}
          {item.subItems && (
            <div className="pl-4 border-l border-muted ml-2"> {/* Visual grouping for sub-items */}
              {item.subItems.map((subItem) => renderNavItem(subItem, true))}
            </div>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

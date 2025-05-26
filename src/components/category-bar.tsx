
"use client";
import Link from 'next/link';
import { MOCK_CATEGORIES } from '@/lib/mock-data'; // Updated import
import Image from 'next/image'; // For potential future image use
import { Tag } from 'lucide-react'; // Default icon if needed

export function CategoryBar() {
  return (
    <div className="bg-background shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center md:justify-start overflow-x-auto scrollbar-hide py-3 md:py-0">
          {MOCK_CATEGORIES.map((category) => ( // Use MOCK_CATEGORIES
            <Link
              key={category.id}
              href={`/?category=${category.id}`} // Simple filtering for now
              className="flex flex-col items-center justify-center p-2 md:p-3 text-center group min-w-[80px] md:min-w-[100px]"
            >
              {/* Icon rendering removed as Category type no longer has icon property */}
              {/* You can add a default icon or specific logic here if needed */}
              <Tag className="h-6 w-6 md:h-7 md:w-7 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="mt-1.5 text-xs md:text-sm font-medium text-foreground group-hover:text-primary transition-colors whitespace-nowrap">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// Helper for hiding scrollbar (optional, can be in globals.css too)
// Add to your globals.css or keep in a style tag if preferred locally.
// .scrollbar-hide::-webkit-scrollbar {
//   display: none;
// }
// .scrollbar-hide {
//   -ms-overflow-style: none;  /* IE and Edge */
//   scrollbar-width: none;  /* Firefox */
// }

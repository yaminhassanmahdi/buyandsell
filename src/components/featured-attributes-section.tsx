"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tag, User, Palette, Grid } from 'lucide-react';
import type { CategoryAttributeType, CategoryAttributeValue } from '@/lib/types';

interface FeaturedAttributesSectionProps {
  categoryId: string;
  featuredAttributes: CategoryAttributeType[];
}

// Icon mapping for different attribute types
const getAttributeIcon = (attributeName: string) => {
  const name = attributeName.toLowerCase();
  if (name.includes('author') || name.includes('writer')) return User;
  if (name.includes('color') || name.includes('colour')) return Palette;
  return Tag;
};

const INITIAL_VISIBLE_COUNT = 8; // Show 8 items initially

export function FeaturedAttributesSection({ categoryId, featuredAttributes }: FeaturedAttributesSectionProps) {
  if (!featuredAttributes.length) {
    return null;
  }

  return (
    <div className="space-y-8">
      {featuredAttributes.map((attribute) => {
        const IconComponent = getAttributeIcon(attribute.name);
        const valuesWithImages = attribute.values?.filter(val => val.imageUrl) || [];
        
        if (valuesWithImages.length === 0) {
          return null;
        }

        const visibleValues = valuesWithImages.slice(0, INITIAL_VISIBLE_COUNT);
        const hasMoreValues = valuesWithImages.length > INITIAL_VISIBLE_COUNT;

        return (
          <section key={attribute.id} className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-2 flex items-center justify-center gap-2">
                <IconComponent className="h-6 w-6 text-primary" />
                Featured {attribute.name}s
              </h2>
              <p className="text-muted-foreground">
                Discover products by {attribute.name.toLowerCase()}
              {valuesWithImages.length > 8 && (
                <div className="text-center mt-2">
                  <Link
                    href={`/attribute-values/${attribute.id}`}
                    className="text-sm text-primary hover:underline"
                  >
                    See All ({valuesWithImages.length}) →
                  </Link>
                </div>
              )}              </p>
            </div>

            <ScrollArea className="w-full">
              <div className="flex gap-4 pb-4">
                {visibleValues.map((value, index) => (
                  <AttributeValueCard
                    key={value.id}
                    value={value}
                    attribute={attribute}
                    categoryId={categoryId}
                  />
                ))}
                
                {hasMoreValues && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Card className="flex-shrink-0 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer">
                        <div className="w-20 h-20 md:w-24 md:h-24 relative rounded-full overflow-hidden border-3 border-dashed border-primary/40 hover:border-primary/80 transition-colors duration-300 m-4 flex items-center justify-center bg-primary/5">
                          <Grid className="h-8 w-8 text-primary" />
                        </div>
                        <div className="text-center pb-4 px-2">
                          <p className="font-medium text-sm text-primary">
                            See All ({valuesWithImages.length})
                          </p>
                        </div>
                      </Card>
                    </DialogTrigger>
                    
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <IconComponent className="h-5 w-5" />
                          All {attribute.name} Options
                        </DialogTitle>
                        <DialogDescription>
                          Browse all {attribute.name.toLowerCase()} options in this category
                        </DialogDescription>
                      </DialogHeader>
                      
                      <ScrollArea className="h-96">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4">
                          {valuesWithImages.map((value) => (
                            <AttributeValueCard
                              key={value.id}
                              value={value}
                              attribute={attribute}
                              categoryId={categoryId}
                              compact
                            />
                          ))}
                        </div>
                      </ScrollArea>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </section>
        );
      })}
    </div>
  );
}

interface AttributeValueCardProps {
  value: CategoryAttributeValue;
  attribute: CategoryAttributeType;
  categoryId: string;
  compact?: boolean;
}

function AttributeValueCard({ value, attribute, categoryId, compact = false }: AttributeValueCardProps) {
  const size = compact ? "w-16 h-16" : "w-20 h-20 md:w-24 md:h-24";
  
  return (
    <Link
      href={`/browse?categoryId=${categoryId}&${attribute.id}=${value.id}`}
      className="group flex-shrink-0"
    >
      <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        {/* Story-style circular image */}
        <div className={`${size} relative rounded-full overflow-hidden border-3 border-primary/20 group-hover:border-primary/60 transition-colors duration-300 m-4`}>
          <Image
            src={value.imageUrl!}
            alt={value.value}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            data-ai-hint={value.imageHint || `${attribute.name.toLowerCase()} ${value.value.toLowerCase()}`}
          />
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Shine effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </div>
        </div>
        
        {/* Name below image */}
        <div className="text-center pb-4 px-2">
          <p className={`font-medium group-hover:text-primary transition-colors duration-300 line-clamp-2 ${compact ? 'text-xs' : 'text-sm'}`}>
            {value.value}
          </p>
        </div>
      </Card>
    </Link>
  );
} 
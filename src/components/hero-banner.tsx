"use client";
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import React, { useState, useEffect, useMemo } from 'react';
import type { HeroBannerSlide } from '@/lib/types';

interface HeroBannerProps {
  slides?: HeroBannerSlide[]; // Optional prop for category-specific slides
}

interface DatabaseBanner {
  id: number;
  imageUrl: string;
  imageHint: string;
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  bgColor: string;
  textColor: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

const convertDbBannerToSlide = (dbBanner: DatabaseBanner): HeroBannerSlide => ({
  id: dbBanner.id.toString(),
  imageUrl: dbBanner.imageUrl,
  imageHint: dbBanner.imageHint,
  title: dbBanner.title,
  description: dbBanner.description,
  buttonText: dbBanner.buttonText,
  buttonLink: dbBanner.buttonLink,
  bgColor: dbBanner.bgColor,
  textColor: dbBanner.textColor,
  isActive: dbBanner.isActive,
});

export function HeroBanner({ slides: categorySpecificSlides }: HeroBannerProps) {
  const [globalBanners, setGlobalBanners] = useState<HeroBannerSlide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Fetch global banners from API
  useEffect(() => {
    const fetchGlobalBanners = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/banners');
        if (response.ok) {
          const data = await response.json();
          const bannerSlides = data.banners.map(convertDbBannerToSlide);
          setGlobalBanners(bannerSlides);
        } else {
          console.error('Failed to fetch banners');
          setGlobalBanners([]);
        }
      } catch (error) {
        console.error('Error fetching banners:', error);
        setGlobalBanners([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGlobalBanners();
  }, []);

  const slidesToUse = useMemo(() => {
    // If category-specific slides are provided and active, use them
    const activeCategorySlides = categorySpecificSlides?.filter(slide => slide.isActive);
    if (activeCategorySlides && activeCategorySlides.length > 0) {
      return activeCategorySlides;
    }
    // Otherwise, use global banners from API
    return globalBanners.filter(slide => slide.isActive);
  }, [categorySpecificSlides, globalBanners]);

  useEffect(() => {
    if (slidesToUse.length === 0) return;
    const timer = setTimeout(() => {
      setCurrentSlideIndex((prevSlide) => (prevSlide + 1) % slidesToUse.length);
    }, 5000); // Change slide every 5 seconds
    return () => clearTimeout(timer);
  }, [currentSlideIndex, slidesToUse.length]);

  // Reset index if slidesToUse changes and current index is out of bounds
  useEffect(() => {
    if (currentSlideIndex >= slidesToUse.length) {
      setCurrentSlideIndex(0);
    }
  }, [slidesToUse, currentSlideIndex]);

  // Show loading state only for global banners (not category-specific)
  if (isLoading && !categorySpecificSlides) {
    return (
      <div className="w-full my-4 md:my-6">
        <div className="container mx-auto px-0 md:px-4">
          <Card className="overflow-hidden shadow-lg relative bg-muted text-muted-foreground aspect-[16/6] md:aspect-[16/5]">
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 md:p-8">
              <div className="animate-pulse">
                <div className="h-8 w-48 bg-muted-foreground/20 rounded mb-4"></div>
                <div className="h-4 w-64 bg-muted-foreground/20 rounded"></div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (slidesToUse.length === 0) {
    return (
      <div className="w-full my-4 md:my-6">
        <div className="container mx-auto px-0 md:px-4">
          <Card className="overflow-hidden shadow-lg relative bg-muted text-muted-foreground aspect-[16/6] md:aspect-[16/5]">
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 md:p-8">
              <h2 className="text-xl md:text-2xl font-semibold">No active banners</h2>
              <p className="text-sm md:text-base">Configure banners in admin settings or for this category.</p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const slide = slidesToUse[currentSlideIndex];
  const prevSlide = () => setCurrentSlideIndex((currentSlideIndex - 1 + slidesToUse.length) % slidesToUse.length);
  const nextSlide = () => setCurrentSlideIndex((currentSlideIndex + 1) % slidesToUse.length);

  return (
    <div className="w-full my-4 md:my-6">
      <div className="container mx-auto px-0 md:px-4">
        <Card className={`overflow-hidden shadow-lg relative ${slide.bgColor || 'bg-primary'} ${slide.textColor || 'text-primary-foreground'}`}>
          <div className="aspect-[16/6] md:aspect-[16/5] w-full relative">
            <Image
              src={slide.imageUrl}
              alt={slide.title}
              fill
              priority={currentSlideIndex === 0} // Prioritize first image
              className="object-cover"
              data-ai-hint={slide.imageHint}
            />
            <div className="absolute inset-0 bg-black/30"></div> {/* Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 md:p-8">
              <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold drop-shadow-md mb-2 md:mb-4">{slide.title}</h2>
              <p className="text-sm md:text-lg lg:text-xl mb-4 md:mb-6 max-w-xl drop-shadow-sm">{slide.description}</p>
              <Button asChild size="lg" variant="secondary" className="bg-opacity-90 hover:bg-opacity-100">
                <Link href={slide.buttonLink || '#'}>
                  {slide.buttonText} <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
          {/* Manual Dots for navigation */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
            {slidesToUse.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlideIndex(index)}
                className={`h-2 w-2 rounded-full ${currentSlideIndex === index ? (slide.textColor === 'text-white' ? 'bg-white' : 'bg-primary') : (slide.textColor === 'text-white' ? 'bg-white/50' : 'bg-primary/50')} transition-all`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
          {/* Prev/Next Buttons */}
          {slidesToUse.length > 1 && (
            <>
              <Button variant="ghost" size="icon" onClick={prevSlide} className={`absolute left-2 top-1/2 -translate-y-1/2 ${slide.textColor || 'text-primary-foreground'} hover:bg-black/20`}>
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button variant="ghost" size="icon" onClick={nextSlide} className={`absolute right-2 top-1/2 -translate-y-1/2 ${slide.textColor || 'text-primary-foreground'} hover:bg-black/20`}>
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

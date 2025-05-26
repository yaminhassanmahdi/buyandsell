
"use client";
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight } from 'lucide-react';

// Basic Carousel (manual for now, can be upgraded with ShadCN Carousel later)
import React, { useState, useEffect } from 'react';

const slides = [
  {
    id: 1,
    imageUrl: 'https://placehold.co/1200x400.png',
    imageHint: 'promotional banner electronics',
    title: 'Latest Gadgets on Sale!',
    description: 'Discover amazing deals on smartphones, laptops, and more.',
    buttonText: 'Shop Electronics',
    buttonLink: '/?category=electronics',
    bgColor: 'bg-blue-600',
    textColor: 'text-white'
  },
  {
    id: 2,
    imageUrl: 'https://placehold.co/1200x400.png',
    imageHint: 'fashion sale banner',
    title: 'Trendy Fashion Finds',
    description: 'Upgrade your wardrobe with the latest styles.',
    buttonText: 'Explore Fashion',
    buttonLink: '/?category=fashion',
    bgColor: 'bg-pink-500',
    textColor: 'text-white'
  },
  {
    id: 3,
    imageUrl: 'https://placehold.co/1200x400.png',
    imageHint: 'home decor banner',
    title: 'Home Decor Specials',
    description: 'Beautify your space with unique second-hand treasures.',
    buttonText: 'View Home Goods',
    buttonLink: '/?category=home-garden',
    bgColor: 'bg-green-500',
    textColor: 'text-white'
  },
];

export function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
    }, 5000); // Change slide every 5 seconds
    return () => clearTimeout(timer);
  }, [currentSlide]);

  const slide = slides[currentSlide];

  return (
    <div className="w-full my-4 md:my-6">
      <div className="container mx-auto px-0 md:px-4">
        <Card className={`overflow-hidden shadow-lg relative ${slide.bgColor} ${slide.textColor}`}>
          <div className="aspect-[16/6] md:aspect-[16/5] w-full relative">
            <Image
              src={slide.imageUrl}
              alt={slide.title}
              fill
              priority
              className="object-cover"
              data-ai-hint={slide.imageHint}
            />
            <div className="absolute inset-0 bg-black/30"></div> {/* Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 md:p-8">
              <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold drop-shadow-md mb-2 md:mb-4">{slide.title}</h2>
              <p className="text-sm md:text-lg lg:text-xl mb-4 md:mb-6 max-w-xl drop-shadow-sm">{slide.description}</p>
              <Button asChild size="lg" variant="secondary" className="bg-opacity-90 hover:bg-opacity-100">
                <Link href={slide.buttonLink}>
                  {slide.buttonText} <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
          {/* Manual Dots for navigation */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 w-2 rounded-full ${currentSlide === index ? 'bg-white' : 'bg-white/50'} transition-all`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

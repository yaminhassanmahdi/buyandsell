import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { ClientLayout } from '@/components/client-layout';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'Buy and Sell - Online Marketplace',
    template: '%s | Buy and Sell'
  },
  description: 'Buy and sell second-hand goods with ease. A modern online marketplace for all your needs.',
  keywords: ['marketplace', 'second hand', 'buy', 'sell', 'online shopping', 'used items'],
  authors: [{ name: 'Buy and Sell Team' }],
  creator: 'Buy and Sell',
  publisher: 'Buy and Sell',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'Buy and Sell - Online Marketplace',
    description: 'Buy and sell second-hand goods with ease. A modern online marketplace for all your needs.',
    siteName: 'Buy and Sell',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Buy and Sell - Online Marketplace',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Buy and Sell - Online Marketplace',
    description: 'Buy and sell second-hand goods with ease. A modern online marketplace for all your needs.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <ClientLayout>{children}</ClientLayout>
        <Toaster />
      </body>
    </html>
  );
}

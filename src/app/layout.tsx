import type { Metadata, Viewport } from 'next';
import { Outfit, Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/core/hooks/useAuth';
import { EcoDataProvider } from '@/core/eco-data-provider'; // Import wrapper to keep it clean
import PageShell from '@/core/components/PageShell';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'EcoTwin AI | Predict, Track & Reduce Your Carbon Footprint',
  description: 'A revolutionary Google Vertex AI & Gemini powered Sustainability Digital Twin that helps you simulate, track, and optimize your carbon savings.',
  keywords: ['carbon footprint tracker', 'sustainability artificial intelligence', 'carbon twin', 'climate change awareness', 'eco missions'],
  authors: [{ name: 'EcoTwin AI Team' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable} dark scroll-smooth`}>
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🌱</text></svg>" />
      </head>
      <body className="antialiased min-h-screen bg-background text-foreground flex flex-col">
        <AuthProvider>
          <EcoDataProvider>
            <PageShell>
              {children}
            </PageShell>
          </EcoDataProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

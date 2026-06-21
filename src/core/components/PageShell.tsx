'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

export default function PageShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const isLandingPage = pathname === '/';
  const isOnboardingPage = pathname === '/onboarding';

  if (isLandingPage) {
    return <>{children}</>;
  }

  if (isOnboardingPage) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <main className="flex-1 flex flex-col items-center justify-center p-4">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 flex flex-col w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

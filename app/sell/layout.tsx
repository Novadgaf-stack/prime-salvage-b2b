'use client';

import React from 'react';
import { Navbar } from '@/components/Navbar';

export default function SellLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col">
      <Navbar />
      <main className="flex-1 w-full max-w-3xl mx-auto p-6 md:p-12">
        {children}
      </main>
    </div>
  );
}

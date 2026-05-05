'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from './auth-provider';
import { Hammer } from 'lucide-react';
import { LogOut } from 'lucide-react';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/firebase';

export function Navbar() {
  const { user, loading } = useAuth();

  const handleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Sign in error', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign out error', error);
    }
  };

  return (
    <header className="border-b border-[#222222] bg-[#111111] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/inventory" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#EAF205] rounded-sm flex items-center justify-center shrink-0">
            <Hammer className="w-4 h-4 text-black" />
          </div>
          <span className="font-bold text-sm tracking-[0.2em] text-[#F0F0F0] uppercase">
            Prime Salvage
          </span>
        </Link>
        
        <nav className="flex items-center gap-6">
          <Link href="/inventory" className="text-xs uppercase font-mono tracking-widest text-[#888] hover:text-[#EAF205] transition-colors">
            Inventory
          </Link>
          
          <Link href="/sell" className="text-xs uppercase font-mono tracking-widest text-[#888] hover:text-[#EAF205] transition-colors">
            Sell Parts
          </Link>

          {!loading && user && (
            <>
              <Link href="/dashboard" className="text-xs uppercase font-mono tracking-widest text-[#888] hover:text-[#EAF205] transition-colors">
                Dashboard
              </Link>
              <div className="w-px h-4 bg-[#333]"></div>
              <div className="flex items-center gap-4">
                <span className="text-[10px] text-[#888] font-mono tracking-widest uppercase hidden md:inline-block">
                  {user.shopName}
                </span>
                <button onClick={handleSignOut} className="text-[#888] hover:text-[#FF4400] transition-colors">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          )}

          {!loading && !user && (
             <button onClick={handleSignIn} className="text-[10px] bg-[#222] px-3 py-2 hover:bg-[#333] hover:text-[#EAF205] transition-colors rounded-sm border border-[#444] font-mono text-[#F0F0F0] uppercase tracking-widest">
               Tech Login
             </button>
          )}
        </nav>
      </div>
    </header>
  );
}

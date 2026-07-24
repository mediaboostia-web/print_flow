'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import { useAppStore } from '@/lib/state/store';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const theme = useAppStore((state) => state.theme);
  const hasHydrated = useAppStore((state) => state.hasHydrated);
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const checkSession = useAppStore((state) => state.checkSession);
  const [sessionChecked, setSessionChecked] = useState(false);

  // Sync theme to document element on mount/change
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const loadSupabaseData = useAppStore((state) => state.loadSupabaseData);

  // Verify the real Supabase Auth session (cookie-backed) once localStorage has
  // rehydrated. proxy.ts already blocks unauthenticated requests server-side —
  // this is the client-side follow-up so isAuthenticated reflects reality even
  // when it's stale (e.g. the session expired since the last visit).
  useEffect(() => {
    if (!hasHydrated) return;
    checkSession().finally(() => setSessionChecked(true));
  }, [hasHydrated, checkSession]);

  useEffect(() => {
    if (!hasHydrated || !sessionChecked) return;
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [hasHydrated, sessionChecked, isAuthenticated, router]);

  // Load database tables from Supabase upon authentication
  useEffect(() => {
    if (isAuthenticated) {
      loadSupabaseData();
    }
  }, [isAuthenticated, loadSupabaseData]);

  if (!hasHydrated || !sessionChecked || !isAuthenticated) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-bg-base dark:bg-[#0B0F19]">
        <div className="w-8 h-8 rounded-full border-2 border-brand-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="app-shell flex h-screen w-screen overflow-hidden bg-bg-base dark:bg-[#0B0F19] text-text-main dark:text-slate-100 transition-colors duration-300">
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main content pane */}
      <div className="app-shell-col flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar header */}
        <Header />

        {/* Scrollable page content */}
        <main className="app-shell-main flex-1 overflow-y-auto px-4 sm:px-6 py-6 pb-24 md:pb-6 scroll-smooth bg-bg-base dark:bg-[#0B0F19] transition-colors duration-300">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar & Bottom Sheet Drawer */}
      <BottomNav />
    </div>
  );
}

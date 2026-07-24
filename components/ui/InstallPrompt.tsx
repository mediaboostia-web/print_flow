'use client';

import React, { useEffect, useState } from 'react';
import { Download, X, Monitor } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'printflow_install_prompt_dismissed_at';
const DISMISS_DAYS = 7;

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }

    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    const recentlyDismissed = dismissedAt && Date.now() - Number(dismissedAt) < DISMISS_DAYS * 24 * 60 * 60 * 1000;

    const handler = (e: Event) => {
      e.preventDefault();
      if (recentlyDismissed) return;
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setVisible(false);
  };

  const install = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-2rem)] max-w-sm animate-fade-in">
      <div className="bg-bg-card border border-border-subtle rounded-2xl shadow-xl p-4 flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0">
          <Monitor className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0 space-y-2">
          <div>
            <p className="text-sm font-bold text-text-main">Installer Print_Flow</p>
            <p className="text-xs text-text-secondary leading-relaxed">
              Ajoutez l'application à votre écran d'accueil ou votre bureau pour un accès rapide, en plein écran.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={install}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Installer</span>
            </button>
            <button
              onClick={dismiss}
              className="px-3 py-1.5 rounded-full text-xs font-bold text-text-secondary hover:text-text-main transition"
            >
              Plus tard
            </button>
          </div>
        </div>
        <button onClick={dismiss} className="text-text-secondary hover:text-text-main shrink-0" aria-label="Fermer">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

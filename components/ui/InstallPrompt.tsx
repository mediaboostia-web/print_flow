'use client';

import React, { useEffect, useState } from 'react';
import { Download, X, Smartphone, Monitor, CheckCircle2, Share, PlusSquare } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'printflow_install_prompt_dismissed_at';
const DISMISS_DAYS = 3;

export function triggerInstallModal() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('open-install-modal'));
  }
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check standalone mode
    if (typeof window !== 'undefined') {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true;
      setIsStandalone(isStandaloneMode);

      // Detect iOS
      const ua = window.navigator.userAgent;
      const isApple = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
      setIsIOS(isApple);
    }

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }

    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    const recentlyDismissed = dismissedAt && Date.now() - Number(dismissedAt) < DISMISS_DAYS * 24 * 60 * 60 * 1000;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (!recentlyDismissed) {
        // Auto-show modal after short delay for seamless onboarding
        const timer = setTimeout(() => setVisible(true), 2500);
        return () => clearTimeout(timer);
      }
    };

    const openHandler = () => {
      setVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('open-install-modal', openHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('open-install-modal', openHandler);
    };
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setVisible(false);
  };

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setDeferredPrompt(null);
        setVisible(false);
      }
    }
  };

  if (!visible || isStandalone) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 dark:bg-black/80 backdrop-blur-xs animate-fade-in">
      <div className="bg-bg-card border border-border-subtle rounded-3xl w-full max-w-md shadow-premium overflow-hidden transform scale-100 transition duration-300">
        
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-border-subtle flex items-center justify-between bg-slate-50 dark:bg-slate-800/30">
          <div className="flex items-center gap-3">
            <img src="/Favicon_PrintFlow.png" alt="Print_Flow" className="w-9 h-9 object-contain rounded-xl shadow-sm shrink-0" />
            <div>
              <h3 className="text-base font-bold text-text-main leading-tight">Installer Print_Flow</h3>
              <p className="text-[11px] text-text-secondary">Application Mobile & Desktop (PWA / Web APK)</p>
            </div>
          </div>
          <button
            onClick={dismiss}
            className="p-1.5 rounded-xl text-text-secondary hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Key Advantages */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0 mt-0.5">
                <Smartphone className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-text-main">Accès rapide sur Smartphone & Tablette</p>
                <p className="text-text-secondary">Ajoutez l'icône sur votre écran d'accueil comme une application mobile native (APK).</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0 mt-0.5">
                <Monitor className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-text-main">Application de Bureau (PC / Mac)</p>
                <p className="text-text-secondary">Lancez l'imprimerie en mode plein écran sans barre d'adresse parasite.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-text-main">Performances & Sécurité</p>
                <p className="text-text-secondary">Temps de réponse instantané et synchronisation sécurisée de vos devis.</p>
              </div>
            </div>
          </div>

          {/* iOS Safari Instructions when native prompt is unavailable */}
          {isIOS && !deferredPrompt && (
            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/50 border border-border-subtle text-xs space-y-2">
              <p className="font-bold text-text-main flex items-center gap-1.5">
                <span>Procédure pour iPhone / iPad (Safari) :</span>
              </p>
              <ol className="list-decimal list-inside space-y-1 text-text-secondary leading-relaxed">
                <li>Appuyez sur le bouton <span className="font-bold text-text-main">Partager <Share className="w-3.5 h-3.5 inline text-brand-primary" /></span> dans Safari.</li>
                <li>Faites défiler vers le bas et choisissez <span className="font-bold text-text-main">"Sur l'écran d'accueil" <PlusSquare className="w-3.5 h-3.5 inline text-brand-primary" /></span>.</li>
                <li>Appuyez sur <span className="font-bold text-text-main">"Ajouter"</span> en haut à droite.</li>
              </ol>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-2.5">
            <button
              onClick={dismiss}
              className="w-full sm:w-auto px-4 py-2.5 rounded-full border border-border-subtle hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-text-secondary transition text-center"
            >
              Plus tard
            </button>
            {deferredPrompt ? (
              <button
                onClick={handleInstall}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold transition shadow-premium"
              >
                <Download className="w-4 h-4" />
                <span>Installer maintenant (App / APK)</span>
              </button>
            ) : (
              !isIOS && (
                <button
                  onClick={() => alert("Pour installer l'application : Ouvrez le menu de votre navigateur (3 petits points ⋮) puis sélectionnez 'Installer l'application' ou 'Ajouter à l'écran d'accueil'.")}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold transition shadow-premium"
                >
                  <Download className="w-4 h-4" />
                  <span>Installer l'application</span>
                </button>
              )
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

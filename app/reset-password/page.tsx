'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAppStore } from '@/lib/state/store';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

export default function ResetPasswordPage() {
  const router = useRouter();
  const confirmPasswordReset = useAppStore((state) => state.confirmPasswordReset);
  const logout = useAppStore((state) => state.logout);

  const [status, setStatus] = useState<'checking' | 'ready' | 'invalid'>('checking');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  // The Supabase client (createBrowserClient) auto-detects the recovery
  // token/code in the URL on load and establishes a temporary session,
  // firing a PASSWORD_RECOVERY auth event once ready.
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setStatus('invalid');
      return;
    }

    let resolved = false;

    supabase.auth.getSession().then(({ data }: any) => {
      if (!resolved && data.session) {
        resolved = true;
        setStatus('ready');
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event: any) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        resolved = true;
        setStatus('ready');
      }
    });

    const timeout = setTimeout(() => {
      if (!resolved) setStatus('invalid');
    }, 4000);

    return () => {
      listener.subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Les deux mots de passe ne correspondent pas.');
      return;
    }

    setIsSubmitting(true);
    const result = await confirmPasswordReset(password);
    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error || 'Impossible de mettre à jour le mot de passe.');
      return;
    }

    logout();
    setDone(true);
  };

  return (
    <div className="h-screen w-full bg-[#F8F9FA] dark:bg-[#090D16] flex items-center justify-center p-4 font-sans text-text-main">
      <div className="w-full max-w-sm bg-bg-card border border-border-subtle rounded-3xl shadow-xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <img src="/Favicon_PrintFlow.png" alt="Print_Flow" className="w-8 h-8 object-contain rounded-xl shrink-0" />
          <span className="text-lg font-black tracking-tight text-text-main">
            Print<span className="text-brand-primary">_Flow</span>
          </span>
        </div>

        {status === 'checking' && (
          <div className="py-8 flex flex-col items-center gap-3">
            <div className="w-6 h-6 rounded-full border-2 border-brand-primary border-t-transparent animate-spin" />
            <p className="text-xs text-text-secondary">Vérification du lien...</p>
          </div>
        )}

        {status === 'invalid' && (
          <div className="space-y-3">
            <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-xl flex items-center gap-2 text-rose-700 dark:text-rose-400 text-[11px] font-medium">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>Ce lien de réinitialisation est invalide ou a expiré. Redemandez-en un depuis la page de connexion.</span>
            </div>
            <button
              onClick={() => router.push('/login')}
              className="w-full py-2.5 rounded-full bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold transition"
            >
              Retour à la connexion
            </button>
          </div>
        )}

        {status === 'ready' && !done && (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-0.5">
              <h1 className="text-lg font-black text-text-main">Nouveau mot de passe</h1>
              <p className="text-[11px] text-text-secondary">Choisissez un nouveau mot de passe pour votre compte.</p>
            </div>

            {error && (
              <div className="p-2 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-xl flex items-center gap-2 text-rose-700 dark:text-rose-400 text-[11px] font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-0.5">
              <label className="text-[10px] font-bold text-text-secondary uppercase">Nouveau mot de passe *</label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-text-secondary absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="w-full pl-8 pr-8 py-1.5 bg-input-bg border border-border-subtle rounded-xl text-xs focus:outline-none focus:border-brand-primary text-text-main"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-main"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="space-y-0.5">
              <label className="text-[10px] font-bold text-text-secondary uppercase">Confirmer le mot de passe *</label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-text-secondary absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="w-full pl-8 pr-2.5 py-1.5 bg-input-bg border border-border-subtle rounded-xl text-xs focus:outline-none focus:border-brand-primary text-text-main"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 mt-1 rounded-full bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <span>Mettre à jour le mot de passe</span>
              )}
            </button>
          </form>
        )}

        {done && (
          <div className="space-y-3">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 rounded-xl flex items-center gap-2 text-emerald-700 dark:text-emerald-400 text-[11px] font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Mot de passe mis à jour avec succès. Connectez-vous avec votre nouveau mot de passe.</span>
            </div>
            <button
              onClick={() => router.push('/login')}
              className="w-full py-2.5 rounded-full bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold transition"
            >
              Aller à la connexion
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

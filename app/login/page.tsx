'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
} from 'lucide-react';
import { useAppStore } from '@/lib/state/store';
import { isValidEmail } from '@/lib/utils/email';

export default function LoginPage() {
  const router = useRouter();
  const login = useAppStore((state) => state.login);
  const requestPasswordReset = useAppStore((state) => state.requestPasswordReset);
  const hasHydrated = useAppStore((state) => state.hasHydrated);
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);

  // 'login' = normal sign-in form; 'forgot' = request a password reset email
  const [mode, setMode] = useState<'login' | 'forgot'>('login');
  const [resetSent, setResetSent] = useState(false);

  // Form input states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Rate Limiting states (Max 5 failed attempts -> 60s lockout)
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTimer, setLockoutTimer] = useState(0);

  // Countdown timer effect for rate limiting
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (lockoutTimer > 0) {
      interval = setInterval(() => {
        setLockoutTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [lockoutTimer]);

  // Already logged in? Skip straight to the dashboard.
  useEffect(() => {
    if (hasHydrated && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [hasHydrated, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Check rate limiter lock
    if (lockoutTimer > 0) {
      setError(`Accès temporairement verrouillé. Veuillez patienter encore ${lockoutTimer}s.`);
      return;
    }

    if (!isValidEmail(email)) {
      setError('Veuillez saisir une adresse e-mail valide (ex: utilisateur@domaine.com).');
      return;
    }

    if (!email.trim() || !password) {
      setError('Veuillez renseigner votre e-mail et votre mot de passe.');
      return;
    }

    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);

    if (!result.success) {
      const nextAttempts = failedAttempts + 1;
      setFailedAttempts(nextAttempts);

      if (nextAttempts >= 5) {
        setLockoutTimer(60);
        setFailedAttempts(0);
        setError("Nombre maximal de 5 tentatives atteint. Accès suspendu pendant 60 secondes.");
      } else {
        setError(`${result.error || 'Identifiants incorrects.'} (${nextAttempts}/5 tentatives)`);
      }
      return;
    }

    setFailedAttempts(0);
    setLockoutTimer(0);
    router.push('/dashboard');
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isValidEmail(email)) {
      setError('Veuillez saisir une adresse e-mail valide (ex: utilisateur@domaine.com).');
      return;
    }

    setIsSubmitting(true);
    const result = await requestPasswordReset(email);
    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error || "Impossible d'envoyer l'e-mail de réinitialisation.");
      return;
    }

    setResetSent(true);
  };

  return (
    <div className="h-screen w-full bg-[#F8F9FA] dark:bg-[#090D16] flex items-center justify-center p-2 sm:p-4 overflow-hidden font-sans text-text-main">
      {/* 2-Column Main Card Container - Strict Height fit without page scroll */}
      <div className="w-full max-w-4xl h-full max-h-[580px] bg-bg-card border border-border-subtle rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row relative">
        
        {/* Left Column: Compact Form Section */}
        <div className="w-full md:w-1/2 p-5 sm:p-6 flex flex-col justify-between overflow-hidden">
          
          {/* Top Logo */}
          <div className="flex items-center gap-2">
            <img src="/Favicon_PrintFlow.png" alt="Print_Flow" className="w-8 h-8 object-contain rounded-xl shrink-0" />
            <span className="text-lg font-black tracking-tight text-text-main">
              Print<span className="text-brand-primary">_Flow</span>
            </span>
          </div>

          {/* Form Content Block */}
          <div className="my-auto space-y-3 max-w-sm w-full mx-auto">
            <div className="space-y-0.5 text-left">
              <h1 className="text-xl sm:text-2xl font-black text-text-main tracking-tight">
                {mode === 'login' ? 'Bienvenue sur Print_Flow' : 'Mot de passe oublié'}
              </h1>
              <p className="text-[11px] text-text-secondary">
                {mode === 'login'
                  ? "Connectez-vous à votre espace d'impression."
                  : 'Saisissez votre e-mail pour recevoir un lien de réinitialisation.'}
              </p>
            </div>

            {mode === 'login' ? (
              <form onSubmit={handleSubmit} className="space-y-2">
                {/* Error Alert */}
                {error && (
                  <div className="p-2 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-xl flex items-center gap-2 text-rose-700 dark:text-rose-400 text-[11px] font-medium">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Email */}
                <div className="space-y-0.5">
                  <label className="text-[10px] font-bold text-text-secondary uppercase">
                    Adresse email *
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-text-secondary absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="vous@imprimerie.sn"
                      autoComplete="email"
                      className="w-full pl-8 pr-2.5 py-1.5 bg-input-bg border border-border-subtle rounded-xl text-xs focus:outline-none focus:border-brand-primary text-text-main"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-0.5">
                  <label className="text-[10px] font-bold text-text-secondary uppercase">
                    Mot de passe *
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-text-secondary absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="current-password"
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

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || lockoutTimer > 0}
                  className="w-full py-2.5 mt-2 rounded-full bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold transition shadow-sm disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  ) : (
                    <span>Connexion à l'espace</span>
                  )}
                </button>

                {/* Forgot password link */}
                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => { setMode('forgot'); setError(''); setResetSent(false); }}
                    className="text-[11px] font-bold text-text-secondary hover:text-brand-primary transition cursor-pointer"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
              </form>
            ) : resetSent ? (
              <div className="space-y-3">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 rounded-xl text-emerald-700 dark:text-emerald-400 text-[11px] font-medium">
                  E-mail envoyé ! Vérifiez votre boîte de réception ({email}) et cliquez sur le lien pour choisir un nouveau mot de passe.
                </div>
                <button
                  type="button"
                  onClick={() => { setMode('login'); setResetSent(false); setError(''); }}
                  className="w-full py-2.5 rounded-full border border-border-subtle hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-text-main transition cursor-pointer"
                >
                  Retour à la connexion
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-2">
                {error && (
                  <div className="p-2 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-xl flex items-center gap-2 text-rose-700 dark:text-rose-400 text-[11px] font-medium">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-0.5">
                  <label className="text-[10px] font-bold text-text-secondary uppercase">
                    Adresse email *
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-text-secondary absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="vous@imprimerie.sn"
                      autoComplete="email"
                      className="w-full pl-8 pr-2.5 py-1.5 bg-input-bg border border-border-subtle rounded-xl text-xs focus:outline-none focus:border-brand-primary text-text-main"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 mt-2 rounded-full bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold transition shadow-sm disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  ) : (
                    <span>Envoyer le lien de réinitialisation</span>
                  )}
                </button>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setError(''); }}
                    className="text-[11px] font-bold text-text-secondary hover:text-brand-primary transition cursor-pointer"
                  >
                    Retour à la connexion
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Footer Copyright */}
          <div className="flex items-center justify-between text-[10px] text-text-secondary pt-2 border-t border-border-subtle">
            <span>© 2026 Print_Flow.</span>
            <span>Accès sécurisé FCFA/XAF</span>
          </div>

        </div>

        {/* Right Column: Clean Background Image with Title & Description Only */}
        <div className="hidden md:flex md:w-1/2 m-2 rounded-2xl bg-slate-900 text-white p-8 flex-col justify-end relative overflow-hidden shadow-lg border border-slate-800">
          
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-50" 
            style={{ backgroundImage: "url('/Sign in et login .png')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          {/* Title & Description Overlay */}
          <div className="relative z-10 space-y-2 text-left">
            <h2 className="text-2xl font-black leading-tight text-white font-sans">
              Centralisez Devis, BAT & Production.
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed max-w-md font-sans">
              Gérez efficacement votre imprimerie : suivi d'atelier en temps réel, zéro oubli de facturation et encaissement d'acomptes en toute sérénité.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}

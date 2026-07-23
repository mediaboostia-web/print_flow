'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Printer,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  FileText,
  Layers,
  Users,
  Check,
  Building2,
  TrendingUp,
  Clock,
  CreditCard,
  Lock,
  ChevronRight,
  HelpCircle,
  BarChart3,
  Package,
  FileCheck,
  Calculator,
  X,
  AlertTriangle,
  ChevronLeft,
  PhoneCall,
  Plus,
  Minus,
  Workflow,
  Receipt,
  Store,
  Sparkles,
  Zap,
  Activity,
  FileX,
  TrendingDown,
  UserX,
  UserCheck,
  Eye,
  Shield
} from 'lucide-react';
import { useAppStore } from '@/lib/state/store';
import { formatFCFA } from '@/lib/utils/money';

export default function LandingPage() {
  const router = useRouter();
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);

  // Testimonials Carousel state
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Accordion state for FAQ
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Smart Hide/Show Sticky Header State
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < 60) {
        setIsHeaderVisible(true);
      } else if (currentScrollY > lastScrollY) {
        // Scrolling DOWN -> hide header
        setIsHeaderVisible(false);
      } else {
        // Scrolling UP -> show header
        setIsHeaderVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const testimonials = [
    {
      name: "Jeudi ZIZA",
      role: "Directeur de Production",
      company: "Sud Print Imprimerie (Dakar, Sénégal)",
      image: "/Jeudi ZIZA.jpg",
      quote: "Grâce au verrou BAT obligatoire de Print_Flow, nous avons éliminé 100% des réimpressions dues aux erreurs de fichier client. Chaque tirage lancé est validé d'avance."
    },
    {
      name: "Hullys Désiré",
      role: "Fondateur & Lead Designer",
      company: "Imprimerie Moderne (Libreville, Gabon)",
      image: "/Desi.jpg",
      quote: "La gestion simplifiée des acomptes et le calcul de TVA automatique ont transformé notre comptabilité. Les clients payent leur solde avec plaisir lors de la livraison."
    },
    {
      name: "Ruben",
      role: "Chef d'Atelier",
      company: "Repro Express (Abidjan, Côte d'Ivoire)",
      image: "/Ruben.jpg",
      quote: "Les fiches de fabrication d'atelier sont parfaites : les opérateurs ont toutes les consignes exactes sans voir nos marges ni nos prix de revient."
    }
  ];

  const faqs = [
    {
      q: "Comment fonctionne l'essai gratuit de 7 jours ?",
      a: "Vous bénéficiez d'un accès immédiat et complet à toutes les fonctionnalités principales de Print_Flow, sans carte bancaire, sans engagement et avec une prise en main en moins de 3 minutes."
    },
    {
      q: "Est-ce adapté à la monnaie locale (FCFA / XAF) et aux taxes de notre imprimerie ?",
      a: "Oui, parfaitement ! Print_Flow intègre nativement la gestion en FCFA (XAF/XOF) avec calcul automatique de la TVA personnalisable selon les règles fiscales de votre pays."
    },
    {
      q: "Comment l'acompte est-il sécurisé et déduit sur la facture ?",
      a: "Dès que l'acompte est enregistré sur le bon de commande, il est verrouillé et déduit automatiquement du montant Total TTC lors de la génération de la facture finale. Le solde dû s'affiche sans ambiguïté."
    },
    {
      q: "Mes données d'imprimerie et mes tarifs sont-ils en sécurité ?",
      a: "Absolument. Vos données sont hébergées sur une infrastructure Postgres sécurisée par Supabase avec isolation stricte par Row Level Security (RLS) et chiffrement bancaire SSL."
    },
    {
      q: "Puis-je évoluer vers la Formule Pro à tout moment ?",
      a: "Oui ! La Formule Pro débloque le nombre illimité de collaborateurs, la boutique en ligne publique et le journal d'audit complet de votre imprimerie en un clic."
    }
  ];

  // Schema.org JSON-LD for Programmatic SEO
  const jsonLdSoftware = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Print_Flow",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "14900",
      "priceCurrency": "XAF",
      "priceValidUntil": "2027-12-31"
    },
    "description": "Logiciel de gestion et facturation pour imprimeries et ateliers de reprographie en Afrique francophone. Devis, BAT, Bons de Commande, Livraisons et Encaissements."
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#090D16] text-text-main font-sans selection:bg-brand-primary selection:text-white">
      {/* Programmatic SEO JSON-LD Microdata */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSoftware) }}
      />

      {/* SMART STICKY HEADER NAVBAR (DISPARAÎT AU SCROLL BAS / RÉAPPARAÎT AU SCROLL HAUT) */}
      <div className={`sticky top-3 z-50 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-500 transform ${
        isHeaderVisible ? 'translate-y-0 opacity-100' : '-translate-y-24 opacity-0 pointer-events-none'
      }`}>
        <header className="bg-bg-card/90 dark:bg-[#090D16]/90 backdrop-blur-md border border-border-subtle rounded-2xl px-6 py-3.5 flex items-center justify-between shadow-md transition duration-300">
          <a href="#hero" className="flex items-center gap-3" aria-label="Print_Flow Accueil">
            <img src="/Favicon_PrintFlow.png" alt="Logo Print_Flow" className="w-11 h-11 sm:w-12 sm:h-12 object-contain rounded-xl shrink-0 hover:scale-105 transition" />
          </a>

          {/* 5 CLEAN NAV LINKS (ACCUEIL, FONCTIONNALITÉS, TARIFS, TÉMOIGNAGES, FAQ) */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-text-secondary font-sans" aria-label="Navigation principale">
            <a href="#hero" className="hover:text-brand-primary transition">Accueil</a>
            <a href="#defis-solution" className="hover:text-brand-primary transition">Fonctionnalités</a>
            <a href="#tarifs" className="hover:text-brand-primary transition">Tarifs</a>
            <a href="#temoignages" className="hover:text-brand-primary transition">Témoignages</a>
            <a href="#faq" className="hover:text-brand-primary transition">FAQ</a>
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="px-5 py-2.5 bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-2 font-sans"
              >
                <span>Mon Espace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-5 py-2 bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold rounded-full transition shadow-xs font-sans hover:scale-[1.03]"
              >
                Se connecter
              </Link>
            )}
          </div>
        </header>
      </div>

      {/* FULL WIDTH HERO WRAPPER (COUVRE TOUTE LA LARGEUR DE L'ÉCRAN HAUTEUR COMPLÈTE) */}
      <div id="hero" className="w-full bg-gradient-to-b from-emerald-100/60 via-emerald-50/20 to-transparent dark:from-emerald-950/40 dark:via-slate-900/30 dark:to-transparent border-b border-border-subtle/50 pb-16 pt-4 -mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 pt-20">

          {/* HERO SECTION (A - ATTENTION) */}
          <section className="pt-4 pb-4 text-center space-y-8" aria-label="Présentation Print_Flow">
            
            {/* Centered Top Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-800 dark:text-emerald-300 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-brand-primary animate-pulse" />
              <span>Essai gratuit de 7 jours pour votre imprimerie</span>
            </div>

            {/* Centered H1 Headline (Verbe d'action coloré + Trait de soulignement courbé) */}
            <div className="max-w-3xl mx-auto space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-text-main tracking-tight leading-[1.18] font-sans">
                <span className="text-brand-primary">Centralisez</span> Devis, BAT & Production en{' '}
                <span className="relative inline-block">
                  un Seul Endroit
                  <svg className="absolute -bottom-2 left-0 w-full h-3 text-brand-primary" viewBox="0 0 200 20" preserveAspectRatio="none">
                    <path d="M5 15 Q 100 3, 195 14" stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="round" />
                  </svg>
                </span>
              </h1>

              <p className="text-sm sm:text-base text-text-secondary leading-relaxed max-w-xl mx-auto font-sans pt-2">
                Le logiciel de gestion pensé pour simplifier le quotidien des imprimeurs : zéro devis égaré, acomptes sécurisés et suivi de fabrication en temps réel.
              </p>
            </div>

            {/* Single Primary Action CTA (A - ACTION) */}
            <div className="flex items-center justify-center pt-2">
              <Link
                href="/login"
                className="px-8 py-4 bg-brand-primary hover:bg-brand-primary-hover text-white text-sm font-extrabold rounded-full transition shadow-lg flex items-center gap-2.5 font-sans hover:scale-[1.04]"
              >
                <span>Démarrer l'essai gratuit</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* SaaS Dashboard Frame Mockup (Crisp 1px Dark Border) */}
            <div className="pt-6 max-w-5xl mx-auto">
              <div className="bg-bg-card p-2.5 rounded-3xl border border-slate-900/80 dark:border-slate-700 shadow-2xl overflow-hidden transform hover:scale-[1.01] transition duration-500">
                <div className="bg-input-bg rounded-2xl overflow-hidden border border-slate-900/80 dark:border-slate-700 relative">
                  <div className="h-8 bg-slate-900 text-slate-200 px-4 flex items-center gap-2 border-b border-slate-900/80">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <span className="text-[10px] font-bold text-slate-300 mx-auto font-sans">Supervision d'Atelier — Dashboard Print_Flow</span>
                  </div>
                  <img
                    src="/Capture d'écran Dashboard.png"
                    alt="Aperçu Tableau de Bord Print_Flow"
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>
            </div>

          </section>

        </div>
      </div>

      {/* Main Inner Container for remaining sections */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-20">

        {/* SECTION 1: COMMENT ÇA MARCHE (4 ÉTAPES CLAIRES) */}
        <section id="comment-ca-marche" className="py-10 space-y-8 text-center bg-bg-card border border-border-subtle rounded-3xl p-6 sm:p-12 shadow-xs" aria-label="Comment ça marche">
          
          <div className="space-y-2 max-w-2xl mx-auto">
            <span className="px-3.5 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-[11px] font-extrabold inline-block font-sans border border-brand-primary/20">
              Comment ça marche
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-text-main font-sans">
              De l'Inscription à la Rentabilité — En 4 Étapes Simples.
            </h2>
            <p className="text-xs text-text-secondary max-w-lg mx-auto">
              Un processus intuitif conçu pour mettre votre atelier en ordre de marche sans perdre une minute.
            </p>
          </div>

          {/* 4 Cards Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch text-left pt-4">
            
            {/* Card 01 */}
            <div className="bg-bg-card border border-border-subtle rounded-3xl p-5 flex flex-col justify-between space-y-4 shadow-xs hover:scale-[1.03] transition duration-300 hover:shadow-xl cursor-pointer">
              <div className="space-y-3">
                <div className="rounded-2xl overflow-hidden border border-border-subtle aspect-16/9 bg-slate-100 dark:bg-slate-900">
                  <img
                    src="/Login.png"
                    alt="Inscription en 3 clics"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0 font-bold">
                    01
                  </div>
                  <h3 className="text-base font-bold text-text-main font-sans">Inscription en 3 clics</h3>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed font-sans">
                  Créez votre compte en quelques secondes et accédez directement à votre atelier sans carte bancaire.
                </p>
              </div>
            </div>

            {/* Card 02 */}
            <div className="bg-bg-card border-2 border-brand-primary rounded-3xl p-5 flex flex-col justify-between space-y-4 shadow-md hover:scale-[1.03] transition duration-300 hover:shadow-2xl cursor-pointer">
              <div className="space-y-3">
                <div className="rounded-2xl overflow-hidden border border-border-subtle aspect-16/9 bg-slate-100 dark:bg-slate-900">
                  <img
                    src="/boutique.png"
                    alt="Créez votre atelier & Partagez le lien"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-primary text-white flex items-center justify-center shrink-0 font-bold">
                    02
                  </div>
                  <h3 className="text-base font-bold text-text-main font-sans">Boutique & Catalogue</h3>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed font-sans">
                  Saisissez vos produits et partagez votre catalogue en ligne pour recevoir les demandes directes.
                </p>
              </div>
            </div>

            {/* Card 03 */}
            <div className="bg-bg-card border border-border-subtle rounded-3xl p-5 flex flex-col justify-between space-y-4 shadow-xs hover:scale-[1.03] transition duration-300 hover:shadow-xl cursor-pointer">
              <div className="space-y-3">
                <div className="rounded-2xl overflow-hidden border border-border-subtle aspect-16/9 bg-slate-100 dark:bg-slate-900">
                  <img
                    src="/flux.png"
                    alt="Gérez & Suivez le Flux"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0 font-bold">
                    03
                  </div>
                  <h3 className="text-base font-bold text-text-main font-sans">Gérez & Suivez le Flux</h3>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed font-sans">
                  Suivez le calage, la presse et le façonnage en temps réel sans courir après les dossiers.
                </p>
              </div>
            </div>

            {/* Card 04 */}
            <div className="bg-bg-card border border-border-subtle rounded-3xl p-5 flex flex-col justify-between space-y-4 shadow-xs hover:scale-[1.03] transition duration-300 hover:shadow-xl cursor-pointer">
              <div className="space-y-3">
                <div className="rounded-2xl overflow-hidden border border-border-subtle aspect-16/9 bg-slate-100 dark:bg-slate-900">
                  <img
                    src="/facture.png"
                    alt="Facturez & Gérez vos Revenus"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0 font-bold">
                    04
                  </div>
                  <h3 className="text-base font-bold text-text-main font-sans">Facturez & Encaissez</h3>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed font-sans">
                  Déduisez l'acompte automatiquement et encaissez le solde dû lors de la livraison sans litige.
                </p>
              </div>
            </div>

          </div>

        </section>

        {/* SECTION 2: SÉRÉNITÉ RETROUVÉE (I - INTÉRÊT & DÉSIR) */}
        <section id="solutions" className="py-10 space-y-8 text-left bg-gradient-to-br from-emerald-950/20 via-bg-card to-emerald-950/10 border border-brand-primary/30 rounded-3xl p-6 sm:p-10 shadow-lg" aria-label="La Sérénité Retrouvée avec Print_Flow">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Featured Image with Overlay Badge */}
            <div className="lg:col-span-5 relative">
              <div className="rounded-3xl overflow-hidden border border-border-subtle shadow-xl bg-slate-900 aspect-4/5 relative group hover:scale-[1.01] transition duration-500">
                <img
                  src="/Sign in et login .png"
                  alt="Sérénité Atelier Print_Flow"
                  className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />

                {/* Overlapping Floating Badge */}
                <div className="absolute bottom-6 left-6 right-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-border-subtle rounded-2xl p-4 shadow-xl flex items-center gap-3">
                  <div className="flex -space-x-2 overflow-hidden">
                    <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover" src="/Temoignage.jpg" alt="" />
                    <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover" src="/Temoignage (2).jpg" alt="" />
                    <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover" src="/Temoignage3.jpg" alt="" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-text-main">Rejoignez 50+ imprimeries actives</p>
                    <p className="text-[10px] text-text-secondary">Traçabilité 100% garantie</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Card Layout */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="space-y-3">
                <span className="px-3.5 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-[11px] font-extrabold inline-block font-sans border border-brand-primary/20">
                  Sérénité Atelier
                </span>
                <h2 className="text-2xl sm:text-4xl font-black text-text-main font-sans leading-tight">
                  La Sérénité Retrouvée dans votre Imprimerie
                </h2>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-sans">
                  Print_Flow transforme le désordre des fiches volantes en un flux clair : chaque devis est tracé, le Bon à Tirer est validé avant impression et chaque centime d'acompte est déduit sur la facture finale.
                </p>
              </div>

              {/* Action CTA Button */}
              <div>
                <Link
                  href="/login"
                  className="px-6 py-3 bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold rounded-full transition shadow-md inline-flex items-center gap-2 font-sans hover:scale-[1.03]"
                >
                  <span>Démarrer l'essai gratuit</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* 2 Sub-cards at Bottom */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border-subtle">
                
                <div className="bg-bg-card border border-border-subtle rounded-2xl p-4 space-y-2 hover:scale-[1.02] transition shadow-xs">
                  <div className="w-8 h-8 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                    <Shield className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-bold text-text-main font-sans">Confidentialité Atelier</h3>
                  <p className="text-[11px] text-text-secondary leading-relaxed">
                    Les fiches de fabrication préservent le secret de vos machines et de vos marges.
                  </p>
                </div>

                <div className="bg-bg-card border border-border-subtle rounded-2xl p-4 space-y-2 hover:scale-[1.02] transition shadow-xs">
                  <div className="w-8 h-8 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                    <Eye className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-bold text-text-main font-sans">Visibilité Client</h3>
                  <p className="text-[11px] text-text-secondary leading-relaxed">
                    Donnez des réponses précises et instantanées à vos clients sur l'avancement exact.
                  </p>
                </div>

              </div>
            </div>

          </div>

        </section>

        {/* SECTION 3: DÉFIS VS SOLUTIONS (FONCTIONNALITÉS) */}
        <section id="defis-solution" className="py-10 space-y-8 text-left bg-slate-100/70 dark:bg-slate-900/60 border border-border-subtle rounded-3xl p-6 sm:p-10 shadow-xs" aria-label="Défis et Solutions Imprimerie">
          
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-extrabold uppercase tracking-wider text-brand-primary font-sans">Résolution de Problèmes</span>
            <h2 className="text-2xl sm:text-4xl font-black text-text-main font-sans">
              Des Solutions Concrètes pour Chaque Défi de votre Atelier.
            </h2>
            <p className="text-xs text-text-secondary">
              Découvrez comment nos fonctionnalités éliminent directement les goulots d'étranglement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            
            {/* Resolution Pair 1: Devis */}
            <div className="bg-bg-card border border-border-subtle rounded-3xl p-6 flex flex-col justify-between space-y-4 shadow-xs hover:scale-[1.02] hover:border-brand-primary/40 transition duration-300 h-full">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle pb-3">
                <span className="px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 text-[10px] font-bold flex items-center gap-1.5 shrink-0">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>DÉFI : Carnets égarés</span>
                </span>
                <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold flex items-center gap-1.5 shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-primary" />
                  <span>RÉSOLU PAR : Module Devis</span>
                </span>
              </div>
              <div className="space-y-2 flex-1 flex flex-col justify-center">
                <h3 className="text-sm font-bold text-text-main font-sans">Prise de Devis & Archivage Numérique</h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Fini la perte d'historique ou les oublis de prix récurrents. Générez vos devis en PDF A4 instantanément avec calcul automatique de la TVA personnalisable et retrouvez chaque client en 1 clic.
                </p>
              </div>
            </div>

            {/* Resolution Pair 2: Acomptes & Facturation */}
            <div className="bg-bg-card border border-border-subtle rounded-3xl p-6 flex flex-col justify-between space-y-4 shadow-xs hover:scale-[1.02] hover:border-brand-primary/40 transition duration-300 h-full">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle pb-3">
                <span className="px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 text-[10px] font-bold flex items-center gap-1.5 shrink-0">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>DÉFI : Litiges acomptes</span>
                </span>
                <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold flex items-center gap-1.5 shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-primary" />
                  <span>RÉSOLU PAR : Facturation</span>
                </span>
              </div>
              <div className="space-y-2 flex-1 flex flex-col justify-center">
                <h3 className="text-sm font-bold text-text-main font-sans">Enregistrement & Déduction Automatique</h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Chaque acompte perçu à la commande est verrouillé et déduit du montant Total TTC lors de la livraison. La facture finale affiche clairement le Solde Dû restant, évitant 100% des disputes d'impayés.
                </p>
              </div>
            </div>

            {/* Resolution Pair 3: Verrou BAT */}
            <div className="bg-bg-card border border-border-subtle rounded-3xl p-6 flex flex-col justify-between space-y-4 shadow-xs hover:scale-[1.02] hover:border-brand-primary/40 transition duration-300 h-full">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle pb-3">
                <span className="px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 text-[10px] font-bold flex items-center gap-1.5 shrink-0">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>DÉFI : Gâchis réimpressions</span>
                </span>
                <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold flex items-center gap-1.5 shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-primary" />
                  <span>RÉSOLU PAR : Verrou BAT</span>
                </span>
              </div>
              <div className="space-y-2 flex-1 flex flex-col justify-center">
                <h3 className="text-sm font-bold text-text-main font-sans">Blocage Automatique de Production</h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Aucun tirage ne peut démarrer en atelier sans la validation explicite du Bon à Tirer (BAT) par le client. Vous éliminez définitivement le gâchis de papier causé par les fichiers erronés.
                </p>
              </div>
            </div>

            {/* Resolution Pair 4: Suivi de Flux */}
            <div className="bg-bg-card border border-border-subtle rounded-3xl p-6 flex flex-col justify-between space-y-4 shadow-xs hover:scale-[1.02] hover:border-brand-primary/40 transition duration-300 h-full">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle pb-3">
                <span className="px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 text-[10px] font-bold flex items-center gap-1.5 shrink-0">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>DÉFI : Flou atelier</span>
                </span>
                <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold flex items-center gap-1.5 shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-primary" />
                  <span>RÉSOLU PAR : Suivi de Flux</span>
                </span>
              </div>
              <div className="space-y-2 flex-1 flex flex-col justify-center">
                <h3 className="text-sm font-bold text-text-main font-sans">Traçabilité & Suivi en Temps Réel</h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Suivez en direct le statut exact de chaque tirage (En attente, Sous presse, Façonnage, Prêt) et éditez des fiches de production sans divulguer le nom des machines ni les marges.
                </p>
              </div>
            </div>

          </div>

        </section>

        {/* SECTION 4: TÉMOIGNAGES (D - DÉSIR) */}
        <section id="temoignages" className="py-10 space-y-8 text-center bg-slate-900 text-white border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl" aria-label="Témoignages Clients">
          
          <div className="space-y-2 max-w-2xl mx-auto">
            <span className="px-3.5 py-1 rounded-full bg-brand-primary/20 text-brand-primary text-[11px] font-bold inline-block font-sans border border-brand-primary/30">
              Témoignages
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white font-sans">
              Adopté par les imprimeries à travers l'Afrique francophone
            </h2>
            <p className="text-xs text-slate-400">
              Découvrez comment nos utilisateurs ont sécurisé leurs acomptes et leur production.
            </p>
          </div>

          {/* Testimonial Display Slide */}
          <div className="max-w-3xl mx-auto space-y-6 pt-4">
            <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-6 sm:p-8 space-y-4 text-left shadow-md">
              <p className="text-sm sm:text-base italic text-slate-100 leading-relaxed font-sans">
                "{testimonials[activeTestimonial].quote}"
              </p>
              
              <div className="flex items-center gap-4 pt-2 border-t border-slate-700">
                <img
                  src={testimonials[activeTestimonial].image}
                  alt={testimonials[activeTestimonial].name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-brand-primary shrink-0"
                />
                <div>
                  <h3 className="text-sm font-bold text-white font-sans">{testimonials[activeTestimonial].name}</h3>
                  <p className="text-xs text-slate-400">{testimonials[activeTestimonial].role} • {testimonials[activeTestimonial].company}</p>
                </div>
              </div>
            </div>

            {/* Slider Controls */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setActiveTestimonial((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1))}
                aria-label="Témoignage précédent"
                className="p-2 rounded-full bg-slate-800 border border-slate-700 hover:border-brand-primary text-white transition cursor-pointer hover:scale-[1.05]"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2">
                {testimonials.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveTestimonial(idx)}
                    aria-label={`Aller au témoignage ${idx + 1}`}
                    className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                      idx === activeTestimonial ? 'bg-brand-primary w-6' : 'bg-slate-700'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={() => setActiveTestimonial((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1))}
                aria-label="Témoignage suivant"
                className="p-2 rounded-full bg-slate-800 border border-slate-700 hover:border-brand-primary text-white transition cursor-pointer hover:scale-[1.05]"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

        </section>

        {/* SECTION 5: TARIFS (PLACÉE APRÈS LES TÉMOIGNAGES) */}
        <section id="tarifs" className="py-10 space-y-8 text-center bg-slate-100/60 dark:bg-slate-900/40 border border-border-subtle rounded-3xl p-6 sm:p-10 shadow-xs" aria-label="Tarifs et Abonnements">
          
          <div className="space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-extrabold uppercase tracking-wider text-brand-primary font-sans">Transparence Tarifaire</span>
            <h2 className="text-2xl sm:text-4xl font-black text-text-main font-sans">Des Tarifs Clairs et Sans Surprise.</h2>
            <p className="text-xs text-text-secondary">
              Choisissez le forfait adapté à la taille de votre atelier. Changez d'offre à tout moment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto text-left pt-4">
            
            {/* Card 1: DÉMARRAGE */}
            <div className="bg-bg-card border border-border-subtle rounded-3xl p-6 flex flex-col justify-between space-y-6 shadow-xs hover:scale-[1.01] transition">
              <div className="space-y-4">
                <div className="text-xs font-black text-text-secondary uppercase tracking-wider">DÉMARRAGE</div>
                <p className="text-xs text-text-secondary">Pour tester l'outil gratuitement dans votre atelier.</p>
                
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-text-main font-sans">0</span>
                  <span className="text-xs text-text-secondary">/ 7 jours</span>
                </div>

                <Link
                  href="/login"
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition text-center block font-sans"
                >
                  DÉMARRER L'ESSAI GRATUIT
                </Link>

                <div className="space-y-2 text-xs text-text-secondary pt-4 border-t border-border-subtle">
                  <p className="font-extrabold text-[10px] uppercase text-text-secondary">INCLUS DANS L'ESSAI :</p>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-brand-primary shrink-0" />
                    <span>1 utilisateur unique</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-brand-primary shrink-0" />
                    <span>Devis & Factures TVA Configurable</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-brand-primary shrink-0" />
                    <span>Bons de commande & Fiches atelier</span>
                  </li>
                  <li className="flex items-center gap-2 text-text-secondary/50">
                    <X className="w-4 h-4 text-rose-500 shrink-0" />
                    <span className="line-through">Boutique en ligne client</span>
                  </li>
                  <li className="flex items-center gap-2 text-text-secondary/50">
                    <X className="w-4 h-4 text-rose-500 shrink-0" />
                    <span className="line-through">Historique d'audit d'impression</span>
                  </li>
                </div>
              </div>
            </div>

            {/* Card 2: FORMULE PRO */}
            <div className="bg-slate-950 text-white border-2 border-brand-primary rounded-3xl p-6 flex flex-col justify-between space-y-6 shadow-xl relative hover:scale-[1.02] transition">
              <div className="absolute -top-3.5 right-6 px-3 py-1 bg-brand-primary text-white text-[10px] font-black uppercase rounded-full tracking-wider">
                LE PLUS POPULAIRE
              </div>

              <div className="space-y-4">
                <div className="text-xs font-black text-brand-primary uppercase tracking-wider">FORMULE PRO</div>
                <p className="text-xs text-slate-400">Pour les imprimeries souhaitant une traçabilité totale.</p>
                
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white font-sans">{formatFCFA(14900)}</span>
                  <span className="text-xs text-slate-400">/ mois</span>
                </div>

                <Link
                  href="/login"
                  className="w-full py-3 bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold rounded-xl transition text-center block shadow-md font-sans"
                >
                  SOUSCRIRE À LA FORMULE PRO
                </Link>

                <div className="space-y-2 text-xs text-slate-300 pt-4 border-t border-slate-800">
                  <p className="font-extrabold text-[10px] uppercase text-brand-primary">TOUT CE QUI EST INCLUS :</p>
                  <li className="flex items-center gap-2 font-bold text-white">
                    <Check className="w-4 h-4 text-brand-primary shrink-0" />
                    <span>Collaborateurs & Personnel illimités</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-brand-primary shrink-0" />
                    <span>Catalogue Public Storefront</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-brand-primary shrink-0" />
                    <span>Prise de commandes en ligne</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-brand-primary shrink-0" />
                    <span>Historique d'audit & Journal des logs</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-brand-primary shrink-0" />
                    <span>Export PDF A4 personnalisé avec logo</span>
                  </li>
                </div>
              </div>
            </div>

            {/* Card 3: MULTI-ATELIERS */}
            <div className="bg-bg-card border border-border-subtle rounded-3xl p-6 flex flex-col justify-between space-y-6 shadow-xs hover:scale-[1.01] transition">
              <div className="space-y-4">
                <div className="text-xs font-black text-text-secondary uppercase tracking-wider">MULTI-ATELIERS</div>
                <p className="text-xs text-text-secondary">Pour les réseaux d'imprimeries et groupes régionaux.</p>
                
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-text-main font-sans">Sur Devis</span>
                </div>

                <Link
                  href="/login"
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition text-center block font-sans"
                >
                  RÉSERVER UNE DÉMO
                </Link>

                <div className="space-y-2 text-xs text-text-secondary pt-4 border-t border-border-subtle">
                  <p className="font-extrabold text-[10px] uppercase text-text-secondary">SERVICES SUR MESURE :</p>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-brand-primary shrink-0" />
                    <span>Multi-imprimeries & RLS dédié</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-brand-primary shrink-0" />
                    <span>Accompagnement et formation atelier</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-brand-primary shrink-0" />
                    <span>Support prioritaire 24/7</span>
                  </li>
                </div>
              </div>
            </div>

          </div>

        </section>

        {/* SECTION 6: FAQ */}
        <section id="faq" className="py-10 space-y-8 text-left" aria-label="Foire Aux Questions">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column Card */}
            <div className="lg:col-span-4 bg-bg-card border border-border-subtle rounded-3xl p-6 space-y-4 shadow-xs">
              <img
                src="/Temoignage (2).jpg"
                alt="Support Technique Print_Flow"
                className="w-14 h-14 rounded-full object-cover border-2 border-brand-primary"
              />
              <div className="space-y-1">
                <h3 className="text-lg font-black text-text-main font-sans">Réserver une démo de 15 min</h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Posez vos questions directement à notre équipe avant de démarrer votre essai.
                </p>
              </div>

              <a
                href="https://calendar.google.com/calendar/u/0/r"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold rounded-xl transition text-center flex items-center justify-center gap-2 shadow-xs font-sans hover:scale-[1.02]"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Réserver une Démo Gratuite</span>
              </a>
            </div>

            {/* Right Column Accordion */}
            <div className="lg:col-span-8 space-y-3">
              <h2 className="text-2xl font-black text-text-main pb-2 font-sans">Foire Aux Questions (FAQ)</h2>
              
              {faqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    className="bg-bg-card border border-border-subtle rounded-2xl overflow-hidden transition shadow-xs"
                  >
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      aria-expanded={isOpen}
                      className="w-full p-4 flex items-center justify-between text-left font-bold text-sm text-text-main hover:text-brand-primary transition cursor-pointer font-sans"
                    >
                      <span>{faq.q}</span>
                      <div className="p-1 rounded-md bg-brand-primary/10 text-brand-primary">
                        {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      </div>
                    </button>

                    {isOpen && (
                      <div className="px-4 pb-4 text-xs text-text-secondary leading-relaxed border-t border-border-subtle pt-3">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>

        </section>

        {/* Footer */}
        <footer className="border-t border-border-subtle pt-8 pb-6 text-center text-xs text-text-secondary space-y-3">
          <div className="flex flex-wrap items-center justify-center gap-3 font-bold text-text-main font-sans">
            <span>Print_Flow</span>
            <span>•</span>
            <span>Logiciel SaaS Imprimerie</span>
            <span>•</span>
            <a 
              href="https://wa.me/24162451522" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-brand-primary hover:underline flex items-center gap-1"
            >
              <span>Contact WhatsApp : +241 62 45 15 22</span>
            </a>
          </div>
          <p>© 2026 Print_Flow. Tous droits réservés. <span className="font-bold text-text-main">Conçu par Hullys Désiré</span>.</p>
        </footer>

      </main>
    </div>
  );
}

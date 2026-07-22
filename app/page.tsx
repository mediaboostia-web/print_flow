'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Printer,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  FileText,
  Layers,
  Globe,
  Users,
  Check,
  Star,
  Play,
  Building2,
  TrendingUp,
  Clock,
  CreditCard,
  Lock,
  AlertCircle,
  ChevronRight,
  Send,
  Zap,
  HelpCircle,
  BarChart3,
  Package,
  XCircle,
  FileCheck,
  Calculator,
  Store,
  Eye,
  CheckCircle,
  X,
  Sparkle
} from 'lucide-react';
import { useAppStore } from '@/lib/state/store';
import { formatFCFA } from '@/lib/utils/money';

export default function LandingPage() {
  const router = useRouter();
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);

  // Live Simulator state in Hero
  const [simQuantity, setSimQuantity] = useState(5000);
  const [simUnitPrice, setSimUnitPrice] = useState(60);
  const [heroTab, setHeroTab] = useState<'devis' | 'bat' | 'facture'>('devis');

  // Interactive Breathtaking Feature Tab State
  const [selectedFeature, setSelectedFeature] = useState<number>(0);

  // Live Devis calculations
  const simSubtotal = simQuantity * simUnitPrice;
  const simVat = Math.round(simSubtotal * 0.18);
  const simTotal = simSubtotal + simVat;

  // IntersectionObserver fade-in-up effect
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('opacity-100', 'translate-y-0');
            entry.target.classList.remove('opacity-0', 'translate-y-8');
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.fade-in-up').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const features = [
    {
      id: 0,
      title: "Devis & Facturation FCFA (TVA 18% Intégrée)",
      badge: "TVA 18% Automatique",
      icon: Calculator,
      color: "from-emerald-500 to-teal-600",
      description: "Créez des devis complexes en quelques secondes : choix du papier, grammage, formats additionnels et finitions. Calcul automatique du montant HT, TVA 18% et TTC avec export PDF A4 instantané.",
      previewTitle: "Générateur de Devis Corporate A4",
      previewContent: {
        item: "Flyers A5 R/V Couché Brillant 135g",
        qty: "5 000 ex.",
        price: "60 FCFA",
        totalHt: "300 000 FCFA",
        vat18: "54 000 FCFA",
        totalTtc: "354 000 FCFA"
      }
    },
    {
      id: 1,
      title: "Validation Bon à Tirer (BAT .ZIP 500 Mo)",
      badge: "Protection Anti-Erreur",
      icon: ShieldCheck,
      color: "from-cyan-500 to-blue-600",
      description: "Téléversez les épreuves d'impression HD. Votre client consulte et valide son BAT en ligne avec horodatage, commentaire et verrouillage automatique de la commande avant tirage.",
      previewTitle: "Épreuve BAT Verrouillée & Conforme",
      previewContent: {
        file: "Catalogue_Orange_v2_HD.zip (45 Mo)",
        status: "BAT Validé par le Client",
        date: "Horodaté au 22/07/2026 10:15",
        verdict: "Commande verrouillée : Transmission directe aux presses Offset."
      }
    },
    {
      id: 2,
      title: "Fiches d'Atelier Confidentielles",
      badge: "Confidentialité Prix",
      icon: Layers,
      color: "from-amber-500 to-orange-600",
      description: "Transmettez les instructions techniques aux techniciens de machines (Offset, Numérique, Sérigraphie, Massicot) sans divulguer vos prix de vente et vos marges commerciales.",
      previewTitle: "Fiche d'Instruction de Tirage Atelier",
      previewContent: {
        machine: "Heidelberg Speedmaster 5 Couleurs",
        paper: "Couché Brillant 135g • Format 50x70 cm",
        finishing: "Massicotage + Piquage 2 points métal",
        confidentiality: "⚠️ Prix et marges masqués pour l'équipe technique"
      }
    },
    {
      id: 3,
      title: "Boutique en Ligne & Catalogue Public 24/7",
      badge: "Génération de Leads",
      icon: Store,
      color: "from-purple-500 to-indigo-600",
      description: "Offrez à votre imprimerie une vitrine web sur-mesure. Vos clients parcourent vos formats de papier, choisissent leurs quantités et vous envoient leurs demandes directement convertibles en devis.",
      previewTitle: "Storefront Web Public Imprimerie",
      previewContent: {
        url: "printflow.app/catalogue/org-sud-print",
        lead: "Nouvelle commande web : 10 000 Depliants A4 3 volets",
        action: "1-Clic: Convertir en Devis Officiel"
      }
    }
  ];

  const testimonials = [
    {
      initials: "MN",
      name: "Mamadou Ndiaye",
      role: "Directeur, Sud Print",
      location: "Dakar, Sénégal 🇸🇳",
      text: "PrintFlow a totalement réinventé la gestion de notre atelier à Dakar. Nos devis sont validés 2x plus vite et le calcul automatique de la TVA 18% nous fait gagner un temps précieux lors des bilans.",
      color: "bg-emerald-600"
    },
    {
      initials: "KK",
      name: "Kouassi Konan",
      role: "Fondateur, Ivoire Impression",
      location: "Abidjan, C.I. 🇨🇮",
      text: "Le verrouillage électronique des BAT nous a épargné plusieurs ré-impressions coûteuses à Abidjan. Les fiches d'atelier sont claires et nos clients apprécient le rendu des factures A4.",
      color: "bg-blue-600"
    },
    {
      initials: "SO",
      name: "Stéphanie Ondo",
      role: "Gérante, Libreville Graphique",
      location: "Libreville, Gabon 🇬🇦",
      text: "Grâce au catalogue public inclus dans le plan Pro, nous recevons régulièrement des demandes de devis d'entreprises locales à Libreville. C'est le SaaS idéal !",
      color: "bg-purple-600"
    },
    {
      initials: "OK",
      name: "Ousmane Keita",
      role: "Gérant, Sahel Graphique",
      location: "Bamako, Mali 🇲🇱",
      text: "La rapidité de création des devis FCFA avec les paliers de prix par quantité a transformé la rentabilité de notre imprimerie. Un outil indispensable !",
      color: "bg-amber-600"
    },
    {
      initials: "EB",
      name: "Emmanuel Biya",
      role: "Directeur, Douala Print",
      location: "Douala, Cameroun 🇨🇲",
      text: "Le suivi automatique des livraisons et des paiements par acompte nous évite tout oubli de facturation. Le support WhatsApp local est ultra réactif.",
      color: "bg-teal-600"
    }
  ];

  return (
    <div className="min-h-screen bg-[#060A10] text-[#E2E2E6] font-sans selection:bg-[#00B060]/30 selection:text-[#00B060] overflow-x-hidden relative">
      
      {/* GLOWING AMBIENT BACKGROUND LIGHTING */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div 
          className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[1200px] h-[700px] opacity-35 blur-[150px]"
          style={{ background: 'radial-gradient(circle, rgba(1, 38, 31, 0.9) 0%, rgba(0, 176, 96, 0.25) 45%, transparent 70%)' }}
        />
        <div 
          className="absolute top-[40%] right-[-10%] w-[600px] h-[600px] opacity-25 blur-[160px]"
          style={{ background: 'radial-gradient(circle, rgba(73, 100, 85, 0.4) 0%, rgba(1, 38, 31, 0.3) 50%, transparent 70%)' }}
        />
      </div>

      {/* TOP NAVIGATION BAR */}
      <nav className="bg-[#060A10]/85 backdrop-blur-xl sticky top-0 w-full border-b border-slate-800/80 z-50 transition-all duration-300">
        <div className="flex justify-between items-center h-20 px-4 sm:px-8 max-w-7xl mx-auto">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <img src="/Favicon_PrintFlow.png" alt="Print_Flow" className="w-9 h-9 object-contain rounded-xl shadow-lg group-hover:scale-105 transition" />
            <span className="text-xl font-black tracking-tight text-white">
              Print<span className="text-[#00B060]">_Flow</span>
            </span>
          </Link>

          {/* Links */}
          <ul className="hidden md:flex gap-8 text-xs font-bold text-slate-300">
            <li><a className="hover:text-[#00B060] transition-colors" href="#problemes">Problèmes</a></li>
            <li><a className="hover:text-[#00B060] transition-colors" href="#fonctionnalites">Fonctionnalités</a></li>
            <li><a className="hover:text-[#00B060] transition-colors" href="#comment-ca-marche">Comment ça marche</a></li>
            <li><a className="hover:text-[#00B060] transition-colors" href="#temoignages">Témoignages</a></li>
            <li><a className="hover:text-[#00B060] transition-colors" href="#tarification">Tarification</a></li>
          </ul>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="bg-[#00B060] hover:bg-[#009652] text-white text-xs font-bold px-6 py-3 rounded-full shadow-lg shadow-[#00B060]/20 transition magnetic-btn flex items-center gap-2"
              >
                <span>Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link className="text-slate-300 hover:text-white text-xs font-bold hidden md:block px-3 py-2" href="/login">
                  Se connecter
                </Link>
                <Link className="bg-[#00B060] hover:bg-[#009652] text-white text-xs font-bold px-6 py-3 rounded-full shadow-lg shadow-[#00B060]/20 transition magnetic-btn flex items-center gap-2" href="/login">
                  <span>Commencer gratuitement</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>

        </div>
      </nav>

      <main className="relative z-10">

        {/* HERO SECTION */}
        <section className="py-16 sm:py-24 px-4 sm:px-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center min-h-[85vh]">
          
          <div className="lg:col-span-7 space-y-7 text-left">
            <div className="inline-flex items-center gap-2 bg-[#1a3c34]/60 border border-[#00B060]/30 text-[#00B060] px-4 py-1.5 rounded-full text-[11px] font-bold tracking-wide uppercase shadow-lg shadow-[#00B060]/10 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-[#00B060]" />
              <span>SaaS N°1 de Facturation & Atelier d'Imprimerie en Afrique francophone</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-white leading-[1.1] tracking-tight">
              Gérez vos Devis, BAT & Factures FCFA <br />
              <span className="font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-[#00B060] via-emerald-300 to-cyan-400">
                avec la précision d'une grande imprimerie.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed">
              Conçu spécialement pour les imprimeries du Sénégal, Côte d'Ivoire, Gabon et d'Afrique francophone. Calcul automatique de la TVA 18%, validation des BAT et fiches d'atelier en 1 clic.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link
                href="/login"
                className="bg-[#00B060] hover:bg-[#009652] text-white text-xs font-bold px-8 py-4 rounded-full magnetic-btn shadow-xl shadow-[#00B060]/30 transition text-center flex items-center justify-center gap-2"
              >
                <span>Démarrer l'Essai Gratuit (7 jours)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#live-simulator"
                className="bg-slate-900/80 text-white border border-slate-700 hover:border-[#00B060] text-xs font-bold px-8 py-4 rounded-full magnetic-btn transition text-center flex items-center justify-center gap-2 backdrop-blur-md"
              >
                <Play className="w-4 h-4 text-[#00B060] fill-[#00B060]" />
                <span>Tester le Simulateur en Direct</span>
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs text-slate-400 pt-2 opacity-90">
              <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-[#00B060]" /> Aucun engagement bancaire</span>
              <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-[#00B060]" /> Config en 60s</span>
              <span className="flex items-center gap-1.5"><Send className="w-3.5 h-3.5 text-[#00B060]" /> Support local WhatsApp 7j/7</span>
            </div>
          </div>

          {/* Hero Visual Mockup Card */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="w-full rounded-3xl bg-[#101726]/90 border border-slate-800 shadow-2xl p-6 space-y-5 text-left relative overflow-hidden backdrop-blur-xl hover:border-[#00B060]/40 transition duration-500">
              
              {/* App Mockup Bar */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                  <span className="text-[11px] font-mono text-slate-400 pl-2">printflow.app/devis</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#00B060]/10 text-[#00B060] border border-[#00B060]/20 text-[10px] font-bold">
                  Sénégal • FCFA
                </span>
              </div>

              {/* Stats Card */}
              <div className="p-4 rounded-2xl bg-[#080C14] border border-slate-800 space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Chiffre d'Affaires Mensuel</p>
                <p className="text-2xl font-black text-white">{formatFCFA(18450000)}</p>
                <p className="text-[11px] font-bold text-[#00B060] flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> +28% vs mois dernier
                </p>
              </div>

              {/* Floating Badge */}
              <div className="p-3 rounded-xl bg-[#1a3c34]/80 border border-[#00B060]/30 text-xs font-bold text-white flex items-center justify-between shadow-lg">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00B060]" />
                  <span>Taux de Conformation BAT</span>
                </span>
                <span className="text-sm font-black text-[#00B060]">99.2%</span>
              </div>

              {/* Quick Devis Preview */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-400 font-bold border-b border-slate-800 pb-1">
                  <span>Brochure A4 16p (1 000 ex.)</span>
                  <span className="text-white font-black">{formatFCFA(950000)}</span>
                </div>
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>TVA 18% Automatique</span>
                  <span className="text-amber-400 font-bold">{formatFCFA(171000)}</span>
                </div>
              </div>

            </div>
          </div>

        </section>

        {/* PROBLEM SECTION */}
        <section id="problemes" className="py-24 bg-[#080C14] border-y border-slate-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
            
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <p className="text-[#00B060] text-xs font-bold uppercase tracking-wider">Le Défi des Imprimeries</p>
              <h2 className="text-3xl sm:text-5xl font-black font-serif text-white">Pourquoi les méthodes traditionnelles freinent votre rentabilité ?</h2>
              <p className="text-sm sm:text-base text-slate-400">Découvrez la différence nette entre la gestion manuelle vulnérable aux erreurs et l'automatisation avec PrintFlow.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Sans PrintFlow */}
              <div className="bg-rose-950/20 border border-rose-900/40 p-8 sm:p-10 rounded-3xl space-y-6">
                <div className="flex items-center gap-3 border-b border-rose-900/40 pb-4">
                  <XCircle className="w-8 h-8 text-rose-500 shrink-0" />
                  <h3 className="text-xl font-bold text-white">Sans PrintFlow (Gestion Manuelle)</h3>
                </div>
                <ul className="space-y-5 text-xs sm:text-sm text-slate-300">
                  <li className="flex items-start gap-3">
                    <X className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span><strong className="text-white">Factures Word/Excel non professionnelles</strong> qui dévalorisent l'image de votre imprimerie auprès des grandes entreprises.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <X className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span><strong className="text-white">Erreurs de calcul sur la TVA 18%</strong> causant des redressements ou des décalages de trésorerie inattendus.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <X className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span><strong className="text-white">Litiges sur les fichiers d'impression</strong> sans preuve formelle de validation du BAT par le client.</span>
                  </li>
                </ul>
              </div>

              {/* Avec PrintFlow */}
              <div className="bg-[#1a3c34]/20 border border-[#00B060]/40 p-8 sm:p-10 rounded-3xl space-y-6 shadow-xl relative overflow-hidden">
                <div className="flex items-center gap-3 border-b border-[#00B060]/30 pb-4">
                  <CheckCircle2 className="w-8 h-8 text-[#00B060] shrink-0" />
                  <h3 className="text-xl font-bold text-white">Avec PrintFlow (Modernisation Totale)</h3>
                </div>
                <ul className="space-y-5 text-xs sm:text-sm text-emerald-100">
                  <li className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-[#00B060] shrink-0 mt-0.5" />
                    <span><strong className="text-white">Documents A4 corporate en 1 clic</strong> (Devis, Factures, Bons de Livraison) personnalisés à vos couleurs et logo.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-[#00B060] shrink-0 mt-0.5" />
                    <span><strong className="text-white">TVA 18% exacte et automatique</strong> avec gestion multi-devises (FCFA, EUR, USD, MAD, GNF).</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-[#00B060] shrink-0 mt-0.5" />
                    <span><strong className="text-white">BAT verrouillé électroniquement</strong> empêchant les erreurs coûteuses d'impression en atelier.</span>
                  </li>
                </ul>
              </div>

            </div>

          </div>
        </section>

        {/* BREATHTAKING & IMPRESSIVE ANIMATED FEATURES SECTION */}
        <section id="fonctionnalites" className="py-24 max-w-7xl mx-auto px-4 sm:px-8 space-y-16 relative">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="px-3 py-1 rounded-full bg-[#00B060]/10 border border-[#00B060]/20 text-[#00B060] text-xs font-bold uppercase tracking-wider">
              Architecture & Fonctionnalités d'Élite
            </span>
            <h2 className="text-3xl sm:text-5xl font-black font-serif text-white">
              Une plateforme complète conçue pour l'atelier et la direction
            </h2>
            <p className="text-sm sm:text-base text-slate-400">
              Cliquez sur chaque module pour découvrir l'expérience interactive en direct.
            </p>
          </div>

          {/* Interactive Feature Tabs */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Feature Selector List */}
            <div className="lg:col-span-5 space-y-4">
              {features.map((feat) => {
                const IconComponent = feat.icon;
                const isSelected = selectedFeature === feat.id;

                return (
                  <div
                    key={feat.id}
                    onClick={() => setSelectedFeature(feat.id)}
                    className={`p-6 rounded-2xl border transition-all duration-300 cursor-pointer feature-card-glow ${
                      isSelected
                        ? 'bg-[#101726] border-[#00B060] shadow-xl shadow-[#00B060]/10 translate-x-2'
                        : 'bg-[#080C14]/80 border-slate-800 hover:border-slate-700 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
                        isSelected ? 'bg-[#00B060] text-white' : 'bg-slate-800 text-slate-300'
                      }`}>
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-white">{feat.title}</h3>
                        </div>
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#00B060]/10 text-[#00B060] text-[10px] font-bold border border-[#00B060]/20">
                          {feat.badge}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Breathtaking Interactive Live Preview Box */}
            <div className="lg:col-span-7">
              <div className="p-8 rounded-3xl bg-[#101726] border border-[#00B060]/40 shadow-2xl space-y-6 relative overflow-hidden backdrop-blur-xl">
                
                {/* Header Preview */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#00B060]" />
                    <span className="text-sm font-bold text-white">{features[selectedFeature].previewTitle}</span>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#00B060]/10 text-[#00B060] text-xs font-bold border border-[#00B060]/30">
                    Aperçu Temps Réel
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {features[selectedFeature].description}
                </p>

                {/* Feature Specific Live Interactive Demo Card */}
                {selectedFeature === 0 && (
                  <div className="p-5 rounded-2xl bg-[#080C14] border border-slate-800 space-y-3 text-xs">
                    <div className="flex justify-between items-center text-slate-400 pb-2 border-b border-slate-800">
                      <span>Article : <strong className="text-white">{features[0].previewContent.item}</strong></span>
                      <span className="text-[#00B060] font-bold">{features[0].previewContent.qty}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 py-2 text-slate-300">
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase font-bold">Total HT</p>
                        <p className="font-bold text-white text-sm">{features[0].previewContent.totalHt}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase font-bold">TVA 18%</p>
                        <p className="font-bold text-amber-400 text-sm">{features[0].previewContent.vat18}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase font-bold">TOTAL TTC</p>
                        <p className="font-black text-[#00B060] text-sm">{features[0].previewContent.totalTtc}</p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedFeature === 1 && (
                  <div className="p-5 rounded-2xl bg-[#080C14] border border-slate-800 space-y-3 text-xs">
                    <div className="flex justify-between items-center text-slate-300">
                      <span className="font-bold text-white">{features[1].previewContent.file}</span>
                      <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-[10px] font-bold border border-cyan-500/20">
                        {features[1].previewContent.status}
                      </span>
                    </div>
                    <p className="text-[#00B060] font-semibold flex items-center gap-1.5 pt-2">
                      <ShieldCheck className="w-4 h-4" />
                      <span>{features[1].previewContent.verdict}</span>
                    </p>
                  </div>
                )}

                {selectedFeature === 2 && (
                  <div className="p-5 rounded-2xl bg-[#080C14] border border-slate-800 space-y-3 text-xs">
                    <div className="space-y-1">
                      <p className="text-slate-400 font-bold">Machine : <span className="text-white">{features[2].previewContent.machine}</span></p>
                      <p className="text-slate-400 font-bold">Papier & Format : <span className="text-white">{features[2].previewContent.paper}</span></p>
                      <p className="text-slate-400 font-bold">Façonnage : <span className="text-white">{features[2].previewContent.finishing}</span></p>
                    </div>
                    <p className="text-amber-400 font-bold pt-2 border-t border-slate-800">
                      {features[2].previewContent.confidentiality}
                    </p>
                  </div>
                )}

                {selectedFeature === 3 && (
                  <div className="p-5 rounded-2xl bg-[#080C14] border border-slate-800 space-y-3 text-xs">
                    <p className="font-mono text-slate-400">{features[3].previewContent.url}</p>
                    <p className="font-bold text-white">{features[3].previewContent.lead}</p>
                    <button className="px-4 py-2 rounded-full bg-[#00B060] text-white font-bold text-xs shadow-md">
                      {features[3].previewContent.action}
                    </button>
                  </div>
                )}

              </div>
            </div>

          </div>

        </section>

        {/* HOW IT WORKS SECTION */}
        <section id="comment-ca-marche" className="py-24 bg-[#080C14] border-y border-slate-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-16">
            
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <p className="text-[#00B060] text-xs font-bold uppercase tracking-wider">Prise en Main Immédiate</p>
              <h2 className="text-3xl sm:text-5xl font-black font-serif text-white">Opérationnel en 3 étapes simples</h2>
              <p className="text-sm sm:text-base text-slate-400">Aucune formation technique requise. Votre imprimerie est prête en 60 secondes.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              <div className="bg-[#101726] p-8 rounded-3xl border border-slate-800 space-y-4 feature-card-glow text-center">
                <div className="w-14 h-14 bg-[#00B060] text-white rounded-full flex items-center justify-center text-xl font-black mx-auto shadow-lg shadow-[#00B060]/30">1</div>
                <h3 className="text-lg font-bold text-white">Configurez votre Imprimerie</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Créez votre compte gratuit. Saisissez votre logo, votre adresse et vos tarifs habituels pour les papiers et supports.
                </p>
              </div>

              <div className="bg-[#101726] p-8 rounded-3xl border border-slate-800 space-y-4 feature-card-glow text-center">
                <div className="w-14 h-14 bg-[#00B060] text-white rounded-full flex items-center justify-center text-xl font-black mx-auto shadow-lg shadow-[#00B060]/30">2</div>
                <h3 className="text-lg font-bold text-white">Générez vos Devis & BAT</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Calculez les montants HT et TVA 18% en un clic. Faites valider le Bon à Tirer par le client avant le tirage en atelier.
                </p>
              </div>

              <div className="bg-[#101726] p-8 rounded-3xl border border-slate-800 space-y-4 feature-card-glow text-center">
                <div className="w-14 h-14 bg-[#00B060] text-white rounded-full flex items-center justify-center text-xl font-black mx-auto shadow-lg shadow-[#00B060]/30">3</div>
                <h3 className="text-lg font-bold text-white">Livrez & Encaissez en FCFA</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Dès la livraison effectuée, la facture A4 est générée automatiquement. Suivez vos acomptes et règlements en temps réel.
                </p>
              </div>

            </div>

          </div>
        </section>

        {/* TESTIMONIALS SECTION (INFINITE AUTO-SCROLLING MARQUEE ANIMATION) */}
        <section id="temoignages" className="py-24 overflow-hidden relative">
          
          <div className="text-center max-w-3xl mx-auto space-y-3 px-4 mb-16">
            <p className="text-[#00B060] text-xs font-bold uppercase tracking-wider">Preuve Sociale & Avis</p>
            <h2 className="text-3xl sm:text-5xl font-black font-serif text-white">Reconnu par les gérants d'imprimerie en Afrique francophone</h2>
          </div>

          {/* Marquee Container */}
          <div className="relative w-full overflow-hidden py-4">
            
            {/* Fade edges */}
            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#060A10] to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#060A10] to-transparent z-10 pointer-events-none" />

            <div className="animate-marquee gap-6">
              {[...testimonials, ...testimonials].map((t, idx) => (
                <div
                  key={idx}
                  className="w-[380px] bg-[#101726] p-8 rounded-3xl border border-slate-800 space-y-4 shrink-0 hover:border-[#00B060]/50 transition duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full ${t.color} text-white flex items-center justify-center font-bold text-sm shadow-md`}>
                      {t.initials}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{t.name}</h4>
                      <p className="text-[11px] text-slate-400">{t.role} • {t.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-slate-300 italic leading-relaxed">
                    "{t.text}"
                  </p>
                </div>
              ))}
            </div>

          </div>

        </section>

        {/* PRICING SECTION */}
        <section id="tarification" className="py-24 bg-[#080C14] border-t border-slate-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-16">
            
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <p className="text-[#00B060] text-xs font-bold uppercase tracking-wider">Tarification Transparente</p>
              <h2 className="text-3xl sm:text-5xl font-black font-serif text-white">Des formules adaptées à votre croissance</h2>
              <p className="text-sm sm:text-base text-slate-400">Démarrez gratuitement sans carte bancaire, puis évoluez vers nos plans premium.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
              
              {/* Plan Gratuit */}
              <div className="bg-[#101726] p-8 sm:p-10 rounded-3xl border border-slate-800 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <h3 className="text-2xl font-black text-white">Plan Gratuit</h3>
                  <p className="text-xs text-slate-400">Pour tester la puissance de l'outil.</p>
                  <div className="py-2">
                    <span className="text-4xl font-black text-white">0 FCFA</span>
                    <span className="text-xs text-slate-400 font-semibold"> / 7 jours d'essai</span>
                  </div>
                  <ul className="space-y-3 text-xs text-slate-300">
                    <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-[#00B060]" /> 1 seul utilisateur</li>
                    <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-[#00B060]" /> Devis & Factures FCFA</li>
                    <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-[#00B060]" /> TVA 18% automatique</li>
                  </ul>
                </div>
                <Link href="/login" className="w-full text-center bg-slate-800 text-white font-bold text-xs py-4 rounded-full border border-slate-700 hover:bg-slate-700 transition">
                  Commencer
                </Link>
              </div>

              {/* Plan Standard */}
              <div className="bg-[#101726] p-8 sm:p-10 rounded-3xl border border-slate-700 flex flex-col justify-between space-y-6 relative">
                <span className="absolute top-4 right-4 bg-[#00B060]/20 text-[#00B060] border border-[#00B060]/30 text-[10px] font-bold px-3 py-1 rounded-full uppercase">
                  Populaire
                </span>
                <div className="space-y-4">
                  <h3 className="text-2xl font-black text-white">Plan Standard</h3>
                  <p className="text-xs text-slate-400">Pour les ateliers en croissance.</p>
                  <div className="py-2">
                    <span className="text-4xl font-black text-white">{formatFCFA(15000)}</span>
                    <span className="text-xs text-slate-400 font-semibold"> / mois</span>
                  </div>
                  <ul className="space-y-3 text-xs text-slate-300">
                    <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-[#00B060]" /> 2 utilisateurs inclus</li>
                    <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-[#00B060]" /> Toutes les fonctions du gratuit</li>
                    <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-[#00B060]" /> Export PDF personnalisé</li>
                  </ul>
                </div>
                <Link href="/login" className="w-full text-center bg-[#1a3c34] hover:bg-[#00B060] text-white font-bold text-xs py-4 rounded-full transition shadow-md">
                  Choisir Standard
                </Link>
              </div>

              {/* Plan Pro (Highlighted) */}
              <div className="bg-gradient-to-b from-[#1a3c34] via-[#101726] to-[#060A10] p-8 sm:p-10 rounded-3xl border-2 border-[#00B060] flex flex-col justify-between space-y-6 shadow-2xl relative">
                <span className="absolute top-4 right-4 bg-[#00B060] text-white text-[10px] font-black px-3.5 py-1 rounded-full uppercase shadow-md">
                  Recommandé
                </span>
                <div className="space-y-4">
                  <h3 className="text-2xl font-black text-white">Plan Pro</h3>
                  <p className="text-xs text-emerald-200">L'expérience complète sans limites.</p>
                  <div className="py-2">
                    <span className="text-4xl font-black text-white">{formatFCFA(35000)}</span>
                    <span className="text-xs text-emerald-200 font-semibold"> / mois</span>
                  </div>
                  <ul className="space-y-3 text-xs text-emerald-100 font-medium">
                    <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-[#00B060]" /> <strong>Utilisateurs illimités</strong></li>
                    <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-[#00B060]" /> <strong>Boutique en ligne complète</strong></li>
                    <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-[#00B060]" /> <strong>Validation BAT illimitée</strong></li>
                    <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-[#00B060]" /> Notifications de commandes</li>
                  </ul>
                </div>
                <Link href="/login" className="w-full text-center bg-[#00B060] hover:bg-[#009652] text-white font-bold text-xs py-4 rounded-full transition shadow-lg shadow-[#00B060]/30">
                  Passer au Plan Pro
                </Link>
              </div>

            </div>

          </div>
        </section>

        {/* FINAL CTA SECTION */}
        <section className="py-24 relative overflow-hidden text-center">
          <div className="max-w-5xl mx-auto px-4 sm:px-8">
            <div className="p-10 sm:p-16 rounded-3xl bg-gradient-to-r from-[#01261f] via-[#1a3c34] to-[#00B060] text-white space-y-6 shadow-2xl relative border border-[#00B060]/40">
              <h2 className="text-3xl sm:text-5xl font-black font-serif leading-tight">Prêt à transformer votre imprimerie ?</h2>
              <p className="text-sm sm:text-base text-slate-200 max-w-2xl mx-auto">Rejoignez des centaines d'ateliers en Afrique francophone qui ont déjà modernisé leur gestion avec PrintFlow.</p>
              <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/login" className="bg-white text-[#01261f] font-black text-sm px-10 py-4 rounded-full magnetic-btn shadow-xl hover:bg-slate-100 transition">
                  Commencer gratuitement
                </Link>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="bg-[#04060B] border-t border-slate-800/80 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <img src="/Favicon_PrintFlow.png" alt="Print_Flow" className="w-7 h-7 object-contain rounded-lg" />
            <span className="font-bold text-white text-base">Print_Flow</span>
          </div>
          <span>© 2026 Print_Flow. Tous droits réservés.</span>
          <span className="font-bold text-white">Fait avec fierté en Afrique 🌍</span>
        </div>
      </footer>

    </div>
  );
}

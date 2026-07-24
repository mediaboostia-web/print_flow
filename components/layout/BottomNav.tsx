'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  ShoppingBag,
  CreditCard,
  Plus,
  X,
  Users,
  Store,
  FileCheck,
  Truck,
  ShoppingCart,
  History,
  Settings,
  HelpCircle,
} from 'lucide-react';
import { useAppStore } from '@/lib/state/store';

export default function BottomNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const currentProfile = useAppStore((state) => state.getCurrentProfile());
  const currentOrg = useAppStore((state) => state.getCurrentOrg());

  const role = currentProfile?.role || 'commercial';

  // Primary 4 Tabs for Bottom Bar
  const primaryTabs = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Devis', href: '/devis', icon: FileText },
    { name: 'Commandes', href: '/commandes', icon: ShoppingBag },
    { name: 'Factures', href: '/factures', icon: CreditCard, hideForRole: 'chef_atelier' },
  ].filter(t => !t.hideForRole || t.hideForRole !== role);

  // Secondary Modules for Bottom Sheet Drawer
  const secondaryModules = [
    { name: 'Clients', href: '/clients', icon: Users, roleAllowed: true },
    { name: 'Catalogue', href: '/catalogue', icon: Store, roleAllowed: true },
    { name: 'BAT (Proof)', href: '/bat', icon: FileCheck, roleAllowed: true },
    { name: 'Livraisons', href: '/livraisons', icon: Truck, roleAllowed: true },
    { name: 'Commandes en ligne', href: '/commandes-en-ligne', icon: ShoppingCart, roleAllowed: true },
    { name: 'Historique', href: '/historique', icon: History, roleAllowed: true },
    { name: 'Paramètres', href: '/parametres', icon: Settings, roleAllowed: role === 'admin' },
    { name: 'Aide & FAQ', href: '/aide', icon: HelpCircle, roleAllowed: true },
  ].filter(m => m.roleAllowed);

  return (
    <>
      {/* Mobile Fixed Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-bg-card/95 backdrop-blur-md border-t border-border-subtle px-3 py-1.5 flex items-center justify-around shadow-2xl">
        {primaryTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              onClick={() => setIsOpen(false)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all duration-200 text-[10px] font-medium ${
                isActive 
                  ? 'text-brand-primary font-bold bg-brand-primary/10' 
                  : 'text-text-secondary hover:text-text-main'
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-brand-primary' : 'text-text-secondary'}`} />
              <span>{tab.name}</span>
            </Link>
          );
        })}

        {/* Plus (+) Trigger Button for Bottom Sheet */}
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all duration-200 text-[10px] font-medium text-text-secondary hover:text-brand-primary"
        >
          <div className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition">
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="mt-0.5 text-brand-primary font-semibold">Plus</span>
        </button>
      </div>

      {/* Bottom Sheet Drawer Modal */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex flex-col justify-end animate-fade-in">
          {/* Backdrop dismiss */}
          <div className="flex-1" onClick={() => setIsOpen(false)} />

          {/* Drawer Content */}
          <div className="bg-bg-card border-t border-border-subtle rounded-t-3xl p-5 space-y-4 max-h-[85vh] overflow-y-auto animate-slide-up shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-text-main">
                  Tous les modules
                </h3>
                <p className="text-[11px] text-text-secondary">
                  {currentOrg?.name} • {currentProfile?.fullName || 'Utilisateur'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-text-secondary hover:text-text-main flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Grid List of Secondary Modules */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              {secondaryModules.map((module) => {
                const Icon = module.icon;
                const isActive = pathname === module.href;

                return (
                  <Link
                    key={module.href}
                    href={module.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 p-3 rounded-2xl border transition-all duration-150 relative ${
                      isActive
                        ? 'bg-brand-primary/10 border-brand-primary/40 text-brand-primary'
                        : 'bg-bg-base dark:bg-[#0B0F19] border-border-subtle text-text-main hover:border-brand-primary/30'
                    }`}
                  >
                    <div className={`p-2 rounded-xl ${isActive ? 'bg-brand-primary text-white' : 'bg-slate-200/60 dark:bg-slate-800 text-text-secondary'}`}>
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate leading-tight">{module.name}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

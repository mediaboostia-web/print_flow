'use client';

import React, { useState } from 'react';
import {
  History,
  Search,
  FileText,
  ClipboardCheck,
  Receipt,
  Wallet,
  Clock,
  Activity,
  Download
} from 'lucide-react';
import { useAppStore } from '@/lib/state/store';
import { downloadCsv } from '@/lib/utils/csv';

type HistoryFilter = 'all' | 'quotes' | 'bat' | 'invoices' | 'payments';

const filterMeta: Record<Exclude<HistoryFilter, 'all'>, { label: string; kpiLabel: string; icon: typeof FileText; classes: string }> = {
  quotes: { label: 'Devis', kpiLabel: 'Devis livrés', icon: FileText, classes: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20' },
  bat: { label: 'BAT', kpiLabel: 'BAT livrés', icon: ClipboardCheck, classes: 'bg-violet-500/10 text-violet-600 border-violet-500/20' },
  invoices: { label: 'Factures', kpiLabel: 'Factures livrées', icon: Receipt, classes: 'bg-brand-primary/10 text-brand-primary border-brand-primary/20' },
  payments: { label: 'Paiements', kpiLabel: 'Paiements', icon: Wallet, classes: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
};

export default function HistoriquePage() {
  const currentOrgId = useAppStore((state) => state.currentOrgId);
  const auditLogs = useAppStore((state) => state.auditLogs || []);
  const storeQuotes = useAppStore((state) => state.quotes || []);
  const storeBATs = useAppStore((state) => state.bats || []);
  const storeInvoices = useAppStore((state) => state.invoices || []);
  const storePayments = useAppStore((state) => state.payments || []);
  const storeClients = useAppStore((state) => state.clients || []);
  const storePOs = useAppStore((state) => state.pos || []);
  const storeDeliveries = useAppStore((state) => state.deliveries || []);

  const [filter, setFilter] = useState<HistoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Aggregate timeline items dynamically from domain models + audit logs
  interface CombinedTimelineItem {
    id: string;
    entityType: 'quotes' | 'bat' | 'invoices' | 'payments';
    action: string;
    occurredAt: string;
    details?: string;
  }

  const combinedItems: CombinedTimelineItem[] = [];

  // 1. Quotes
  storeQuotes.filter(q => q.organizationId === currentOrgId).forEach(q => {
    const client = storeClients.find(c => c.id === q.clientId);
    const clientName = client?.companyName || 'Client';
    combinedItems.push({
      id: `history-q-${q.id}`,
      entityType: 'quotes',
      action: `Devis ${q.quoteNumber} pour ${clientName} (${q.totalFcfa.toLocaleString()} FCFA)`,
      occurredAt: q.createdAt,
      details: `Statut : ${q.status === 'valide' ? 'Validé' : q.status === 'refuse' ? 'Refusé' : 'En attente'}`
    });
  });

  // 2. BATs
  storeBATs.filter(b => b.organizationId === currentOrgId).forEach(b => {
    const matchingQuote = storeQuotes.find(q => q.id === b.quoteId);
    const quoteRef = matchingQuote ? matchingQuote.quoteNumber : b.id;
    combinedItems.push({
      id: `history-bat-${b.id}`,
      entityType: 'bat',
      action: `BAT pour ${quoteRef} (${(b.versions || []).length} version(s)) — Statut: ${b.status === 'valide' ? 'Approuvé' : b.status === 'refuse' ? 'Refusé' : 'En attente'}`,
      occurredAt: b.updatedAt || b.createdAt,
      details: b.validatedBy ? `Validé par ${b.validatedBy}` : undefined
    });
  });

  // 3. Invoices
  storeInvoices.filter(i => i.organizationId === currentOrgId).forEach(inv => {
    const client = storeClients.find(c => c.id === inv.clientId);
    combinedItems.push({
      id: `history-inv-${inv.id}`,
      entityType: 'invoices',
      action: `Facture ${inv.invoiceNumber} émise pour ${client?.companyName || 'Client'} (${inv.totalFcfa.toLocaleString()} FCFA)`,
      occurredAt: inv.createdAt,
      details: `Payé: ${inv.amountPaidFcfa.toLocaleString()} FCFA / ${inv.totalFcfa.toLocaleString()} FCFA`
    });
  });

  // 4. Payments
  storePayments.forEach(p => {
    const inv = storeInvoices.find(i => i.id === p.invoiceId && i.organizationId === currentOrgId);
    if (!inv) return;
    combinedItems.push({
      id: `history-pay-${p.id}`,
      entityType: 'payments',
      action: `Paiement enregistré de ${p.amountFcfa.toLocaleString()} FCFA via ${p.method}`,
      occurredAt: p.paidAt,
      details: inv ? `Rattaché à la facture ${inv.invoiceNumber}` : undefined
    });
  });

  // 5. Explicit Audit logs
  auditLogs.filter(l => l.organizationId === currentOrgId && ['quotes', 'bat', 'invoices', 'payments'].includes(l.entityType)).forEach(l => {
    if (!combinedItems.some(item => item.id === `log-${l.id}`)) {
      combinedItems.push({
        id: `log-${l.id}`,
        entityType: l.entityType as any,
        action: l.action,
        occurredAt: l.occurredAt
      });
    }
  });

  // Filter & Sort
  const filteredTimeline = combinedItems
    .filter(item => filter === 'all' || item.entityType === filter)
    .filter(item => 
      item.action.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (item.details && item.details.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());

  const countByType = (type: Exclude<HistoryFilter, 'all'>) =>
    combinedItems.filter(item => item.entityType === type).length;

  // KPI cards: only devis/BAT/factures whose linked commande a été déclarée
  // livrée sont comptabilisés — et chaque devis ne compte qu'une fois, même
  // modifié/validé plusieurs fois (contrairement à countByType ci-dessus, qui
  // reflète le flux d'événements brut affiché dans la timeline/les onglets).
  const deliveredQuoteIds = new Set(
    storePOs
      .filter(po => po.organizationId === currentOrgId)
      .filter(po => storeDeliveries.some(d => d.purchaseOrderId === po.id && d.status === 'livre'))
      .map(po => po.quoteId)
  );

  const kpiCounts: Record<Exclude<HistoryFilter, 'all'>, number> = {
    quotes: storeQuotes.filter(q => q.organizationId === currentOrgId && deliveredQuoteIds.has(q.id)).length,
    bat: storeBATs.filter(b => b.organizationId === currentOrgId && deliveredQuoteIds.has(b.quoteId)).length,
    invoices: storeInvoices.filter(i => i.organizationId === currentOrgId && deliveredQuoteIds.has(i.quoteId)).length,
    payments: storePayments.filter(p => storeInvoices.some(i => i.id === p.invoiceId && i.organizationId === currentOrgId)).length,
  };

  const handleExportCsv = () => {
    downloadCsv(
      `historique-print-flow-${new Date().toISOString().slice(0, 10)}.csv`,
      ['Type', 'Description', 'Détails', 'Date'],
      filteredTimeline.map(item => [
        filterMeta[item.entityType]?.label || item.entityType,
        item.action,
        item.details || '',
        new Date(item.occurredAt).toLocaleString('fr-FR'),
      ])
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text-main tracking-tight">Historique</h1>
          <p className="text-text-secondary text-sm mt-0.5">Traçabilité complète des devis, BAT, factures et paiements de votre organisation.</p>
        </div>
        <button
          onClick={handleExportCsv}
          disabled={filteredTimeline.length === 0}
          className="flex items-center justify-center gap-2 text-xs font-bold bg-bg-card border border-border-subtle hover:border-brand-primary/40 text-text-main px-4 py-2.5 rounded-full shadow-premium transition shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          <span>Exporter en CSV</span>
        </button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {(Object.keys(filterMeta) as Exclude<HistoryFilter, 'all'>[]).map((type) => {
          const meta = filterMeta[type];
          const Icon = meta.icon;
          return (
            <div key={type} className="rounded-3xl bg-bg-card border border-border-subtle p-4 sm:p-5 space-y-2 shadow-premium hover:bg-emerald-50/10 dark:hover:bg-emerald-950/5 hover:border-brand-primary/40 dark:hover:border-brand-primary/30 hover:shadow-[0_0_20px_rgba(0,176,96,0.06)] transition min-w-0">
              <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${meta.classes}`}>
                <Icon className="w-4.5 h-4.5" />
              </div>
              <p className="text-2xl font-bold text-text-main truncate">{kpiCounts[type]}</p>
              <p className="text-xs text-text-secondary truncate">{meta.kpiLabel}</p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-bg-card border border-border-subtle p-4 rounded-2xl shadow-premium space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher un événement (devis, client, montant)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-input-bg border border-border-subtle rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-text-main transition"
          />
        </div>
        <div className="flex overflow-x-auto gap-1.5 p-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-border-subtle no-scrollbar whitespace-nowrap w-full">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition shrink-0 ${filter === 'all' ? 'bg-bg-card text-text-main shadow-sm' : 'text-text-secondary hover:text-text-main'}`}
          >
            Tous ({combinedItems.length})
          </button>
          {(Object.keys(filterMeta) as Exclude<HistoryFilter, 'all'>[]).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition shrink-0 ${filter === type ? 'bg-bg-card text-text-main shadow-sm' : 'text-text-secondary hover:text-text-main'}`}
            >
              {filterMeta[type].label} ({countByType(type)})
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-bg-card border border-border-subtle rounded-3xl p-6 shadow-premium">
        {filteredTimeline.length > 0 ? (
          <div className="flow-root">
            <ul className="-mb-8">
              {filteredTimeline.map((item, idx) => {
                const meta = filterMeta[item.entityType];
                const Icon = meta?.icon || Activity;
                return (
                  <li key={item.id}>
                    <div className="relative pb-8">
                      {idx !== filteredTimeline.length - 1 && (
                        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-100 dark:bg-slate-800" aria-hidden="true" />
                      )}
                      <div className="relative flex items-start gap-3">
                        <span className={`h-8 w-8 rounded-full border flex items-center justify-center shrink-0 ${meta?.classes || 'bg-slate-100 text-text-secondary border-border-subtle'}`}>
                          <Icon className="w-4 h-4" />
                        </span>
                        <div className="flex-1 min-w-0 pt-1 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                          <div>
                            <p className="text-xs sm:text-sm text-text-main font-bold break-words">{item.action}</p>
                            {item.details && (
                              <p className="text-[11px] text-text-secondary mt-0.5">{item.details}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-text-secondary shrink-0 whitespace-nowrap">
                            <Clock className="w-3 h-3" />
                            {new Date(item.occurredAt).toLocaleString('fr-FR')}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : (
          <div className="py-16 text-center text-text-secondary font-medium flex flex-col items-center gap-3">
            <History className="w-10 h-10 opacity-40" />
            <span>Aucun événement d'historique à afficher pour le moment.</span>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  mockProfiles,
  mockOrganizations,
  mockClients,
  mockProducts,
  allQuotes,
  allBATs,
  allPOs,
  allInvoices,
  allPayments,
} from '@/lib/mock/data';
import {
  Profile,
  Organization,
  Client,
  Product,
  ProductPriceTier,
  Quote,
  BAT,
  PurchaseOrder,
  Invoice,
  InvoiceStatus,
  Payment,
  PaymentMethod,
  DeliveryNote,
  OnlineOrder,
  AuditLog
} from '@/types/domain';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { isValidEmail } from '@/lib/utils/email';

// Print_Flow is single-tenant: exactly one row exists in `organizations`.
// The public storefront (no authenticated session, so no `current_org_id()`
// to resolve from a profile) needs that row's id — resolve it once and cache
// it in-memory rather than hardcoding an id in source.
let cachedCompanyOrgId: string | null = null;
async function resolveCompanyOrgId(): Promise<string | null> {
  if (cachedCompanyOrgId) return cachedCompanyOrgId;
  if (!isSupabaseConfigured || !supabase) return null;
  const { data } = await supabase.from('organizations').select('id').limit(1).maybeSingle();
  if (data?.id) cachedCompanyOrgId = data.id;
  return cachedCompanyOrgId;
}

// Default configuration details matching parameters
const defaultTaxes = [
  { id: 'tax-1', name: 'TVA Sénégal Standard', rate: 18 },
  { id: 'tax-2', name: 'TVA Exonérée / Export', rate: 0 },
  { id: 'tax-3', name: 'TVA Hors-champ', rate: 0 }
];

const defaultMachines = [
  { id: 'm-1', name: 'Presse Offset Heidelberg Speedmaster', type: 'Offset' },
  { id: 'm-2', name: 'Xerox Versant 180 Press', type: 'Numérique' },
  { id: 'm-3', name: 'Traceur Roland TrueVIS SG2-640', type: 'Grand Format' },
  { id: 'm-4', name: 'Massicot Polar 92 ED', type: 'Finition / Découpe' }
];

const defaultPartners = [
  { id: 'p-1', name: 'Express Plastification Dakar', service: 'Pelliculage & Vernis' },
  { id: 'p-2', name: 'Mali Packaging S.A.', service: 'Façonnage Cartonnage' }
];

const defaultPaperFormats = [
  'A4 (21 x 29.7 cm)',
  'A3 (29.7 x 42 cm)',
  'A5 (14.8 x 21 cm)',
  'A6 (10.5 x 14.8 cm)',
  'Roll-up (85 x 200 cm)',
  'Bâche 2x1m',
  'Carte de visite (8.5 x 5.4 cm)',
  'Enveloppe DL (11 x 22 cm)'
];

export interface OrgStylePreferences {
  themeColor: 'emerald' | 'cyan' | 'violet' | 'amber';
  fontFamily: 'system' | 'serif' | 'mono';
  invoiceTemplate: 'modern' | 'tech' | 'classic';
}

interface AppState {
  // Active Profile & Session State
  currentOrgId: string;
  currentProfileId: string;
  isSidebarCollapsed: boolean;
  theme: 'light' | 'dark';
  activeCurrency: 'FCFA' | 'EUR' | 'USD' | 'MAD' | 'GNF';
  setCurrency: (code: 'FCFA' | 'EUR' | 'USD' | 'MAD' | 'GNF') => void;
  orgStylePreferences: OrgStylePreferences;
  setOrgPreferences: (prefs: Partial<OrgStylePreferences>) => void;

  // Auth — backed by real Supabase Auth (auth.users), sessions live in cookies
  // via lib/supabaseClient.ts's createBrowserClient, not just in this persisted flag.
  isAuthenticated: boolean;
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  checkSession: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;

  // Domain Lists (Reactive Mock DB)
  organizations: Organization[];
  profiles: Profile[];
  clients: Client[];
  products: Product[];
  quotes: Quote[];
  bats: BAT[];
  pos: PurchaseOrder[];
  deliveries: DeliveryNote[];
  invoices: Invoice[];
  payments: Payment[];
  onlineOrders: OnlineOrder[];
  auditLogs: AuditLog[];

  // App Settings
  taxes: { id: string; name: string; rate: number }[];
  machines: { id: string; name: string; type: string }[];
  partners: { id: string; name: string; service: string }[];
  paperFormats: string[];

  // Getters
  getCurrentOrg: () => Organization | undefined;
  getCurrentProfile: () => Profile;
  getOrgProfiles: () => Profile[];

  // Session Actions
  toggleSidebar: () => void;
  toggleTheme: () => void;

  // Domain Actions (CRUD)
  // 1. Clients
  addClient: (client: Omit<Client, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>) => Promise<{ success: boolean; error?: string; client?: Client }>;
  editClient: (client: Client) => void;
  deleteClient: (clientId: string) => void;

  // 1b. Products (Catalogue)
  addProduct: (product: Omit<Product, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>) => Promise<{ success: boolean; error?: string; product?: Product }>;
  editProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;

  // 2. Quotes
  addQuote: (quote: Quote) => void;
  editQuote: (quote: Quote) => void;
  updateQuoteStatus: (quoteId: string, status: Quote['status']) => void;

  // 3. BAT
  addBATVersion: (batId: string, version: any) => void;
  validateBAT: (batId: string, validatedBy: string) => void;
  refuseBAT: (batId: string, reason: string) => void;

  // 4. POs
  addPO: (po: PurchaseOrder) => void;
  editPO: (po: PurchaseOrder) => void;
  deletePO: (poId: string) => void;
  updatePOStatus: (poId: string, status: PurchaseOrder['status']) => void;

  // 5. Deliveries
  addDelivery: (delivery: DeliveryNote) => void;
  updateDeliveryStatus: (deliveryId: string, status: DeliveryNote['status']) => void;

  // 6. Invoices
  addInvoice: (invoice: Invoice) => void;
  updateInvoiceStatus: (invoiceId: string, status: Invoice['status']) => void;
  recordPayment: (invoiceId: string, amountFcfa: number, method: PaymentMethod, note?: string) => void;

  // 7. Config & Org Settings
  updateProfile: (profile: Profile) => void;
  updateOrgDetails: (org: Organization) => void;
  addTax: (tax: { name: string; rate: number }) => void;
  deleteTax: (taxId: string) => void;
  addMachine: (machine: { name: string; type: string }) => void;
  deleteMachine: (machineId: string) => void;
  addPartner: (partner: { name: string; service: string }) => void;
  deletePartner: (partnerId: string) => void;
  addPaperFormat: (fmt: string) => void;
  deletePaperFormat: (fmt: string) => void;

  // Activity log
  addAuditLog: (action: string, options?: { entityType?: string; entityId?: string; metadata?: any } | null, organizationId?: string) => void;

  // Collaborators/Staff CRUD Actions
  addProfile: (profile: Omit<Profile, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'> & { password?: string }) => Promise<{ success: boolean; error?: string }>;
  editProfile: (profile: { id: string; fullName: string; email?: string; phone?: string; role: 'admin' | 'commercial' | 'chef_atelier' }) => Promise<{ success: boolean; error?: string }>;
  deleteProfile: (profileId: string) => void;
  toggleProfileActive: (profileId: string) => void;

  // New Fullstack & Database Sync Actions
  hasLoadedSupabaseData?: boolean;
  isSupabaseLoading?: boolean;
  loadSupabaseData: (force?: boolean) => Promise<void>;
  changePassword: (profileId: string, newPass: string) => Promise<{ success: boolean; error?: string }>;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; error?: string }>;
  confirmPasswordReset: (newPassword: string) => Promise<{ success: boolean; error?: string }>;

  // Public Catalogue & Online Orders
  updateOnlineOrderStatus: (orderId: string, status: OnlineOrder['status']) => void;
  convertOnlineOrderToQuote: (orderId: string) => void;
  fetchPublicCatalogue: () => Promise<{ org: Organization | null; products: Product[] }>;
  submitPublicOrder: (payload: {
    companyName: string;
    contactName?: string;
    phone: string;
    email?: string;
    address?: string;
    notes?: string;
    items: { productId?: string; name: string; materialType?: Product['materialType']; format: string; quantity: number; unitPriceFcfa: number; lineTotalFcfa: number }[];
  }) => Promise<{ success: boolean; orderNumber?: string; error?: string }>;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
  // Defaults
  currentOrgId: '',
  currentProfileId: '',
  isSidebarCollapsed: false,
  theme: 'light',
  activeCurrency: 'FCFA',
  setCurrency: (code) => {
    import('@/lib/utils/money').then(m => m.setActiveCurrency(code));
    set({ activeCurrency: code });
  },
  orgStylePreferences: {
    themeColor: 'emerald',
    fontFamily: 'system',
    invoiceTemplate: 'modern'
  },

  // Auth
  isAuthenticated: false,
  hasHydrated: false,
  setHasHydrated: (value) => set({ hasHydrated: value }),

  checkSession: async () => {
    if (isSupabaseConfigured && supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        let profile = get().profiles.find(p => p.authUserId === user.id);
        if (!profile) {
          const { data: row } = await supabase.from('profiles').select('*').eq('auth_user_id', user.id).maybeSingle();
          if (row) {
            profile = {
              id: row.id,
              organizationId: row.organization_id,
              fullName: row.full_name,
              role: row.role,
              email: row.email,
              phone: row.phone,
              isActive: row.is_active,
              authUserId: row.auth_user_id,
              createdAt: row.created_at,
              updatedAt: row.updated_at
            };
          }
        }

        if (profile && profile.isActive) {
          set({
            isAuthenticated: true,
            currentProfileId: profile.id,
            currentOrgId: profile.organizationId,
          });
          return;
        }
      }
    }

    set({ isAuthenticated: false });
  },

  login: async (email, password) => {
    if (!isValidEmail(email)) {
      return { success: false, error: 'Veuillez saisir une adresse e-mail valide (ex: contact@exemple.com).' };
    }
    const normalizedEmail = email.trim().toLowerCase();

    if (!isSupabaseConfigured || !supabase) {
      return { success: false, error: "Supabase n'est pas configuré." };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });

      if (!data?.user || error) {
        return { success: false, error: 'Adresse e-mail ou mot de passe incorrect.' };
      }

      let profile = get().profiles.find(p => p.authUserId === data.user!.id || p.email?.toLowerCase() === normalizedEmail);

      if (!profile) {
        const { data: row } = await supabase
          .from('profiles')
          .select('*')
          .or(`auth_user_id.eq.${data.user.id},email.eq.${normalizedEmail}`)
          .maybeSingle();

        if (row) {
          if (!row.auth_user_id) {
            await supabase.from('profiles').update({ auth_user_id: data.user.id }).eq('id', row.id);
          }
          profile = {
            id: row.id,
            organizationId: row.organization_id,
            fullName: row.full_name,
            role: row.role,
            email: row.email,
            phone: row.phone,
            isActive: row.is_active,
            authUserId: data.user.id,
            createdAt: row.created_at,
            updatedAt: row.updated_at
          };
          const resolvedProfile = profile;
          set(state => ({ profiles: [...state.profiles.filter(p => p.id !== resolvedProfile.id), resolvedProfile] }));
        }
      }

      if (!profile) {
        await supabase.auth.signOut();
        return { success: false, error: 'Adresse e-mail ou mot de passe incorrect.' };
      }

      if (!profile.isActive) {
        await supabase.auth.signOut();
        return { success: false, error: 'Ce compte a été désactivé. Contactez votre administrateur.' };
      }
      const org = get().organizations.find(o => o.id === profile!.organizationId);
      if (org && org.isActive === false) {
        await supabase.auth.signOut();
        return { success: false, error: 'Cette organisation est suspendue par le Super Administrateur.' };
      }

      set({
        isAuthenticated: true,
        currentProfileId: profile.id,
        currentOrgId: profile.organizationId,
      });
      return { success: true };
    } catch (e: any) {
      console.error("Supabase signIn error:", e);
      return { success: false, error: 'Adresse e-mail ou mot de passe incorrect.' };
    }
  },

  logout: () => {
    set({ isAuthenticated: false });
    if (isSupabaseConfigured && supabase) {
      supabase.auth.signOut().catch(() => {});
    }
  },

  loadSupabaseData: async (force = false) => {
    if (!isSupabaseConfigured || !supabase) return;
    if (!force && get().hasLoadedSupabaseData) return;
    if (get().isSupabaseLoading) return;

    set({ isSupabaseLoading: true });
    const currentOrgId = get().currentOrgId;

    try {
      let orgQuery = supabase.from('organizations').select('*');
      let profileQuery = supabase.from('profiles').select('*');
      let clientQuery = supabase.from('clients').select('*');
      let productQuery = supabase.from('products').select('*');
      let tierQuery = supabase.from('product_price_tiers').select('*');
      let quoteQuery = supabase.from('quotes').select('*');
      let quoteItemQuery = supabase.from('quote_items').select('*');
      let batQuery = supabase.from('bats').select('*');
      let batVersionQuery = supabase.from('bat_versions').select('*');
      let poQuery = supabase.from('purchase_orders').select('*');
      let poItemQuery = supabase.from('purchase_order_items').select('*');
      let deliveryQuery = supabase.from('delivery_notes').select('*');
      let deliveryItemQuery = supabase.from('delivery_note_items').select('*');
      let invoiceQuery = supabase.from('invoices').select('*');
      let invoiceItemQuery = supabase.from('invoice_items').select('*');
      let paymentQuery = supabase.from('payments').select('*');
      let onlineOrderQuery = supabase.from('online_orders').select('*');
      let taxQuery = supabase.from('taxes').select('*');
      let machineQuery = supabase.from('machines').select('*');
      let partnerQuery = supabase.from('partners').select('*');
      let paperFormatQuery = supabase.from('paper_formats').select('*');
      let auditQuery = supabase.from('audit_logs').select('*');

      if (currentOrgId) {
        orgQuery = orgQuery.eq('id', currentOrgId);
        profileQuery = profileQuery.eq('organization_id', currentOrgId);
        clientQuery = clientQuery.eq('organization_id', currentOrgId);
        productQuery = productQuery.eq('organization_id', currentOrgId);
        quoteQuery = quoteQuery.eq('organization_id', currentOrgId);
        batQuery = batQuery.eq('organization_id', currentOrgId);
        poQuery = poQuery.eq('organization_id', currentOrgId);
        deliveryQuery = deliveryQuery.eq('organization_id', currentOrgId);
        invoiceQuery = invoiceQuery.eq('organization_id', currentOrgId);
        onlineOrderQuery = onlineOrderQuery.eq('organization_id', currentOrgId);
        taxQuery = taxQuery.eq('organization_id', currentOrgId);
        machineQuery = machineQuery.eq('organization_id', currentOrgId);
        partnerQuery = partnerQuery.eq('organization_id', currentOrgId);
        paperFormatQuery = paperFormatQuery.eq('organization_id', currentOrgId);
        auditQuery = auditQuery.eq('organization_id', currentOrgId);
      }

      const [
        { data: orgRows },
        { data: profileRows },
        { data: clientRows },
        { data: productRows },
        { data: tierRows },
        { data: quoteRows },
        { data: quoteItemRows },
        { data: batRows },
        { data: batVersionRows },
        { data: poRows },
        { data: poItemRows },
        { data: deliveryRows },
        { data: deliveryItemRows },
        { data: invoiceRows },
        { data: invoiceItemRows },
        { data: paymentRows },
        { data: onlineOrderRows },
        { data: taxRows },
        { data: machineRows },
        { data: partnerRows },
        { data: paperFormatRows },
        { data: auditRows }
      ] = await Promise.all([
        orgQuery, profileQuery, clientQuery, productQuery, tierQuery,
        quoteQuery, quoteItemQuery, batQuery, batVersionQuery, poQuery,
        poItemQuery, deliveryQuery, deliveryItemQuery, invoiceQuery,
        invoiceItemQuery, paymentQuery, onlineOrderQuery, taxQuery,
        machineQuery, partnerQuery, paperFormatQuery, auditQuery
      ]) as any[];

      const updates: Partial<AppState> = {
        hasLoadedSupabaseData: true,
        isSupabaseLoading: false
      };

      if (orgRows) {
        const fetchedOrgs = orgRows.map((o: any) => ({
          id: o.id,
          name: o.name,
          address: o.address || '',
          phone: o.phone || '',
          email: o.email || '',
          isActive: o.is_active !== false,
          createdAt: o.created_at
        }));
        updates.organizations = [
          ...fetchedOrgs,
          ...get().organizations.filter(o => !fetchedOrgs.some((fo: any) => fo.id === o.id))
        ];
      }

      if (profileRows) {
        const fetchedProfiles = profileRows.map((p: any) => ({
          id: p.id,
          organizationId: p.organization_id,
          fullName: p.full_name,
          role: p.role,
          email: p.email,
          phone: p.phone,
          isActive: p.is_active !== false,
          authUserId: p.auth_user_id,
          password: p.password,
          createdAt: p.created_at,
          updatedAt: p.updated_at
        }));
        updates.profiles = [
          ...fetchedProfiles,
          ...get().profiles.filter(p => !fetchedProfiles.some((fp: any) => fp.id === p.id))
        ];
      }

      if (clientRows && clientRows.length > 0) {
        updates.clients = clientRows.map((c: any) => ({
          id: c.id,
          organizationId: c.organization_id,
          companyName: c.company_name,
          contactName: c.contact_name,
          phone: c.phone,
          email: c.email,
          address: c.address,
          createdBy: c.created_by,
          source: c.source || 'interne',
          createdAt: c.created_at,
          updatedAt: c.updated_at
        }));
      }

      if (productRows && productRows.length > 0) {
        updates.products = productRows.map((p: any) => ({
          id: p.id,
          organizationId: p.organization_id,
          name: p.name,
          category: p.category,
          description: p.description,
          materialType: p.material_type || 'papier',
          paperType: p.paper_type,
          grammageG: p.grammage_g,
          format: p.format,
          formatOptions: p.format_options || [],
          finishing: p.finishing,
          photoUrl: p.photo_url,
          unitPriceFcfa: Number(p.unit_price_fcfa),
          vatRate: Number(p.vat_rate),
          isActive: p.is_active !== false,
          priceTiers: (tierRows || [])
            .filter((t: any) => t.product_id === p.id)
            .map((t: any) => ({
              id: t.id,
              productId: t.product_id,
              minQuantity: t.min_quantity,
              maxQuantity: t.max_quantity ?? undefined,
              unitPriceFcfa: Number(t.unit_price_fcfa)
            })),
          createdAt: p.created_at,
          updatedAt: p.updated_at
        }));
      }

      if (quoteRows && quoteRows.length > 0) {
        updates.quotes = quoteRows.map((q: any) => ({
          id: q.id,
          organizationId: q.organization_id,
          quoteNumber: q.quote_number,
          clientId: q.client_id,
          status: q.status,
          subtotalFcfa: Number(q.subtotal_fcfa),
          vatAmountFcfa: Number(q.vat_amount_fcfa),
          marginPercent: q.margin_percent ? Number(q.margin_percent) : undefined,
          totalFcfa: Number(q.total_fcfa),
          notes: q.notes,
          createdBy: q.created_by,
          validatedBy: q.validated_by,
          validatedAt: q.validated_at,
          createdAt: q.created_at,
          updatedAt: q.updated_at,
          items: (quoteItemRows || [])
            .filter((qi: any) => qi.quote_id === q.id)
            .map((qi: any) => ({
              id: qi.id,
              quoteId: qi.quote_id,
              productId: qi.product_id,
              descriptionSnapshot: qi.description_snapshot,
              paperSnapshot: qi.paper_snapshot,
              finishingSnapshot: qi.finishing_snapshot,
              quantity: qi.quantity,
              unitPriceFcfa: Number(qi.unit_price_fcfa),
              vatRate: Number(qi.vat_rate),
              lineTotalFcfa: Number(qi.line_total_fcfa),
              sortOrder: qi.sort_order
            }))
        }));
      }

      if (batRows && batRows.length > 0) {
        updates.bats = batRows.map((b: any) => ({
          id: b.id,
          organizationId: b.organization_id,
          quoteId: b.quote_id,
          status: b.status,
          currentVersionId: b.current_version_id,
          validatedBy: b.validated_by,
          validatedAt: b.validated_at,
          createdAt: b.created_at,
          updatedAt: b.updated_at,
          versions: (batVersionRows || [])
            .filter((bv: any) => bv.bat_id === b.id)
            .map((bv: any) => ({
              id: bv.id,
              batId: bv.bat_id,
              versionNumber: bv.version_number,
              filePath: bv.file_path,
              fileType: bv.file_type,
              comment: bv.comment,
              uploadedBy: bv.uploaded_by,
              uploadedAt: bv.uploaded_at
            }))
        }));
      }

      if (poRows && poRows.length > 0) {
        updates.pos = poRows.map((po: any) => ({
          id: po.id,
          organizationId: po.organization_id,
          orderNumber: po.order_number,
          quoteId: po.quote_id,
          batId: po.bat_id,
          status: po.status,
          machineSetup: po.machine_setup,
          depositAmountFcfa: po.deposit_amount_fcfa ? Number(po.deposit_amount_fcfa) : undefined,
          createdBy: po.created_by,
          createdAt: po.created_at,
          updatedAt: po.updated_at,
          items: (poItemRows || [])
            .filter((poi: any) => poi.purchase_order_id === po.id)
            .map((poi: any) => ({
              id: poi.id,
              purchaseOrderId: poi.purchase_order_id,
              quoteItemId: poi.quote_item_id,
              description: poi.description,
              finishing: poi.finishing,
              quantity: poi.quantity,
              sortOrder: poi.sort_order
            }))
        }));
      }

      if (deliveryRows && deliveryRows.length > 0) {
        updates.deliveries = deliveryRows.map((d: any) => ({
          id: d.id,
          organizationId: d.organization_id,
          deliveryNumber: d.delivery_number,
          purchaseOrderId: d.purchase_order_id,
          status: d.status,
          deliveredTo: d.delivered_to,
          signatureUrl: d.signature_url,
          deliveredAt: d.delivered_at,
          createdBy: d.createdBy,
          createdAt: d.created_at,
          updatedAt: d.updated_at,
          items: (deliveryItemRows || [])
            .filter((di: any) => di.delivery_note_id === d.id)
            .map((di: any) => ({
              id: di.id,
              deliveryNoteId: di.delivery_note_id,
              description: di.description,
              quantityReady: di.quantity_ready
            }))
        }));
      }

      if (invoiceRows && invoiceRows.length > 0) {
        updates.invoices = invoiceRows.map((inv: any) => ({
          id: inv.id,
          organizationId: inv.organization_id,
          invoiceNumber: inv.invoice_number,
          quoteId: inv.quote_id,
          batId: inv.bat_id,
          clientId: inv.client_id,
          status: inv.status,
          subtotalFcfa: Number(inv.subtotal_fcfa),
          vatAmountFcfa: Number(inv.vat_amount_fcfa),
          totalFcfa: Number(inv.total_fcfa),
          amountPaidFcfa: Number(inv.amount_paid_fcfa || 0),
          isDeleted: inv.is_deleted === true,
          deletedReason: inv.deleted_reason,
          deletedBy: inv.deleted_by,
          deletedAt: inv.deleted_at,
          createdBy: inv.created_by,
          createdAt: inv.created_at,
          updatedAt: inv.updated_at,
          items: (invoiceItemRows || [])
            .filter((ivi: any) => ivi.invoice_id === inv.id)
            .map((ivi: any) => ({
              id: ivi.id,
              invoiceId: ivi.invoice_id,
              quoteItemId: ivi.quote_item_id,
              description: ivi.description,
              quantity: ivi.quantity,
              unitPriceFcfa: Number(ivi.unit_price_fcfa),
              vatRate: Number(ivi.vat_rate),
              lineTotalFcfa: Number(ivi.line_total_fcfa)
            }))
        }));
      }

      if (paymentRows && paymentRows.length > 0) {
        updates.payments = paymentRows.map((pay: any) => ({
          id: pay.id,
          invoiceId: pay.invoice_id,
          amountFcfa: Number(pay.amount_fcfa),
          method: pay.method,
          paidAt: pay.paid_at,
          note: pay.note,
          recordedBy: pay.recorded_by,
          isCancelled: pay.is_cancelled === true,
          cancelledReason: pay.cancelled_reason,
          cancelledBy: pay.cancelled_by,
          cancelledAt: pay.cancelled_at,
          createdAt: pay.created_at
        }));
      }

      if (onlineOrderRows && onlineOrderRows.length > 0) {
        updates.onlineOrders = onlineOrderRows.map((o: any) => ({
          id: o.id,
          organizationId: o.organization_id,
          orderNumber: o.order_number,
          clientId: o.client_id,
          status: o.status,
          items: o.items || [],
          subtotalFcfa: Number(o.subtotal_fcfa),
          notes: o.notes,
          createdAt: o.created_at,
          updatedAt: o.updated_at
        }));
      }

      if (taxRows && taxRows.length > 0) {
        updates.taxes = taxRows
          .filter((t: any) => t.organization_id === currentOrgId)
          .map((t: any) => ({ id: t.id, name: t.name, rate: Number(t.rate) }));
      }
      if (machineRows && machineRows.length > 0) {
        updates.machines = machineRows
          .filter((m: any) => m.organization_id === currentOrgId)
          .map((m: any) => ({ id: m.id, name: m.name, type: m.type }));
      }
      if (partnerRows && partnerRows.length > 0) {
        updates.partners = partnerRows
          .filter((p: any) => p.organization_id === currentOrgId)
          .map((p: any) => ({ id: p.id, name: p.name, service: p.service }));
      }
      if (paperFormatRows && paperFormatRows.length > 0) {
        updates.paperFormats = paperFormatRows
          .filter((pf: any) => pf.organization_id === currentOrgId)
          .map((pf: any) => pf.format_name);
      }
      if (auditRows && auditRows.length > 0) {
        updates.auditLogs = auditRows.map((a: any) => ({
          id: a.id,
          organizationId: a.organization_id,
          entityType: a.entity_type,
          entityId: a.entity_id,
          action: a.action,
          actorId: a.actor_id,
          actorRole: a.actor_role,
          occurredAt: a.occurred_at,
          metadata: a.metadata
        }));
      }

      // Ensure all validated quotes have a corresponding invoice in state & DB
      const currentQuotes = updates.quotes || get().quotes;
      const currentInvoices = updates.invoices || get().invoices;
      const validatedNeedingInvoice = currentQuotes.filter(q =>
        q.status === 'valide' && !currentInvoices.some(inv => inv.quoteId === q.id && !inv.isDeleted)
      );

      if (validatedNeedingInvoice.length > 0) {
        const autoInvoices: Invoice[] = [];
        validatedNeedingInvoice.forEach((quote, idx) => {
          const invId = `inv-auto-${Date.now()}-${idx}`;
          const newInv: Invoice = {
            id: invId,
            organizationId: quote.organizationId,
            invoiceNumber: `FAC-2026-0${currentInvoices.length + autoInvoices.length + 1}`,
            quoteId: quote.id,
            batId: 'direct-po',
            clientId: quote.clientId,
            status: 'en_attente_acompte',
            subtotalFcfa: quote.subtotalFcfa,
            vatAmountFcfa: quote.vatAmountFcfa,
            totalFcfa: quote.totalFcfa,
            amountPaidFcfa: 0,
            isDeleted: false,
            createdBy: quote.createdBy || 'Système',
            createdAt: quote.validatedAt || quote.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            items: (quote.items || []).map((item, itemIdx) => ({
              id: `invi-${Date.now()}-${idx}-${itemIdx}`,
              invoiceId: invId,
              quoteItemId: item.id,
              description: item.descriptionSnapshot,
              quantity: item.quantity,
              unitPriceFcfa: item.unitPriceFcfa,
              vatRate: item.vatRate,
              lineTotalFcfa: item.lineTotalFcfa
            }))
          };
          autoInvoices.push(newInv);

          if (isSupabaseConfigured && supabase) {
            supabase.from('invoices').insert([{
              id: newInv.id,
              organization_id: newInv.organizationId,
              invoice_number: newInv.invoiceNumber,
              quote_id: newInv.quoteId,
              bat_id: newInv.batId,
              client_id: newInv.clientId,
              status: newInv.status,
              subtotal_fcfa: newInv.subtotalFcfa,
              vat_amount_fcfa: newInv.vatAmountFcfa,
              total_fcfa: newInv.totalFcfa,
              amount_paid_fcfa: newInv.amountPaidFcfa,
              is_deleted: false,
              created_by: newInv.createdBy,
              created_at: newInv.createdAt,
              updated_at: newInv.updatedAt
            }]).then(({ error }: any) => {
              if (error) {
                console.error("Error inserting auto invoice to Supabase:", error);
              } else if (newInv.items && newInv.items.length > 0) {
                supabase.from('invoice_items').insert(newInv.items.map(item => ({
                  id: item.id,
                  invoice_id: item.invoiceId,
                  quote_item_id: item.quoteItemId,
                  description: item.description,
                  quantity: item.quantity,
                  unit_price_fcfa: item.unitPriceFcfa,
                  vat_rate: item.vatRate,
                  line_total_fcfa: item.lineTotalFcfa
                }))).then(({ error: itemsError }: any) => {
                  if (itemsError) console.error("Error inserting auto invoice items:", itemsError);
                });
              }
            });
          }
        });
        updates.invoices = [...autoInvoices, ...currentInvoices];
      }

      set(updates);
    } catch (e) {
      console.error("Error in loadSupabaseData:", e);
    }
  },

  organizations: mockOrganizations.map(o => ({
    ...o,
    isActive: true,
  })),
  profiles: mockProfiles.map(p => ({
    ...p,
    password: p.id === 'user-sud-admin' ? 'sudprint2026' : p.id === 'user-sahel-admin' ? 'sahel2026' : 'collaborateur2026'
  })),
  clients: mockClients,
  products: mockProducts,
  quotes: allQuotes,
  bats: allBATs,
  pos: allPOs,
  deliveries: [], // Empty initially
  invoices: allInvoices,
  payments: allPayments,
  onlineOrders: [],
  auditLogs: [
    { id: 'log-1', organizationId: 'system', entityType: 'system', entityId: 'sys', action: 'Initialisation de la plateforme Print_Flow', occurredAt: '2026-07-15T08:00:00Z' },
  ],

  taxes: defaultTaxes,
  machines: defaultMachines,
  partners: defaultPartners,
  paperFormats: defaultPaperFormats,

  // Getters
  getCurrentOrg: () => {
    const { currentOrgId, organizations } = get();
    return organizations.find(org => org.id === currentOrgId);
  },

  getCurrentProfile: () => {
    const { currentProfileId, profiles } = get();
    return profiles.find(profile => profile.id === currentProfileId) || profiles[0];
  },

  getOrgProfiles: () => {
    const { currentOrgId, profiles } = get();
    return profiles.filter(profile => profile.organizationId === currentOrgId);
  },

  // Actions
  toggleSidebar: () => {
    set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed }));
  },

  toggleTheme: () => {
    const nextTheme = get().theme === 'light' ? 'dark' : 'light';
    set({ theme: nextTheme });
    
    if (typeof window !== 'undefined') {
      if (nextTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  },

  // Clients Actions
  addClient: async (clientData) => {
    const newClient: Client = {
      ...clientData,
      id: `client-${Date.now()}`,
      organizationId: get().currentOrgId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    set(state => ({ clients: [newClient, ...state.clients] }));

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('clients').insert([{
        id: newClient.id,
        organization_id: newClient.organizationId,
        company_name: newClient.companyName,
        contact_name: newClient.contactName,
        phone: newClient.phone,
        email: newClient.email,
        address: newClient.address,
        created_by: newClient.createdBy,
        created_at: newClient.createdAt,
        updated_at: newClient.updatedAt
      }]);

      if (error) {
        console.error("Error adding client to Supabase:", error);
        set(state => ({ clients: state.clients.filter(c => c.id !== newClient.id) }));
        return { success: false, error: error.message };
      }
    }

    return { success: true, client: newClient };
  },

  editClient: (updatedClient) => {
    set(state => ({
      clients: state.clients.map(c => c.id === updatedClient.id ? updatedClient : c)
    }));

    if (isSupabaseConfigured && supabase) {
      supabase.from('clients').update({
        company_name: updatedClient.companyName,
        contact_name: updatedClient.contactName,
        phone: updatedClient.phone,
        email: updatedClient.email,
        address: updatedClient.address,
        updated_at: new Date().toISOString()
      }).eq('id', updatedClient.id).then(({ error }: any) => {
        if (error) console.error("Error editing client in Supabase:", error);
      });
    }
  },

  deleteClient: (clientId) => {
    set(state => ({
      clients: state.clients.filter(c => c.id !== clientId)
    }));

    if (isSupabaseConfigured && supabase) {
      supabase.from('clients').delete().eq('id', clientId).then(({ error }: any) => {
        if (error) console.error("Error deleting client in Supabase:", error);
      });
    }
  },

  // Products (Catalogue) Actions
  addProduct: async (productData) => {
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
      organizationId: get().currentOrgId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    set(state => ({ products: [newProduct, ...state.products] }));

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('products').insert([{
        id: newProduct.id,
        organization_id: newProduct.organizationId,
        name: newProduct.name,
        category: newProduct.category,
        description: newProduct.description,
        material_type: newProduct.materialType || 'papier',
        paper_type: newProduct.paperType,
        grammage_g: newProduct.grammageG,
        format: newProduct.format,
        format_options: newProduct.formatOptions || [],
        finishing: newProduct.finishing,
        photo_url: newProduct.photoUrl,
        unit_price_fcfa: newProduct.unitPriceFcfa,
        vat_rate: newProduct.vatRate,
        is_active: newProduct.isActive,
        created_at: newProduct.createdAt,
        updated_at: newProduct.updatedAt
      }]);

      if (error) {
        console.error("Error adding product to Supabase:", error);
        set(state => ({ products: state.products.filter(p => p.id !== newProduct.id) }));
        return { success: false, error: error.message };
      }

      if (newProduct.priceTiers && newProduct.priceTiers.length > 0) {
        const { error: tierError } = await supabase.from('product_price_tiers').insert(newProduct.priceTiers.map(t => ({
          id: t.id,
          product_id: newProduct.id,
          min_quantity: t.minQuantity,
          max_quantity: t.maxQuantity,
          unit_price_fcfa: t.unitPriceFcfa
        })));
        if (tierError) console.error("Error adding price tiers to Supabase:", tierError);
      }
    }

    return { success: true, product: newProduct };
  },

  editProduct: (updatedProduct) => {
    set(state => ({
      products: state.products.map(p => p.id === updatedProduct.id ? { ...updatedProduct, updatedAt: new Date().toISOString() } : p)
    }));

    if (isSupabaseConfigured && supabase) {
      supabase.from('products').update({
        name: updatedProduct.name,
        category: updatedProduct.category,
        description: updatedProduct.description,
        material_type: updatedProduct.materialType || 'papier',
        paper_type: updatedProduct.paperType,
        grammage_g: updatedProduct.grammageG,
        format: updatedProduct.format,
        format_options: updatedProduct.formatOptions || [],
        finishing: updatedProduct.finishing,
        photo_url: updatedProduct.photoUrl,
        unit_price_fcfa: updatedProduct.unitPriceFcfa,
        vat_rate: updatedProduct.vatRate,
        is_active: updatedProduct.isActive,
        updated_at: new Date().toISOString()
      }).eq('id', updatedProduct.id).then(({ error }: any) => {
        if (error) console.error("Error editing product in Supabase:", error);
      });
    }
  },

  deleteProduct: (productId) => {
    set(state => ({
      products: state.products.filter(p => p.id !== productId)
    }));

    if (isSupabaseConfigured && supabase) {
      supabase.from('products').delete().eq('id', productId).then(({ error }: any) => {
        if (error) console.error("Error deleting product in Supabase:", error);
      });
    }
  },

  // Quotes Actions
  addQuote: (newQuote) => {
    set(state => ({ quotes: [newQuote, ...state.quotes] }));
    get().addAuditLog(`Devis ${newQuote.quoteNumber} créé (${newQuote.totalFcfa.toLocaleString()} FCFA)`, { entityType: 'quotes', entityId: newQuote.id }, newQuote.organizationId);

    if (isSupabaseConfigured && supabase) {
      supabase.from('quotes').insert([{
        id: newQuote.id,
        organization_id: newQuote.organizationId,
        quote_number: newQuote.quoteNumber,
        client_id: newQuote.clientId,
        status: newQuote.status,
        subtotal_fcfa: newQuote.subtotalFcfa,
        vat_amount_fcfa: newQuote.vatAmountFcfa,
        margin_percent: newQuote.marginPercent,
        total_fcfa: newQuote.totalFcfa,
        notes: newQuote.notes,
        created_by: newQuote.createdBy,
        validated_by: newQuote.validatedBy,
        validated_at: newQuote.validatedAt,
        created_at: newQuote.createdAt,
        updated_at: newQuote.updatedAt
      }]).then(({ error }: any) => {
        if (error) {
          console.error("Error adding quote to Supabase:", error);
          return;
        }
        // Insert Quote Items
        if (newQuote.items && newQuote.items.length > 0) {
          const dbItems = newQuote.items.map(item => ({
            id: item.id,
            quote_id: item.quoteId,
            product_id: item.productId,
            description_snapshot: item.descriptionSnapshot,
            paper_snapshot: item.paperSnapshot,
            finishing_snapshot: item.finishingSnapshot,
            quantity: item.quantity,
            unit_price_fcfa: item.unitPriceFcfa,
            vat_rate: item.vatRate,
            line_total_fcfa: item.lineTotalFcfa,
            sort_order: item.sortOrder
          }));
          supabase.from('quote_items').insert(dbItems).then(({ error: itemsError }: any) => {
            if (itemsError) console.error("Error adding quote items to Supabase:", itemsError);
          });
        }
      });
    }
  },

  editQuote: (updatedQuote) => {
    set(state => ({
      quotes: state.quotes.map(q => q.id === updatedQuote.id ? updatedQuote : q)
    }));

    if (isSupabaseConfigured && supabase) {
      supabase.from('quotes').update({
        client_id: updatedQuote.clientId,
        status: updatedQuote.status,
        subtotal_fcfa: updatedQuote.subtotalFcfa,
        vat_amount_fcfa: updatedQuote.vatAmountFcfa,
        margin_percent: updatedQuote.marginPercent,
        total_fcfa: updatedQuote.totalFcfa,
        notes: updatedQuote.notes,
        validated_by: updatedQuote.validatedBy,
        validated_at: updatedQuote.validatedAt,
        updated_at: new Date().toISOString()
      }).eq('id', updatedQuote.id).then(({ error }: any) => {
        if (error) {
          console.error("Error updating quote in Supabase:", error);
          return;
        }
        // Delete old items and insert new ones
        supabase.from('quote_items').delete().eq('quote_id', updatedQuote.id).then(() => {
          if (updatedQuote.items && updatedQuote.items.length > 0) {
            const dbItems = updatedQuote.items.map(item => ({
              id: item.id,
              quote_id: item.quoteId,
              product_id: item.productId,
              description_snapshot: item.descriptionSnapshot,
              paper_snapshot: item.paperSnapshot,
              finishing_snapshot: item.finishingSnapshot,
              quantity: item.quantity,
              unit_price_fcfa: item.unitPriceFcfa,
              vat_rate: item.vatRate,
              line_total_fcfa: item.lineTotalFcfa,
              sort_order: item.sortOrder
            }));
            supabase.from('quote_items').insert(dbItems).then(({ error: itemsError }: any) => {
              if (itemsError) console.error("Error adding quote items in editQuote:", itemsError);
            });
          }
        });
      });
    }
  },

  updateQuoteStatus: (quoteId, status) => {
    const targetQuote = get().quotes.find(q => q.id === quoteId);
    set(state => {
      const updatedQuotes = state.quotes.map(q => q.id === quoteId ? { ...q, status, updatedAt: new Date().toISOString() } : q);
      let updatedInvoices = state.invoices;

      if (status === 'valide' && targetQuote) {
        const invoiceExists = state.invoices.some(inv => inv.quoteId === quoteId && !inv.isDeleted);
        if (!invoiceExists) {
          const invId = `inv-${Date.now()}`;
          const newInvoice: Invoice = {
            id: invId,
            organizationId: targetQuote.organizationId,
            invoiceNumber: `FAC-2026-0${state.invoices.length + 1}`,
            quoteId: targetQuote.id,
            batId: 'direct-po',
            clientId: targetQuote.clientId,
            status: 'en_attente_acompte',
            subtotalFcfa: targetQuote.subtotalFcfa,
            vatAmountFcfa: targetQuote.vatAmountFcfa,
            totalFcfa: targetQuote.totalFcfa,
            amountPaidFcfa: 0,
            isDeleted: false,
            createdBy: targetQuote.createdBy || 'Système',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            items: (targetQuote.items || []).map((item, idx) => ({
              id: `invi-${Date.now()}-${idx}`,
              invoiceId: invId,
              quoteItemId: item.id,
              description: item.descriptionSnapshot,
              quantity: item.quantity,
              unitPriceFcfa: item.unitPriceFcfa,
              vatRate: item.vatRate,
              lineTotalFcfa: item.lineTotalFcfa
            }))
          };
          updatedInvoices = [newInvoice, ...state.invoices];

          if (isSupabaseConfigured && supabase) {
            supabase.from('invoices').insert([{
              id: newInvoice.id,
              organization_id: newInvoice.organizationId,
              invoice_number: newInvoice.invoiceNumber,
              quote_id: newInvoice.quoteId,
              bat_id: newInvoice.batId,
              client_id: newInvoice.clientId,
              status: newInvoice.status,
              subtotal_fcfa: newInvoice.subtotalFcfa,
              vat_amount_fcfa: newInvoice.vatAmountFcfa,
              total_fcfa: newInvoice.totalFcfa,
              amount_paid_fcfa: newInvoice.amountPaidFcfa,
              is_deleted: false,
              created_by: newInvoice.createdBy,
              created_at: newInvoice.createdAt,
              updated_at: newInvoice.updatedAt
            }]).then(({ error }: any) => {
              if (error) {
                console.error("Error inserting invoice into Supabase:", error);
              } else if (newInvoice.items && newInvoice.items.length > 0) {
                supabase.from('invoice_items').insert(newInvoice.items.map(item => ({
                  id: item.id,
                  invoice_id: item.invoiceId,
                  quote_item_id: item.quoteItemId,
                  description: item.description,
                  quantity: item.quantity,
                  unit_price_fcfa: item.unitPriceFcfa,
                  vat_rate: item.vatRate,
                  line_total_fcfa: item.lineTotalFcfa
                }))).then(({ error: itemsError }: any) => {
                  if (itemsError) console.error("Error inserting invoice items:", itemsError);
                });
              }
            });
          }
        }
      }

      return { quotes: updatedQuotes, invoices: updatedInvoices };
    });

    if (targetQuote) {
      const statusLabel = status === 'valide' ? 'validé' : status === 'refuse' ? 'refusé' : 'remis en attente';
      get().addAuditLog(`Devis ${targetQuote.quoteNumber} ${statusLabel}`, { entityType: 'quotes', entityId: quoteId }, targetQuote.organizationId);
    }

    if (isSupabaseConfigured && supabase) {
      supabase.from('quotes').update({
        status,
        updated_at: new Date().toISOString()
      }).eq('id', quoteId).then(({ error }: any) => {
        if (error) console.error("Error updating quote status in Supabase:", error);
      });
    }
  },

  // BAT Actions
  addBATVersion: (batId, version) => {
    set(state => ({
      bats: state.bats.map(b => {
        if (b.id === batId) {
          const versions = b.versions || [];
          const updatedVersions = [...versions, version];
          return {
            ...b,
            versions: updatedVersions,
            currentVersionId: version.id,
            status: 'soumis',
            updatedAt: new Date().toISOString()
          };
        }
        return b;
      })
    }));

    if (isSupabaseConfigured && supabase) {
      supabase.from('bat_versions').insert([{
        id: version.id,
        bat_id: version.batId,
        version_number: version.versionNumber,
        file_path: version.filePath,
        file_type: version.fileType,
        comment: version.comment,
        uploaded_by: version.uploadedBy,
        uploaded_at: version.uploadedAt
      }]).then(({ error }: any) => {
        if (error) console.error("Error adding BAT version to Supabase:", error);
      });

      supabase.from('bats').update({
        current_version_id: version.id,
        status: 'soumis',
        updated_at: new Date().toISOString()
      }).eq('id', batId).then(({ error }: any) => {
        if (error) console.error("Error updating BAT in Supabase:", error);
      });
    }
  },

  validateBAT: (batId, validatedBy) => {
    set(state => {
      const updatedBats = state.bats.map(b => {
        if (b.id === batId) {
          return {
            ...b,
            status: 'valide' as const,
            validatedBy,
            validatedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
        }
        return b;
      });

      // Find the quote associated with this BAT and automatically validate it as well
      const targetBAT = state.bats.find(b => b.id === batId);
      const targetQuote = targetBAT ? state.quotes.find(q => q.id === targetBAT.quoteId) : null;
      const updatedQuotes = targetQuote
        ? state.quotes.map(q => q.id === targetQuote.id ? { ...q, status: 'valide' as const, updatedAt: new Date().toISOString() } : q)
        : state.quotes;

      let updatedInvoices = state.invoices;

      if (targetQuote) {
        const invoiceExists = state.invoices.some(inv => inv.quoteId === targetQuote.id && !inv.isDeleted);
        if (!invoiceExists) {
          const invId = `inv-${Date.now()}`;
          const newInvoice: Invoice = {
            id: invId,
            organizationId: targetQuote.organizationId,
            invoiceNumber: `FAC-2026-0${state.invoices.length + 1}`,
            quoteId: targetQuote.id,
            batId: batId,
            clientId: targetQuote.clientId,
            status: 'en_attente_acompte',
            subtotalFcfa: targetQuote.subtotalFcfa,
            vatAmountFcfa: targetQuote.vatAmountFcfa,
            totalFcfa: targetQuote.totalFcfa,
            amountPaidFcfa: 0,
            isDeleted: false,
            createdBy: targetQuote.createdBy || 'Système',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            items: (targetQuote.items || []).map((item, idx) => ({
              id: `invi-${Date.now()}-${idx}`,
              invoiceId: invId,
              quoteItemId: item.id,
              description: item.descriptionSnapshot,
              quantity: item.quantity,
              unitPriceFcfa: item.unitPriceFcfa,
              vatRate: item.vatRate,
              lineTotalFcfa: item.lineTotalFcfa
            }))
          };
          updatedInvoices = [newInvoice, ...state.invoices];

          if (isSupabaseConfigured && supabase) {
            supabase.from('invoices').insert([{
              id: newInvoice.id,
              organization_id: newInvoice.organizationId,
              invoice_number: newInvoice.invoiceNumber,
              quote_id: newInvoice.quoteId,
              bat_id: newInvoice.batId,
              client_id: newInvoice.clientId,
              status: newInvoice.status,
              subtotal_fcfa: newInvoice.subtotalFcfa,
              vat_amount_fcfa: newInvoice.vatAmountFcfa,
              total_fcfa: newInvoice.totalFcfa,
              amount_paid_fcfa: newInvoice.amountPaidFcfa,
              is_deleted: false,
              created_by: newInvoice.createdBy,
              created_at: newInvoice.createdAt,
              updated_at: newInvoice.updatedAt
            }]).then(({ error }: any) => {
              if (error) {
                console.error("Error inserting invoice into Supabase:", error);
              } else if (newInvoice.items && newInvoice.items.length > 0) {
                supabase.from('invoice_items').insert(newInvoice.items.map(item => ({
                  id: item.id,
                  invoice_id: item.invoiceId,
                  quote_item_id: item.quoteItemId,
                  description: item.description,
                  quantity: item.quantity,
                  unit_price_fcfa: item.unitPriceFcfa,
                  vat_rate: item.vatRate,
                  line_total_fcfa: item.lineTotalFcfa
                }))).then(({ error: itemsError }: any) => {
                  if (itemsError) console.error("Error inserting invoice items:", itemsError);
                });
              }
            });
          }
        }
      }

      return { bats: updatedBats, quotes: updatedQuotes, invoices: updatedInvoices };
    });

    const targetBAT = get().bats.find(b => b.id === batId);
    if (targetBAT) {
      get().addAuditLog(`BAT validé par ${validatedBy}`, { entityType: 'bat', entityId: batId }, targetBAT.organizationId);
    }

    if (isSupabaseConfigured && supabase) {
      const validatedAt = new Date().toISOString();
      supabase.from('bats').update({
        status: 'valide',
        validated_by: validatedBy,
        validated_at: validatedAt,
        updated_at: validatedAt
      }).eq('id', batId).then(({ error }: any) => {
        if (error) console.error("Error validating BAT in Supabase:", error);
      });

      if (targetBAT) {
        supabase.from('quotes').update({ status: 'valide', updated_at: validatedAt }).eq('id', targetBAT.quoteId).then(({ error }: any) => {
          if (error) console.error("Error auto-validating quote in Supabase:", error);
        });
      }
    }
  },

  refuseBAT: (batId, reason) => {
    let updatedComment: string | undefined;

    set(state => ({
      bats: state.bats.map(b => {
        if (b.id === batId) {
          const versions = b.versions || [];
          const lastVersion = versions[versions.length - 1];
          if (lastVersion) {
            lastVersion.comment = `🔴 CORRECTION DEMANDÉE: ${reason} (Original: ${lastVersion.comment || ''})`;
            updatedComment = lastVersion.comment;
          }
          return {
            ...b,
            status: 'refuse' as const,
            updatedAt: new Date().toISOString()
          };
        }
        return b;
      })
    }));

    if (isSupabaseConfigured && supabase) {
      const updatedAt = new Date().toISOString();
      supabase.from('bats').update({ status: 'refuse', updated_at: updatedAt }).eq('id', batId).then(({ error }: any) => {
        if (error) console.error("Error refusing BAT in Supabase:", error);
      });

      const targetBAT = get().bats.find(b => b.id === batId);
      const lastVersion = targetBAT?.versions?.[targetBAT.versions.length - 1];
      if (lastVersion && updatedComment) {
        supabase.from('bat_versions').update({ comment: updatedComment }).eq('id', lastVersion.id).then(({ error }: any) => {
          if (error) console.error("Error updating BAT version comment in Supabase:", error);
        });
      }
    }

    const targetBAT = get().bats.find(b => b.id === batId);
    if (targetBAT) {
      get().addAuditLog(`BAT refusé : ${reason}`, { entityType: 'bat', entityId: batId }, targetBAT.organizationId);
    }
  },

  // POs (Orders) Actions
  addPO: (newPO) => {
    set(state => {
      let updatedInvoices = state.invoices;

      if (newPO.depositAmountFcfa && newPO.depositAmountFcfa > 0) {
        const linkedInvoice = state.invoices.find(inv => inv.quoteId === newPO.quoteId && !inv.isDeleted);
        if (linkedInvoice) {
          const newAmountPaid = Math.min(linkedInvoice.totalFcfa, (linkedInvoice.amountPaidFcfa || 0) + newPO.depositAmountFcfa);
          const newStatus: InvoiceStatus = newAmountPaid >= linkedInvoice.totalFcfa ? 'soldee' : 'partiellement_payee';
          updatedInvoices = state.invoices.map(inv => inv.id === linkedInvoice.id ? {
            ...inv,
            amountPaidFcfa: newAmountPaid,
            status: newStatus,
            updatedAt: new Date().toISOString()
          } : inv);

          if (isSupabaseConfigured && supabase) {
            supabase.from('invoices').update({
              amount_paid_fcfa: newAmountPaid,
              status: newStatus,
              updated_at: new Date().toISOString()
            }).eq('id', linkedInvoice.id).then(({ error }: any) => {
              if (error) console.error("Error updating invoice deposit in Supabase:", error);
            });
          }
        }
      }

      return { pos: [newPO, ...state.pos], invoices: updatedInvoices };
    });

    if (isSupabaseConfigured && supabase) {
      supabase.from('purchase_orders').insert([{
        id: newPO.id,
        organization_id: newPO.organizationId,
        order_number: newPO.orderNumber,
        quote_id: newPO.quoteId,
        bat_id: newPO.batId,
        status: newPO.status,
        machine_setup: newPO.machineSetup,
        deposit_amount_fcfa: newPO.depositAmountFcfa,
        created_by: newPO.createdBy,
        created_at: newPO.createdAt,
        updated_at: newPO.updatedAt
      }]).then(({ error }: any) => {
        if (error) {
          console.error("Error adding purchase order to Supabase:", error);
          return;
        }
        if (newPO.items && newPO.items.length > 0) {
          supabase.from('purchase_order_items').insert(newPO.items.map(item => ({
            id: item.id,
            purchase_order_id: item.purchaseOrderId,
            quote_item_id: item.quoteItemId,
            description: item.description,
            finishing: item.finishing,
            quantity: item.quantity,
            sort_order: item.sortOrder
          }))).then(({ error: itemsError }: any) => {
            if (itemsError) console.error("Error adding purchase order items to Supabase:", itemsError);
          });
        }
      });
    }
  },

  editPO: (updatedPO) => {
    set(state => ({
      pos: state.pos.map(p => p.id === updatedPO.id ? { ...updatedPO, updatedAt: new Date().toISOString() } : p)
    }));

    if (isSupabaseConfigured && supabase) {
      supabase.from('purchase_orders').update({
        status: updatedPO.status,
        machine_setup: updatedPO.machineSetup,
        deposit_amount_fcfa: updatedPO.depositAmountFcfa,
        updated_at: new Date().toISOString()
      }).eq('id', updatedPO.id).then(({ error }: any) => {
        if (error) console.error("Error editing purchase order in Supabase:", error);
      });
    }
  },

  deletePO: (poId) => {
    set(state => ({ pos: state.pos.filter(p => p.id !== poId) }));

    if (isSupabaseConfigured && supabase) {
      supabase.from('purchase_orders').delete().eq('id', poId).then(({ error }: any) => {
        if (error) console.error("Error deleting purchase order in Supabase:", error);
      });
    }
  },

  updatePOStatus: (poId, status) => {
    set(state => ({
      pos: state.pos.map(p => p.id === poId ? { ...p, status, updatedAt: new Date().toISOString() } : p)
    }));

    if (isSupabaseConfigured && supabase) {
      supabase.from('purchase_orders').update({ status, updated_at: new Date().toISOString() }).eq('id', poId).then(({ error }: any) => {
        if (error) console.error("Error updating purchase order status in Supabase:", error);
      });
    }
  },

  // Deliveries Actions
  addDelivery: (newDelivery) => {
    set(state => {
      // Find the linked PO and update status to complete if not already
      const linkedPO = state.pos.find(p => p.id === newDelivery.purchaseOrderId);
      const updatedPOs = linkedPO
        ? state.pos.map(p => p.id === linkedPO.id ? { ...p, status: 'termine' as const, updatedAt: new Date().toISOString() } : p)
        : state.pos;

      return {
        deliveries: [newDelivery, ...state.deliveries],
        pos: updatedPOs
      };
    });

    if (isSupabaseConfigured && supabase) {
      supabase.from('delivery_notes').insert([{
        id: newDelivery.id,
        organization_id: newDelivery.organizationId,
        delivery_number: newDelivery.deliveryNumber,
        purchase_order_id: newDelivery.purchaseOrderId,
        status: newDelivery.status,
        delivered_to: newDelivery.deliveredTo,
        signature_url: newDelivery.signatureUrl,
        delivered_at: newDelivery.deliveredAt,
        created_by: newDelivery.createdBy,
        created_at: newDelivery.createdAt
      }]).then(({ error }: any) => {
        if (error) {
          console.error("Error adding delivery note to Supabase:", error);
          return;
        }
        if (newDelivery.items && newDelivery.items.length > 0) {
          supabase.from('delivery_note_items').insert(newDelivery.items.map(item => ({
            id: item.id,
            delivery_note_id: item.deliveryNoteId,
            description: item.description,
            quantity_ready: item.quantityReady
          }))).then(({ error: itemsError }: any) => {
            if (itemsError) console.error("Error adding delivery note items to Supabase:", itemsError);
          });
        }
      });

      const linkedPO = get().pos.find(p => p.id === newDelivery.purchaseOrderId);
      if (linkedPO) {
        supabase.from('purchase_orders').update({ status: 'termine', updated_at: new Date().toISOString() }).eq('id', linkedPO.id).then(({ error }: any) => {
          if (error) console.error("Error completing purchase order in Supabase:", error);
        });
      }
    }
  },

  updateDeliveryStatus: (deliveryId, status) => {
    let generatedInvoice: Invoice | null = null;

    set(state => {
      const deliveredAt = status === 'livre' ? new Date().toISOString() : undefined;
      const updatedDeliveries = state.deliveries.map(d =>
        d.id === deliveryId
          ? { ...d, status, deliveredAt }
          : d
      );

      // Dynamically auto-generate an invoice if status turns to "livre"
      const targetDelivery = state.deliveries.find(d => d.id === deliveryId);
      const invoiceExists = targetDelivery
        ? state.invoices.some(inv => inv.quoteId === targetDelivery.purchaseOrderId)
        : false;

      let updatedInvoices = state.invoices;

      if (status === 'livre' && targetDelivery && !invoiceExists) {
        // Retrieve linked PO and Devis
        const linkedPO = state.pos.find(po => po.id === targetDelivery.purchaseOrderId);
        const linkedQuote = linkedPO ? state.quotes.find(q => q.id === linkedPO.quoteId) : null;

        if (linkedQuote) {
          const deposit = linkedPO?.depositAmountFcfa || 0;
          const initialStatus: InvoiceStatus = deposit >= linkedQuote.totalFcfa
            ? 'soldee'
            : deposit > 0
              ? 'partiellement_payee'
              : 'en_attente_acompte';

          const newInvoiceId = `inv-${Date.now()}`;
          const newInvoice: Invoice = {
            id: newInvoiceId,
            organizationId: get().currentOrgId,
            invoiceNumber: `FAC-2026-0${state.invoices.length + 1}`,
            quoteId: linkedQuote.id,
            batId: linkedPO?.batId || 'direct-po',
            clientId: linkedQuote.clientId,
            status: initialStatus,
            subtotalFcfa: linkedQuote.subtotalFcfa,
            vatAmountFcfa: linkedQuote.vatAmountFcfa,
            totalFcfa: linkedQuote.totalFcfa,
            amountPaidFcfa: deposit,
            isDeleted: false,
            createdBy: get().getCurrentProfile().fullName,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            items: (linkedQuote.items || []).map(item => ({
              id: `invi-${Date.now()}-${item.id}`,
              invoiceId: newInvoiceId,
              description: item.descriptionSnapshot,
              quantity: item.quantity,
              unitPriceFcfa: item.unitPriceFcfa,
              vatRate: item.vatRate,
              lineTotalFcfa: item.lineTotalFcfa
            }))
          };
          updatedInvoices = [newInvoice, ...state.invoices];
          generatedInvoice = newInvoice;
        }
      }

      return {
        deliveries: updatedDeliveries,
        invoices: updatedInvoices
      };
    });

    if (isSupabaseConfigured && supabase) {
      supabase.from('delivery_notes').update({
        status,
        delivered_at: status === 'livre' ? new Date().toISOString() : null
      }).eq('id', deliveryId).then(({ error }: any) => {
        if (error) console.error("Error updating delivery status in Supabase:", error);
      });

      if (generatedInvoice) {
        const invoiceToPersist = generatedInvoice as Invoice;
        supabase.from('invoices').insert([{
          id: invoiceToPersist.id,
          organization_id: invoiceToPersist.organizationId,
          invoice_number: invoiceToPersist.invoiceNumber,
          quote_id: invoiceToPersist.quoteId,
          bat_id: invoiceToPersist.batId,
          client_id: invoiceToPersist.clientId,
          status: invoiceToPersist.status,
          subtotal_fcfa: invoiceToPersist.subtotalFcfa,
          vat_amount_fcfa: invoiceToPersist.vatAmountFcfa,
          total_fcfa: invoiceToPersist.totalFcfa,
          amount_paid_fcfa: invoiceToPersist.amountPaidFcfa,
          is_deleted: invoiceToPersist.isDeleted,
          created_by: invoiceToPersist.createdBy,
          created_at: invoiceToPersist.createdAt,
          updated_at: invoiceToPersist.updatedAt
        }]).then(({ error }: any) => {
          if (error) {
            console.error("Error adding auto-generated invoice to Supabase:", error);
            return;
          }
          if (invoiceToPersist.items && invoiceToPersist.items.length > 0) {
            supabase.from('invoice_items').insert(invoiceToPersist.items.map(item => ({
              id: item.id,
              invoice_id: item.invoiceId,
              quote_item_id: item.quoteItemId,
              description: item.description,
              quantity: item.quantity,
              unit_price_fcfa: item.unitPriceFcfa,
              vat_rate: item.vatRate,
              line_total_fcfa: item.lineTotalFcfa
            }))).then(({ error: itemsError }: any) => {
              if (itemsError) console.error("Error adding auto-generated invoice items to Supabase:", itemsError);
            });
          }
        });
      }
    }
  },

  // Invoices Actions
  addInvoice: (newInvoice) => {
    set(state => ({ invoices: [newInvoice, ...state.invoices] }));
    get().addAuditLog(`Facture ${newInvoice.invoiceNumber} émise (${newInvoice.totalFcfa.toLocaleString()} FCFA)`, { entityType: 'invoices', entityId: newInvoice.id }, newInvoice.organizationId);

    if (isSupabaseConfigured && supabase) {
      supabase.from('invoices').insert([{
        id: newInvoice.id,
        organization_id: newInvoice.organizationId,
        invoice_number: newInvoice.invoiceNumber,
        quote_id: newInvoice.quoteId,
        bat_id: newInvoice.batId,
        client_id: newInvoice.clientId,
        status: newInvoice.status,
        subtotal_fcfa: newInvoice.subtotalFcfa,
        vat_amount_fcfa: newInvoice.vatAmountFcfa,
        total_fcfa: newInvoice.totalFcfa,
        amount_paid_fcfa: newInvoice.amountPaidFcfa,
        is_deleted: newInvoice.isDeleted,
        created_by: newInvoice.createdBy,
        created_at: newInvoice.createdAt,
        updated_at: newInvoice.updatedAt
      }]).then(({ error }: any) => {
        if (error) {
          console.error("Error adding invoice to Supabase:", error);
          return;
        }
        if (newInvoice.items && newInvoice.items.length > 0) {
          supabase.from('invoice_items').insert(newInvoice.items.map(item => ({
            id: item.id,
            invoice_id: item.invoiceId,
            quote_item_id: item.quoteItemId,
            description: item.description,
            quantity: item.quantity,
            unit_price_fcfa: item.unitPriceFcfa,
            vat_rate: item.vatRate,
            line_total_fcfa: item.lineTotalFcfa
          }))).then(({ error: itemsError }: any) => {
            if (itemsError) console.error("Error adding invoice items to Supabase:", itemsError);
          });
        }
      });
    }
  },

  updateInvoiceStatus: (invoiceId, status) => {
    set(state => ({
      invoices: state.invoices.map(i => i.id === invoiceId ? { ...i, status, updatedAt: new Date().toISOString() } : i)
    }));

    if (isSupabaseConfigured && supabase) {
      supabase.from('invoices').update({ status, updated_at: new Date().toISOString() }).eq('id', invoiceId).then(({ error }: any) => {
        if (error) console.error("Error updating invoice status in Supabase:", error);
      });
    }
  },

  recordPayment: (invoiceId, amountFcfa, method, note) => {
    const invoice = get().invoices.find(i => i.id === invoiceId);
    if (!invoice || amountFcfa <= 0) return;

    const newPaid = invoice.amountPaidFcfa + amountFcfa;
    const nextStatus: Invoice['status'] = newPaid >= invoice.totalFcfa ? 'soldee' : 'partiellement_payee';
    const now = new Date().toISOString();

    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      invoiceId,
      amountFcfa,
      method,
      paidAt: now,
      note,
      recordedBy: get().getCurrentProfile()?.fullName || 'Utilisateur',
      isCancelled: false,
      createdAt: now
    };

    set(state => ({
      payments: [newPayment, ...state.payments],
      invoices: state.invoices.map(i => i.id === invoiceId ? { ...i, amountPaidFcfa: newPaid, status: nextStatus, updatedAt: now } : i)
    }));

    get().addAuditLog(
      `Paiement de ${amountFcfa.toLocaleString()} FCFA (${method}) enregistré sur la facture ${invoice.invoiceNumber}`,
      { entityType: 'payments', entityId: newPayment.id },
      invoice.organizationId
    );

    if (isSupabaseConfigured && supabase) {
      supabase.from('payments').insert([{
        id: newPayment.id,
        invoice_id: newPayment.invoiceId,
        amount_fcfa: newPayment.amountFcfa,
        method: newPayment.method,
        paid_at: newPayment.paidAt,
        note: newPayment.note,
        recorded_by: newPayment.recordedBy,
        is_cancelled: newPayment.isCancelled,
        created_at: newPayment.createdAt
      }]).then(({ error }: any) => {
        if (error) console.error("Error adding payment to Supabase:", error);
      });

      supabase.from('invoices').update({
        amount_paid_fcfa: newPaid,
        status: nextStatus,
        updated_at: now
      }).eq('id', invoiceId).then(({ error }: any) => {
        if (error) console.error("Error updating invoice after payment in Supabase:", error);
      });
    }
  },

  // Config & Profile Actions
  setOrgPreferences: (prefs) => {
    set(state => ({
      orgStylePreferences: { ...state.orgStylePreferences, ...prefs }
    }));
  },

  updateProfile: (updatedProfile) => {
    set(state => ({
      profiles: state.profiles.map(p => p.id === updatedProfile.id ? updatedProfile : p)
    }));
  },

  updateOrgDetails: (updatedOrg) => {
    set(state => ({
      organizations: state.organizations.map(o => o.id === updatedOrg.id ? updatedOrg : o)
    }));
  },

  addTax: (newTax) => {
    const taxObj = { id: `tax-${Date.now()}`, ...newTax };
    set(state => ({ taxes: [...state.taxes, taxObj] }));
  },

  deleteTax: (taxId) => {
    set(state => ({ taxes: state.taxes.filter(t => t.id !== taxId) }));
  },

  addMachine: (newMachine) => {
    const machineObj = { id: `m-${Date.now()}`, ...newMachine };
    set(state => ({ machines: [...state.machines, machineObj] }));
  },

  deleteMachine: (machineId) => {
    set(state => ({ machines: state.machines.filter(m => m.id !== machineId) }));
  },

  addPartner: (newPartner) => {
    const partnerObj = { id: `p-${Date.now()}`, ...newPartner };
    set(state => ({ partners: [...state.partners, partnerObj] }));
  },

  deletePartner: (partnerId) => {
    set(state => ({ partners: state.partners.filter(p => p.id !== partnerId) }));
  },

  addPaperFormat: (fmt) => {
    set(state => ({ paperFormats: [...state.paperFormats, fmt] }));
  },

  deletePaperFormat: (fmt) => {
    set(state => ({ paperFormats: state.paperFormats.filter(f => f !== fmt) }));
  },

  addAuditLog: (action, options, organizationId) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      organizationId: organizationId || 'system',
      entityType: options?.entityType || 'action',
      entityId: options?.entityId || 'sys',
      action,
      occurredAt: new Date().toISOString(),
      metadata: options?.metadata
    };
    set(state => ({ auditLogs: [newLog, ...state.auditLogs] }));

    if (isSupabaseConfigured && supabase) {
      supabase.from('audit_logs').insert([{
        id: newLog.id,
        organization_id: newLog.organizationId,
        entity_type: newLog.entityType,
        entity_id: newLog.entityId,
        action: newLog.action,
        occurred_at: newLog.occurredAt,
        metadata: newLog.metadata || null
      }]).then(({ error }: any) => {
        if (error) console.error("Error adding audit log to Supabase:", error);
      });
    }
  },

  addProfile: async (profile) => {
    if (!profile.email) {
      return { success: false, error: "L'adresse e-mail est obligatoire." };
    }

    const orgId = get().currentOrgId;

    try {
      const res = await fetch('/api/admin/create-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || "Impossible de créer le collaborateur." };
      }

      if (data.profile) {
        set(state => ({
          profiles: [data.profile, ...state.profiles.filter(p => p.id !== data.profile.id)]
        }));
        get().addAuditLog(`Collaborateur "${data.profile.fullName}" créé avec le rôle ${data.profile.role}`, null, orgId);
        return { success: true };
      }

      return { success: false, error: "Réponse invalide du serveur." };
    } catch (e: any) {
      console.error("Error calling /api/admin/create-profile:", e);
      return { success: false, error: e?.message || "Impossible de contacter le serveur." };
    }
  },

  editProfile: async (profile) => {
    const existing = get().profiles.find(p => p.id === profile.id);
    if (!existing) return { success: false, error: 'Collaborateur introuvable.' };

    const roleChanged = profile.role !== existing.role;
    const updatedAt = new Date().toISOString();

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('profiles').update({
        full_name: profile.fullName,
        email: profile.email,
        phone: profile.phone,
        updated_at: updatedAt,
      }).eq('id', profile.id);

      if (error) {
        console.error('Error editing profile in Supabase:', error);
        return { success: false, error: error.message };
      }

      if (roleChanged) {
        const { error: roleError } = await supabase.rpc('admin_update_profile_role', {
          target_profile_id: profile.id,
          new_role: profile.role,
        });
        if (roleError) {
          console.error('Error updating profile role via RPC:', roleError);
          return { success: false, error: roleError.message };
        }
      }
    }

    set(state => ({
      profiles: state.profiles.map(p => p.id === profile.id ? {
        ...p,
        fullName: profile.fullName,
        email: profile.email,
        phone: profile.phone,
        role: profile.role,
        updatedAt,
      } : p)
    }));
    get().addAuditLog(`Collaborateur "${profile.fullName}" mis à jour`, null, get().currentOrgId);
    return { success: true };
  },

  deleteProfile: (profileId) => {
    const orgId = get().currentOrgId;
    set(state => ({
      profiles: state.profiles.filter(p => p.id !== profileId)
    }));
    get().addAuditLog(`Collaborateur supprimé de l'organisation`, null, orgId);

    // Sync with Supabase
    if (isSupabaseConfigured && supabase) {
      supabase.from('profiles').delete().eq('id', profileId).then(({ error }: any) => {
        if (error) console.error(error);
      });
    }
  },

  toggleProfileActive: (profileId) => {
    const orgId = get().currentOrgId;
    let isAct = false;
    set(state => {
      const profile = state.profiles.find(p => p.id === profileId);
      isAct = profile ? !profile.isActive : false;
      return {
        profiles: state.profiles.map(p => p.id === profileId ? { ...p, isActive: isAct, updatedAt: new Date().toISOString() } : p)
      };
    });
    get().addAuditLog(`Statut du collaborateur modifié`, null, orgId);

    // Sync with Supabase
    if (isSupabaseConfigured && supabase) {
      supabase.from('profiles').update({ is_active: isAct, updated_at: new Date().toISOString() }).eq('id', profileId).then(({ error }: any) => {
        if (error) console.error(error);
      });
    }
  },

  changePassword: async (profileId, newPass) => {
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, error: "Supabase n'est pas configuré." };
    }
    try {
      const { error } = await supabase.auth.updateUser({ password: newPass });
      if (error) return { success: false, error: error.message };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
    set(state => ({
      profiles: state.profiles.map(p => p.id === profileId ? { ...p, updatedAt: new Date().toISOString() } : p)
    }));
    return { success: true };
  },

  requestPasswordReset: async (email) => {
    if (!isValidEmail(email)) {
      return { success: false, error: 'Veuillez saisir une adresse e-mail valide.' };
    }
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, error: "Supabase n'est pas configuré." };
    }
    try {
      const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/reset-password` : undefined;
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || "Impossible d'envoyer l'e-mail de réinitialisation." };
    }
  },

  confirmPasswordReset: async (newPassword) => {
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, error: "Supabase n'est pas configuré." };
    }
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || "Impossible de mettre à jour le mot de passe." };
    }
  },

  // Public Catalogue & Online Orders
  updateOnlineOrderStatus: (orderId, status) => {
    set(state => ({
      onlineOrders: state.onlineOrders.map(o => o.id === orderId ? { ...o, status, updatedAt: new Date().toISOString() } : o)
    }));

    if (isSupabaseConfigured && supabase) {
      supabase.from('online_orders').update({ status, updated_at: new Date().toISOString() }).eq('id', orderId).then(({ error }: any) => {
        if (error) console.error("Error updating online order status in Supabase:", error);
      });
    }
  },

  convertOnlineOrderToQuote: (orderId) => {
    const order = get().onlineOrders.find(o => o.id === orderId);
    if (!order) return;

    const quoteId = `quote-${Date.now()}`;
    const subtotal = order.subtotalFcfa;
    const vatRate = 18;
    const vatAmount = Math.round(subtotal * vatRate / 100);

    const newQuote: Quote = {
      id: quoteId,
      organizationId: order.organizationId,
      quoteNumber: `DEV-WEB-${order.orderNumber.replace(/\D/g, '') || Date.now()}`,
      clientId: order.clientId,
      status: 'en_attente',
      subtotalFcfa: subtotal,
      vatAmountFcfa: vatAmount,
      totalFcfa: subtotal + vatAmount,
      notes: `Généré depuis la commande en ligne ${order.orderNumber}.${order.notes ? ' Notes client: ' + order.notes : ''}`,
      createdBy: get().getCurrentProfile()?.fullName || 'Catalogue Public',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: order.items.map((item, idx) => ({
        id: `qi-${Date.now()}-${idx}`,
        quoteId,
        productId: item.productId,
        descriptionSnapshot: `${item.name} (${item.format})`,
        quantity: item.quantity,
        unitPriceFcfa: item.unitPriceFcfa,
        vatRate,
        lineTotalFcfa: item.lineTotalFcfa,
        sortOrder: idx
      }))
    };

    get().addQuote(newQuote);
    get().updateOnlineOrderStatus(orderId, 'convertie');
    get().addAuditLog(`Devis ${newQuote.quoteNumber} créé depuis la commande en ligne ${order.orderNumber}`, null, order.organizationId);
  },

  fetchPublicCatalogue: async () => {
    if (!isSupabaseConfigured || !supabase) return { org: null, products: [] };

    try {
      const companyOrgId = await resolveCompanyOrgId();
      if (!companyOrgId) return { org: null, products: [] };

      const { data: orgRow } = await supabase.from('organizations').select('*').eq('id', companyOrgId).maybeSingle();
      if (!orgRow || orgRow.is_active === false) {
        return { org: null, products: [] };
      }

      const org: Organization = {
        id: orgRow.id,
        name: orgRow.name,
        address: orgRow.address,
        phone: orgRow.phone,
        email: orgRow.email,
        isActive: orgRow.is_active,
        createdAt: orgRow.created_at
      };

      const [{ data: productRows }, { data: tierRows }] = await Promise.all([
        supabase.from('products').select('*').eq('organization_id', companyOrgId).eq('is_active', true),
        supabase.from('product_price_tiers').select('*')
      ]) as any[];

      const products: Product[] = (productRows || []).map((p: any) => ({
        id: p.id,
        organizationId: p.organization_id,
        name: p.name,
        category: p.category,
        description: p.description,
        materialType: p.material_type || 'papier',
        paperType: p.paper_type,
        grammageG: p.grammage_g,
        format: p.format,
        formatOptions: p.format_options || [],
        finishing: p.finishing,
        photoUrl: p.photo_url,
        unitPriceFcfa: Number(p.unit_price_fcfa),
        vatRate: Number(p.vat_rate),
        isActive: p.is_active,
        priceTiers: (tierRows || [])
          .filter((t: any) => t.product_id === p.id)
          .map((t: any) => ({
            id: t.id,
            productId: t.product_id,
            minQuantity: t.min_quantity,
            maxQuantity: t.max_quantity ?? undefined,
            unitPriceFcfa: Number(t.unit_price_fcfa)
          })),
        createdAt: p.created_at,
        updatedAt: p.updated_at
      }));

      return { org, products };
    } catch (e) {
      console.error("Error fetching public catalogue from Supabase:", e);
      return { org: null, products: [] };
    }
  },

  submitPublicOrder: async (payload) => {
    if (!payload.items.length) {
      return { success: false, error: 'Votre commande est vide.' };
    }
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, error: "Supabase n'est pas configuré." };
    }

    const companyOrgId = await resolveCompanyOrgId();
    if (!companyOrgId) {
      return { success: false, error: "Impossible d'identifier l'entreprise." };
    }

    const randSuffix = Math.random().toString(36).substring(2, 7);
    const orderId = `order-web-${Date.now()}-${randSuffix}`;
    const orderNumber = `CMD-WEB-${Date.now().toString().slice(-4)}${Math.floor(Math.random() * 90 + 10)}`;
    const subtotal = payload.items.reduce((sum, item) => sum + item.lineTotalFcfa, 0);

    try {
      const { data: existingClients } = await supabase
        .from('clients')
        .select('*')
        .eq('organization_id', companyOrgId)
        .eq('phone', payload.phone)
        .limit(1);

      let clientId: string;

      if (existingClients && existingClients.length > 0) {
        clientId = existingClients[0].id;
      } else {
        clientId = `client-web-${Date.now()}-${randSuffix}`;
        const { error: clientError } = await supabase.from('clients').insert([{
          id: clientId,
          organization_id: companyOrgId,
          company_name: payload.companyName,
          contact_name: payload.contactName,
          phone: payload.phone,
          email: payload.email,
          address: payload.address,
          source: 'catalogue_public',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);
        if (clientError) {
          console.error("Error creating public client in Supabase:", clientError);
          return { success: false, error: "Impossible d'enregistrer votre commande. Veuillez réessayer." };
        }
      }

      const { error: orderError } = await supabase.from('online_orders').insert([{
        id: orderId,
        organization_id: companyOrgId,
        order_number: orderNumber,
        client_id: clientId,
        status: 'nouvelle',
        items: payload.items,
        subtotal_fcfa: subtotal,
        notes: payload.notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]);

      if (orderError) {
        console.error("Error creating online order in Supabase:", orderError);
        return { success: false, error: "Impossible d'enregistrer votre commande. Veuillez réessayer." };
      }

      return { success: true, orderNumber };
    } catch (e: any) {
      console.error("Error in submitPublicOrder Supabase sync:", e);
      return { success: false, error: "Impossible d'enregistrer votre commande. Veuillez réessayer." };
    }
  }
    }),
    {
      name: 'printflow-session',
      partialize: (state) => ({
        currentOrgId: state.currentOrgId,
        currentProfileId: state.currentProfileId,
        isAuthenticated: state.isAuthenticated,
        theme: state.theme,
        isSidebarCollapsed: state.isSidebarCollapsed,
        orgStylePreferences: state.orgStylePreferences,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

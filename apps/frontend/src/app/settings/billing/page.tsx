'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Building2, 
  CreditCard, 
  ShieldCheck, 
  Zap, 
  Users, 
  FolderKanban, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ArrowUpRight, 
  Check, 
  Loader2,
  Receipt,
  Download,
  Calendar
} from 'lucide-react';
import { 
  apiRequest, 
  getActiveOrganization, 
  getAuthToken 
} from '@/lib/api';
import { 
  SubscriptionUsage, 
  SubscriptionPlan, 
  SubscriptionInvoice, 
  PlanCode, 
  BillingCycle 
} from '@karsa/shared-types';

function BillingSettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [activeOrg, setActiveOrg] = useState<any>(null);
  const [usage, setUsage] = useState<SubscriptionUsage | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [invoices, setInvoices] = useState<SubscriptionInvoice[]>([]);
  
  // Checkout & Upgrade State
  const [showUpgradeSection, setShowUpgradeSection] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState<BillingCycle>(BillingCycle.MONTHLY);
  const [checkingOut, setCheckingOut] = useState(false);
  
  // Payment Modal State
  const [activeInvoice, setActiveInvoice] = useState<SubscriptionInvoice | null>(null);
  const [confirmingPayment, setConfirmingPayment] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const formatRupiah = (val: number) => {
    if (val === 0) return 'Gratis';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '-';
    try {
      return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(new Date(dateStr));
    } catch {
      return dateStr;
    }
  };

  const loadBillingData = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const org = getActiveOrganization();
      if (!org) {
        setErrorMessage('Silakan pilih organisasi terlebih dahulu.');
        setLoading(false);
        return;
      }
      setActiveOrg(org);

      const [usageData, plansData, invoicesData] = await Promise.all([
        apiRequest<SubscriptionUsage>('/subscriptions/usage'),
        apiRequest<SubscriptionPlan[]>('/subscriptions/plans'),
        apiRequest<SubscriptionInvoice[]>('/subscriptions/invoices'),
      ]);

      setUsage(usageData);
      setPlans(plansData);
      setInvoices(invoicesData);

      // Check if URL has ?invoice=ID to open payment modal automatically
      const invoiceIdQuery = searchParams.get('invoice');
      if (invoiceIdQuery && invoicesData) {
        const found = invoicesData.find((inv) => inv.id === invoiceIdQuery && inv.status === 'pending');
        if (found) {
          setActiveInvoice(found);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal memuat informasi langganan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.push('/login');
      return;
    }
    loadBillingData();
  }, [router]);

  const handleCheckout = async (planCode: PlanCode) => {
    try {
      setCheckingOut(true);
      setErrorMessage(null);
      const res = await apiRequest<{ invoice: SubscriptionInvoice }>('/subscriptions/checkout', {
        method: 'POST',
        body: JSON.stringify({
          planCode,
          billingCycle: selectedCycle,
          paymentMethod: 'BCA_VIRTUAL_ACCOUNT',
        }),
      });

      // Reload invoices and show confirmation modal
      await loadBillingData();
      setActiveInvoice(res.invoice);
      setShowUpgradeSection(false);
      setSuccessMessage(`Tagihan #${res.invoice.invoiceNumber} berhasil dibuat.`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal memproses perubahan paket.');
    } finally {
      setCheckingOut(false);
    }
  };

  const handleConfirmPayment = async (invoiceId: string) => {
    try {
      setConfirmingPayment(true);
      setErrorMessage(null);
      await apiRequest(`/subscriptions/invoices/${invoiceId}/confirm`, {
        method: 'POST',
        body: JSON.stringify({
          paymentProofUrl: 'https://storage.karsapantau.com/proofs/simulated-b2b-transfer.pdf',
        }),
      });

      setSuccessMessage('Pembayaran berhasil dikonfirmasi! Paket langganan Anda kini telah aktif.');
      setActiveInvoice(null);
      await loadBillingData();
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal memverifikasi pembayaran.');
    } finally {
      setConfirmingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
        <p className="text-sm text-slate-400">Memuat rincian langganan organisasi...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-sky-400 uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4" />
            <span>Workspace: {activeOrg?.name || 'Perusahaan'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Langganan & Kuota SaaS
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Kelola paket langganan B2B, batas kuota proyek & tim, serta riwayat faktur pembayaran.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowUpgradeSection(!showUpgradeSection)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-sky-500 to-amber-500 hover:from-sky-400 hover:to-amber-400 text-slate-950 shadow-lg shadow-sky-500/20 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>{showUpgradeSection ? 'Tutup Pilihan Paket' : 'Upgrade / Ubah Paket'}</span>
          </button>
        </div>
      </div>

      {/* Alerts */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setSuccessMessage(null)}
            className="text-xs text-emerald-400 hover:underline ml-4"
          >
            Tutup
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setErrorMessage(null)}
            className="text-xs text-rose-400 hover:underline ml-4"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Active Subscription Overview Card */}
      {usage && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-6 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-950 border border-slate-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Paket Langganan Aktif
                </span>
                <div className="flex items-center gap-3 mt-1.5">
                  <h2 className="text-2xl sm:text-3xl font-black text-white">
                    {usage.planName}
                  </h2>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase border ${
                    usage.status === 'active'
                      ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/80'
                      : usage.status === 'trialing'
                      ? 'bg-sky-950/60 text-sky-400 border-sky-800/80'
                      : 'bg-rose-950/60 text-rose-400 border-rose-800/80'
                  }`}>
                    ● {usage.status}
                  </span>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-xs text-slate-400 block">Siklus Pembayaran</span>
                <span className="text-sm font-semibold text-slate-200 capitalize">
                  {usage.billingCycle === BillingCycle.YEARLY ? 'Tahunan (Hemat 20%)' : 'Bulanan'}
                </span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Masa Aktif Berakhir: <strong>{formatDate(usage.currentPeriodEnd)}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-lg font-mono font-medium ${
                  usage.daysRemaining <= 5 
                    ? 'bg-amber-950 text-amber-300 border border-amber-800/80' 
                    : 'bg-slate-800 text-slate-300'
                }`}>
                  {usage.daysRemaining} hari tersisa
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>Bantuan & Lisensi B2B</span>
              </div>
              <h3 className="text-base font-semibold text-white mt-2">
                Butuh Custom SLA & Kapasitas Proyek Skala Besar?
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Karsa Pantau Enterprise siap mendukung konsorsium kontraktor & pengembang skala besar dengan multi-tenant on-premise atau private cloud hosting.
              </p>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-800">
              <a
                href="mailto:support@karsapantau.com?subject=Kemitraan%20Enterprise%20Karsa%20Pantau"
                className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1"
              >
                <span>Hubungi Tim Sales Enterprise</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Quota Usage Cards */}
      {usage && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white tracking-tight">
            Penggunaan Kuota Organisasi
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Proyek Quota */}
            <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-sky-950/80 border border-sky-800/60 text-sky-400">
                    <FolderKanban className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">Proyek Konstruksi</h3>
                    <p className="text-[11px] text-slate-400">Proyek konstruksi aktif berjalan</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-slate-200">
                  {usage.projectsUsed} / {usage.projectsLimit >= 9999 ? '∞' : usage.projectsLimit}
                </span>
              </div>

              <div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-sky-500 h-2 rounded-full transition-all"
                    style={{ 
                      width: `${Math.min(100, Math.round((usage.projectsUsed / (usage.projectsLimit || 1)) * 100))}%` 
                    }}
                  />
                </div>
                <div className="flex justify-between items-center text-[11px] text-slate-400 mt-2">
                  <span>Terpakai {usage.projectsUsed} proyek</span>
                  <span>{Math.round((usage.projectsUsed / (usage.projectsLimit || 1)) * 100)}%</span>
                </div>
              </div>
            </div>

            {/* Tim & User Quota */}
            <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-950/80 border border-amber-800/60 text-amber-400">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">Anggota Tim</h3>
                    <p className="text-[11px] text-slate-400">Role PM, Site, Direksi, Estimator</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-slate-200">
                  {usage.usersUsed} / {usage.usersLimit >= 9999 ? '∞' : usage.usersLimit}
                </span>
              </div>

              <div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-amber-500 h-2 rounded-full transition-all"
                    style={{ 
                      width: `${Math.min(100, Math.round((usage.usersUsed / (usage.usersLimit || 1)) * 100))}%` 
                    }}
                  />
                </div>
                <div className="flex justify-between items-center text-[11px] text-slate-400 mt-2">
                  <span>Terdaftar {usage.usersUsed} pengguna</span>
                  <span>{Math.round((usage.usersUsed / (usage.usersLimit || 1)) * 100)}%</span>
                </div>
              </div>
            </div>

            {/* AI OCR Quota */}
            <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-950/80 border border-emerald-800/60 text-emerald-400">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">AI OCR & Insight</h3>
                    <p className="text-[11px] text-slate-400">Ekstraksi struk & deteksi anomali</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-slate-200">
                  {usage.aiQuotaUsed} / {usage.aiQuotaLimit >= 9999 ? '∞' : usage.aiQuotaLimit}
                </span>
              </div>

              <div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-2 rounded-full transition-all"
                    style={{ 
                      width: `${Math.min(100, Math.round((usage.aiQuotaUsed / (usage.aiQuotaLimit || 1)) * 100))}%` 
                    }}
                  />
                </div>
                <div className="flex justify-between items-center text-[11px] text-slate-400 mt-2">
                  <span>Terpakai {usage.aiQuotaUsed} kredit bulan ini</span>
                  <span>{Math.round((usage.aiQuotaUsed / (usage.aiQuotaLimit || 1)) * 100)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade / Plan Selection Section */}
      {showUpgradeSection && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-sky-900/50 space-y-8 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Pilih Paket Sesuai Kebutuhan EPC Anda
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Tingkatkan kapasitas proyek dan pengguna tanpa downtime sistem.
              </p>
            </div>

            {/* Toggle Monthly / Yearly */}
            <div className="flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800 w-fit">
              <button
                type="button"
                onClick={() => setSelectedCycle(BillingCycle.MONTHLY)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedCycle === BillingCycle.MONTHLY
                    ? 'bg-sky-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Tagihan Bulanan
              </button>
              <button
                type="button"
                onClick={() => setSelectedCycle(BillingCycle.YEARLY)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  selectedCycle === BillingCycle.YEARLY
                    ? 'bg-sky-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Tahunan</span>
                <span className="text-[10px] bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded font-bold">
                  Hemat 20%
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans
              .filter((p) => p.code !== PlanCode.TRIAL)
              .map((plan) => {
                const isCurrent = usage?.planCode === plan.code;
                const price = selectedCycle === BillingCycle.YEARLY ? plan.priceYearly : plan.priceMonthly;

                return (
                  <div
                    key={plan.id}
                    className={`rounded-2xl p-6 border flex flex-col justify-between transition-all ${
                      isCurrent
                        ? 'bg-slate-950/80 border-sky-500/80 shadow-lg shadow-sky-500/10'
                        : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                        {isCurrent && (
                          <span className="text-[10px] bg-sky-950 text-sky-400 border border-sky-800 px-2 py-0.5 rounded-full font-semibold">
                            Paket Saat Ini
                          </span>
                        )}
                      </div>

                      <div>
                        <div className="text-2xl font-black text-white">
                          {formatRupiah(price)}
                        </div>
                        <span className="text-xs text-slate-400">
                          {selectedCycle === BillingCycle.YEARLY ? '/ tahun (ditagih tahunan)' : '/ bulan'}
                        </span>
                      </div>

                      <ul className="space-y-2.5 text-xs text-slate-300 pt-2 border-t border-slate-800/80">
                        <li className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                          <span>Hingga <strong>{plan.maxProjects >= 9999 ? 'Unlimited' : plan.maxProjects} Proyek</strong> Aktif</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                          <span>Hingga <strong>{plan.maxUsers >= 9999 ? 'Unlimited' : plan.maxUsers} Pengguna</strong> Lapangan</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                          <span><strong>{plan.aiQuotaPerMonth}x</strong> OCR Struk / Bulan</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                          <span>Kalkulator EVM & Kurva S Lapangan</span>
                        </li>
                      </ul>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-800">
                      <button
                        type="button"
                        disabled={isCurrent || checkingOut}
                        onClick={() => handleCheckout(plan.code)}
                        className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                          isCurrent
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            : 'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-md shadow-sky-500/20 cursor-pointer'
                        }`}
                      >
                        {checkingOut ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : isCurrent ? (
                          'Paket Sedang Digunakan'
                        ) : (
                          `Pilih Paket ${plan.name}`
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Invoices & Billing History */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Riwayat Faktur & Pembayaran
            </h2>
            <p className="text-xs text-slate-400">
              Daftar tagihan langganan B2B dan bukti transaksi resmi.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/40">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="px-6 py-3.5">Nomor Faktur</th>
                <th className="px-6 py-3.5">Tanggal</th>
                <th className="px-6 py-3.5">Nominal</th>
                <th className="px-6 py-3.5">Metode</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Belum ada riwayat faktur tagihan untuk organisasi ini.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-mono font-semibold text-white">
                      {inv.invoiceNumber}
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {formatDate(inv.createdAt)}
                    </td>
                    <td className="px-6 py-4 font-bold text-white">
                      {formatRupiah(inv.amount)}
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {inv.paymentMethod?.replace(/_/g, ' ') || 'BANK TRANSFER'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase ${
                        inv.status === 'paid'
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/80'
                          : inv.status === 'pending'
                          ? 'bg-amber-950/80 text-amber-300 border border-amber-800/80'
                          : 'bg-rose-950/80 text-rose-400 border border-rose-800/80'
                      }`}>
                        {inv.status === 'paid' ? 'LUNAS' : inv.status === 'pending' ? 'MENUNGGU PEMBAYARAN' : inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {inv.status === 'pending' ? (
                        <button
                          type="button"
                          onClick={() => setActiveInvoice(inv)}
                          className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] shadow-sm transition-all cursor-pointer"
                        >
                          Bayar Sekarang
                        </button>
                      ) : (
                        <span className="text-emerald-400 font-semibold flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Lunas ({formatDate(inv.paidAt)})</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment / Confirmation Modal */}
      {activeInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-950 text-amber-400 border border-amber-800/60">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Selesaikan Pembayaran</h3>
                  <p className="text-xs text-slate-400">Faktur #{activeInvoice.invoiceNumber}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveInvoice(null)}
                className="text-slate-400 hover:text-white text-xs p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Total Tagihan:</span>
                  <span className="text-base font-black text-white">{formatRupiah(activeInvoice.amount)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Metode:</span>
                  <span className="font-medium text-slate-200">Transfer Virtual Account</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Nomor Rekening VA:</span>
                  <span className="font-mono font-bold text-amber-400">8801-9283-7461-0001</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Atas Nama:</span>
                  <span className="font-medium text-slate-200">PT Karsa Pantau Solusi</span>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Untuk simulasi pembayaran instan (Sandbox), klik tombol di bawah untuk mengaktifkan paket langganan secara langsung.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                disabled={confirmingPayment}
                onClick={() => handleConfirmPayment(activeInvoice.id)}
                className="w-full py-3 px-4 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
              >
                {confirmingPayment ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Konfirmasi Pembayaran Instan (Lunas)</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveInvoice(null)}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
              >
                Bayar Nanti
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BillingSettingsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
        <p className="text-sm text-slate-400">Memuat rincian langganan...</p>
      </div>
    }>
      <BillingSettingsContent />
    </Suspense>
  );
}

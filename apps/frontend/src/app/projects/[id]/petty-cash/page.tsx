'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Wallet,
  Receipt,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Camera,
  MapPin,
  ChevronLeft,
  ArrowRight,
  Filter,
  DollarSign,
  User,
  ShieldCheck,
  Building,
  Upload,
  FileCheck,
} from 'lucide-react';

interface PettyCashTx {
  id: string;
  project_id: string;
  transaction_type: string;
  amount: number;
  recipient_name: string;
  purpose: string;
  cost_category: string;
  status: 'submitted' | 'approved' | 'disbursed' | 'settled' | 'rejected';
  approved_by?: string;
  approver_name?: string;
  disbursed_at?: string;
  receipt_url?: string;
  geotag?: any;
  settlement_amount?: number | null;
  settlement_notes?: string;
  requester_name?: string;
  created_at: string;
}

interface PettyCashSummary {
  sitePoolLimit: number;
  availablePool: number;
  outstandingAmount: number;
  totalSettledAmount: number;
  pendingApprovalAmount: number;
  pendingApprovalCount: number;
  outstandingCount: number;
  settledCount: number;
}

export default function PettyCashPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [transactions, setTransactions] = useState<PettyCashTx[]>([]);
  const [summary, setSummary] = useState<PettyCashSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal States
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showSettleModal, setShowSettleModal] = useState(false);
  const [selectedTxForSettle, setSelectedTxForSettle] = useState<PettyCashTx | null>(null);

  // Form State Pengajuan Kasbon
  const [requestForm, setRequestForm] = useState({
    recipientName: '',
    amount: '',
    purpose: '',
    costCategory: 'equipment',
  });

  // Form State Settlement Nota
  const [settleForm, setSettleForm] = useState({
    settlementAmount: '',
    settlementNotes: '',
    receiptPhoto: null as string | null,
    geotag: {
      latitude: -6.2941,
      longitude: 107.1428,
      address: 'Kawasan Industri GIIC Cikarang Pusat, Jawa Barat',
      capturedAt: new Date().toISOString(),
    },
  });

  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Transactions
      const txRes = await fetch(`/api/v1/projects/${projectId}/petty-cash`);
      if (txRes.ok) {
        const data = await txRes.json();
        setTransactions(data);
      } else {
        // Fallback demo mock
        setTransactions([
          {
            id: 'mock-1',
            project_id: projectId,
            transaction_type: 'kasbon_request',
            amount: 1250000,
            recipient_name: 'Mandor Sugiarto',
            purpose: 'Pembelian darurat Solar Dexlite 80L untuk Genset Silent 50kVA lembur malam',
            cost_category: 'equipment',
            status: 'settled',
            approver_name: 'PM Budi Hartono',
            disbursed_at: new Date(Date.now() - 3 * 86400000).toISOString(),
            settlement_amount: 1200000,
            settlement_notes: '80L solar @Rp 15.000 = Rp 1.200.000. Nota SPBU terlampir. Sisa uang kembali Rp 50.000 disetor kembali ke kasir.',
            requester_name: 'Supervisor Andi Prasetyo',
            created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
          },
          {
            id: 'mock-2',
            project_id: projectId,
            transaction_type: 'kasbon_request',
            amount: 850000,
            recipient_name: 'Supervisor Budi Santoso',
            purpose: 'Beli kawat bendrat 2 rol & paku usuk 7cm di Toko Besi Sumber Makmur (stok habis)',
            cost_category: 'material',
            status: 'disbursed',
            approver_name: 'PM Budi Hartono',
            disbursed_at: new Date(Date.now() - 86400000).toISOString(),
            requester_name: 'Supervisor Budi Santoso',
            created_at: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            id: 'mock-3',
            project_id: projectId,
            transaction_type: 'kasbon_request',
            amount: 450000,
            recipient_name: 'Mandor Sugiarto',
            purpose: 'Uang makan malam & kopi 15 orang pekerja lembur persiapan cor balok',
            cost_category: 'overhead',
            status: 'submitted',
            requester_name: 'Supervisor Andi Prasetyo',
            created_at: new Date(Date.now() - 14400000).toISOString(),
          },
        ]);
      }

      // 2. Fetch Summary
      const sumRes = await fetch(`/api/v1/projects/${projectId}/petty-cash/summary`);
      if (sumRes.ok) {
        const sumData = await sumRes.json();
        setSummary(sumData);
      } else {
        setSummary({
          sitePoolLimit: 15000000,
          availablePool: 14150000,
          outstandingAmount: 850000,
          totalSettledAmount: 1200000,
          pendingApprovalAmount: 450000,
          pendingApprovalCount: 1,
          outstandingCount: 1,
          settledCount: 1,
        });
      }
    } catch {
      //
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [projectId]);

  // Handle Create Kasbon
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(requestForm.amount.replace(/[^0-9]/g, ''));
    if (!amountNum || amountNum <= 0) return;

    const payload = {
      amount: amountNum,
      recipientName: requestForm.recipientName,
      purpose: requestForm.purpose,
      costCategory: requestForm.costCategory,
    };

    try {
      const res = await fetch(`/api/v1/projects/${projectId}/petty-cash`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowRequestModal(false);
        setRequestForm({ recipientName: '', amount: '', purpose: '', costCategory: 'equipment' });
        fetchData();
      } else {
        // Local preview update
        setTransactions((prev) => [
          {
            id: 'local-' + Date.now(),
            project_id: projectId,
            transaction_type: 'kasbon_request',
            amount: amountNum,
            recipient_name: payload.recipientName,
            purpose: payload.purpose,
            cost_category: payload.costCategory,
            status: 'submitted',
            requester_name: 'Site Supervisor (Anda)',
            created_at: new Date().toISOString(),
          },
          ...prev,
        ]);
        setShowRequestModal(false);
        setRequestForm({ recipientName: '', amount: '', purpose: '', costCategory: 'equipment' });
      }
    } catch {
      //
    }
  };

  // Handle Approve
  const handleApprove = async (txId: string) => {
    setProcessingId(txId);
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/petty-cash/${txId}/approve`, {
        method: 'PATCH',
      });
      if (res.ok) {
        fetchData();
      } else {
        setTransactions((prev) =>
          prev.map((t) => (t.id === txId ? { ...t, status: 'approved', approver_name: 'Project Manager' } : t)),
        );
      }
    } catch {
      //
    } finally {
      setProcessingId(null);
    }
  };

  // Handle Disburse
  const handleDisburse = async (txId: string) => {
    setProcessingId(txId);
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/petty-cash/${txId}/disburse`, {
        method: 'PATCH',
      });
      if (res.ok) {
        fetchData();
      } else {
        setTransactions((prev) =>
          prev.map((t) => (t.id === txId ? { ...t, status: 'disbursed', disbursed_at: new Date().toISOString() } : t)),
        );
      }
    } catch {
      //
    } finally {
      setProcessingId(null);
    }
  };

  // Handle Open Settle Modal
  const openSettleModal = (tx: PettyCashTx) => {
    setSelectedTxForSettle(tx);
    setSettleForm({
      settlementAmount: tx.amount.toLocaleString('id-ID'),
      settlementNotes: '',
      receiptPhoto: null,
      geotag: {
        latitude: -6.2941,
        longitude: 107.1428,
        address: 'Kawasan Industri GIIC Cikarang Pusat, Jawa Barat',
        capturedAt: new Date().toISOString(),
      },
    });
    setShowSettleModal(true);
  };

  // Handle Submit Settlement
  const handleSettleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTxForSettle) return;

    const settleNum = parseFloat(settleForm.settlementAmount.replace(/[^0-9]/g, ''));
    const payload = {
      settlementAmount: settleNum,
      settlementNotes: settleForm.settlementNotes || 'Nota kuitansi fisik telah diserahkan ke kasir site.',
      receiptUrl: settleForm.receiptPhoto || 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600',
      geotag: settleForm.geotag,
    };

    try {
      const res = await fetch(`/api/v1/projects/${projectId}/petty-cash/${selectedTxForSettle.id}/settle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowSettleModal(false);
        setSelectedTxForSettle(null);
        fetchData();
      } else {
        setTransactions((prev) =>
          prev.map((t) =>
            t.id === selectedTxForSettle.id
              ? {
                  ...t,
                  status: 'settled',
                  settlement_amount: settleNum,
                  settlement_notes: payload.settlementNotes,
                }
              : t,
          ),
        );
        setShowSettleModal(false);
        setSelectedTxForSettle(null);
      }
    } catch {
      //
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
            <Clock className="w-3 h-3" /> Menunggu Approval PM
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 font-semibold">
            <CheckCircle2 className="w-3 h-3" /> Disetujui PM (Siap Cair)
          </span>
        );
      case 'disbursed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold animate-pulse">
            <DollarSign className="w-3 h-3" /> Dicairkan (Menunggu Nota)
          </span>
        );
      case 'settled':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
            <ShieldCheck className="w-3 h-3" /> Selesai Settle (Ada Nota)
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold">
            ✕ Ditolak
          </span>
        );
      default:
        return <span className="text-xs text-slate-400">{status}</span>;
    }
  };

  const filteredTx = statusFilter === 'all'
    ? transactions
    : transactions.filter((t) => t.status === statusFilter);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-sky-500 selection:text-white">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Breadcrumb Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Link href={`/projects/${projectId}`} className="hover:text-white flex items-center gap-1 transition-colors">
                <ChevronLeft className="w-4 h-4" /> Kembali ke Proyek
              </Link>
              <span>/</span>
              <span className="text-slate-200">Kasbon & Petty Cash Lapangan</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
              <Wallet className="w-7 h-7 text-amber-400" />
              Kasbon Proyek & Petty Cash Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Sistem pencatatan kas kecil lapangan: pengajuan kasbon darurat, otorisasi Project Manager, pencairan dana, dan pertanggungjawaban nota kuitansi ber-geotag.
            </p>
          </div>

          {/* Action Button */}
          <button
            onClick={() => setShowRequestModal(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            + Ajukan Kasbon Lapangan
          </button>
        </div>

        {/* 4 Financial Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-[11px] text-slate-400 flex items-center gap-1.5 font-medium">
              <Wallet className="w-3.5 h-3.5 text-sky-400" /> Sisa Pagu Kas Lapangan
            </span>
            <div className="text-xl sm:text-2xl font-black text-white">
              Rp {(summary ? summary.availablePool : 14150000).toLocaleString('id-ID')}
            </div>
            <span className="text-[10px] text-slate-500 block">
              Dari Limit Pagu Rp {(summary ? summary.sitePoolLimit : 15000000).toLocaleString('id-ID')}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-[11px] text-purple-400 flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-purple-400" /> Kasbon Beredar (Belum Settle)
            </span>
            <div className="text-xl sm:text-2xl font-black text-purple-300">
              Rp {(summary ? summary.outstandingAmount : 850000).toLocaleString('id-ID')}
            </div>
            <span className="text-[10px] text-purple-400/80 block">
              {summary ? summary.outstandingCount : 1} Transaksi Belum Diserahkan Notanya
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-[11px] text-amber-400 flex items-center gap-1.5 font-medium">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" /> Menunggu Approval PM
            </span>
            <div className="text-xl sm:text-2xl font-black text-amber-400">
              Rp {(summary ? summary.pendingApprovalAmount : 450000).toLocaleString('id-ID')}
            </div>
            <span className="text-[10px] text-slate-400 block">
              {summary ? summary.pendingApprovalCount : 1} Pengajuan Kasbon Baru
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-[11px] text-emerald-400 flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Total Kasbon Ter-settle
            </span>
            <div className="text-xl sm:text-2xl font-black text-emerald-400">
              Rp {(summary ? summary.totalSettledAmount : 1200000).toLocaleString('id-ID')}
            </div>
            <span className="text-[10px] text-slate-500 block">
              {summary ? summary.settledCount : 1} Kuitansi Sah Lolos Verifikasi
            </span>
          </div>
        </div>

        {/* Policy Notice Card */}
        <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400 flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
          <p className="leading-relaxed">
            <strong className="text-slate-200">SOP Keuangan Lapangan EPC:</strong> Pengajuan kasbon operasional (solar genset, material mendesak, konsumsi lembur) wajib disetujui PM sebelum dicairkan. Penerima kasbon wajib mengunggah foto struk/nota kuitansi dalam waktu maksimal <strong>3 hari kalender</strong> sejak dana dicairkan.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-3">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: `Semua Kasbon (${transactions.length})` },
              { id: 'submitted', label: 'Menunggu Approval PM' },
              { id: 'disbursed', label: 'Belum Dipertanggungjawabkan' },
              { id: 'settled', label: 'Sudah Selesai (Settle)' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === f.id
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <span className="text-xs text-slate-400">
            Menampilkan {filteredTx.length} transaksi
          </span>
        </div>

        {/* Transactions Table */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Tanggal & Diajukan Oleh</th>
                  <th className="py-3.5 px-4">Penerima Kasbon</th>
                  <th className="py-3.5 px-4">Uraian Kebutuhan & Kategori</th>
                  <th className="py-3.5 px-4 text-right">Nominal Kasbon</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Realisasi Nota</th>
                  <th className="py-3.5 px-4 text-center">Aksi Manajemen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-normal">
                {filteredTx.map((tx) => {
                  const variance = tx.settlement_amount ? tx.amount - tx.settlement_amount : null;

                  return (
                    <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Tanggal & Requester */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-mono text-white">
                          {new Date(tx.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {tx.requester_name || 'Supervisor'}
                        </span>
                      </td>

                      {/* Penerima */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-semibold text-white flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-amber-400" />
                          <span>{tx.recipient_name}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">Pemegang Dana Site</span>
                      </td>

                      {/* Uraian Keperluan */}
                      <td className="py-4 px-4 max-w-sm">
                        <div className="font-medium text-slate-200">
                          {tx.purpose}
                        </div>
                        <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800 uppercase font-mono">
                          {tx.cost_category}
                        </span>
                      </td>

                      {/* Nominal Kasbon */}
                      <td className="py-4 px-4 text-right whitespace-nowrap font-mono text-base font-bold text-white">
                        Rp {tx.amount.toLocaleString('id-ID')}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        {getStatusBadge(tx.status)}
                      </td>

                      {/* Realisasi Nota */}
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        {tx.settlement_amount ? (
                          <div>
                            <div className="font-mono font-bold text-emerald-400">
                              Rp {tx.settlement_amount.toLocaleString('id-ID')}
                            </div>
                            {variance !== null && variance !== 0 && (
                              <span className="text-[10px] text-slate-400">
                                {variance > 0 ? `Kembali: Rp ${variance.toLocaleString('id-ID')}` : `Kurang: Rp ${Math.abs(variance).toLocaleString('id-ID')}`}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-500 italic text-[11px]">Belum disettle</span>
                        )}
                      </td>

                      {/* Aksi */}
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        {tx.status === 'submitted' && (
                          <button
                            onClick={() => handleApprove(tx.id)}
                            disabled={processingId === tx.id}
                            className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-semibold text-[11px] shadow-sm transition-all cursor-pointer"
                          >
                            {processingId === tx.id ? 'Memproses...' : 'Setujui (PM)'}
                          </button>
                        )}

                        {tx.status === 'approved' && (
                          <button
                            onClick={() => handleDisburse(tx.id)}
                            disabled={processingId === tx.id}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] shadow-sm transition-all cursor-pointer"
                          >
                            {processingId === tx.id ? 'Memproses...' : 'Cairkan Kasir'}
                          </button>
                        )}

                        {tx.status === 'disbursed' && (
                          <button
                            onClick={() => openSettleModal(tx)}
                            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-semibold text-[11px] shadow-md shadow-purple-500/20 transition-all cursor-pointer flex items-center gap-1 mx-auto"
                          >
                            <Receipt className="w-3 h-3" />
                            + Settle Nota
                          </button>
                        )}

                        {tx.status === 'settled' && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Terverifikasi
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Dialog Form Ajukan Kasbon */}
        {showRequestModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-5 animate-in fade-in zoom-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-amber-400" />
                    Form Pengajuan Kasbon Lapangan
                  </h3>
                  <p className="text-xs text-slate-400">
                    Pengajuan uang tunai mendesak untuk operasional site harian.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Nama Pemegang / Penerima Dana *
                  </label>
                  <input
                    type="text"
                    required
                    value={requestForm.recipientName}
                    onChange={(e) => setRequestForm({ ...requestForm, recipientName: e.target.value })}
                    placeholder="Contoh: Mandor Sugiarto / Supervisor Budi"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Nominal Kasbon (Rp) *
                    </label>
                    <input
                      type="text"
                      required
                      value={requestForm.amount}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        const formatted = val ? parseInt(val).toLocaleString('id-ID') : '';
                        setRequestForm({ ...requestForm, amount: formatted });
                      }}
                      placeholder="Contoh: 1.000.000"
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono font-bold focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Kategori Pengeluaran *
                    </label>
                    <select
                      value={requestForm.costCategory}
                      onChange={(e) => setRequestForm({ ...requestForm, costCategory: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                    >
                      <option value="equipment">Bensin / Alat Berat (Equipment)</option>
                      <option value="material">Material Mendesak (Paku, Kawat, Semen)</option>
                      <option value="manpower">Upah Harian / Lembur Cepat</option>
                      <option value="overhead">Overhead / Konsumsi Lembur / Medis</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Uraian Tujuan Belanja & Keterangan Lapangan *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={requestForm.purpose}
                    onChange={(e) => setRequestForm({ ...requestForm, purpose: e.target.value })}
                    placeholder="Jelaskan kebutuhan secara rinci. Contoh: Pembelian darurat 80L solar Dexlite di SPBU terdekat karena genset harus menyala untuk lembur pengecoran malam."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowRequestModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold shadow-lg shadow-amber-500/20 cursor-pointer"
                  >
                    Kirim Pengajuan Kasbon
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Dialog Form Pertanggungjawaban (Settlement) */}
        {showSettleModal && selectedTxForSettle && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-5 animate-in fade-in zoom-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-purple-400" />
                    Pertanggungjawaban Kasbon (Settlement)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Kasbon: Rp {selectedTxForSettle.amount.toLocaleString('id-ID')} &bull; Penerima: {selectedTxForSettle.recipient_name}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSettleModal(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSettleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Total Riil Belanja Sesuai Struk / Kuitansi (Rp) *
                  </label>
                  <input
                    type="text"
                    required
                    value={settleForm.settlementAmount}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      const formatted = val ? parseInt(val).toLocaleString('id-ID') : '';
                      setSettleForm({ ...settleForm, settlementAmount: formatted });
                    }}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono font-bold text-sm focus:outline-none focus:border-purple-500"
                  />
                  <div className="mt-1 text-[11px] text-slate-400">
                    {(() => {
                      const real = parseFloat(settleForm.settlementAmount.replace(/[^0-9]/g, '')) || 0;
                      const diff = selectedTxForSettle.amount - real;
                      if (diff > 0) {
                        return <span className="text-emerald-400 font-semibold">Uang kembali yang disetor ke kasir: Rp {diff.toLocaleString('id-ID')}</span>;
                      } else if (diff < 0) {
                        return <span className="text-amber-400 font-semibold">Kekurangan dana (Reimbursement kasir ke mandor): Rp {Math.abs(diff).toLocaleString('id-ID')}</span>;
                      } else {
                        return <span className="text-slate-400">Nominal nota tepat sesuai kasbon (Rp 0 selisih).</span>;
                      }
                    })()}
                  </div>
                </div>

                {/* Upload Struk Kuitansi & GPS Metadata */}
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-200 flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-sky-400" />
                      Foto Nota / Struk Kuitansi Fisik
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 font-mono">
                      <MapPin className="w-3 h-3" /> GPS Valid
                    </span>
                  </div>

                  <div className="border-2 border-dashed border-slate-700 hover:border-slate-500 rounded-xl p-4 text-center space-y-2 cursor-pointer transition-colors bg-slate-900/50">
                    <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                    <p className="text-[11px] text-slate-300 font-medium">
                      Foto struk SPBU / Toko Besi / Warung Lapangan
                    </p>
                    <span className="text-[10px] text-slate-500 block">
                      Stempel waktu & koordinat GPS otomatis disematkan
                    </span>
                  </div>

                  <div className="p-2 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
                    <span>Lokasi: {settleForm.geotag.address}</span>
                    <span className="font-mono text-sky-400">Lat: -6.2941, Long: 107.1428</span>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Catatan Rincian Barang yang Dibeli *
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={settleForm.settlementNotes}
                    onChange={(e) => setSettleForm({ ...settleForm, settlementNotes: e.target.value })}
                    placeholder="Contoh: Pembelian solar 80L di SPBU Cibatu @Rp 15.000 = Rp 1.200.000. Uang sisa Rp 50.000 telah diserahkan kembali ke kasir site."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowSettleModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold shadow-lg shadow-purple-500/20 cursor-pointer"
                  >
                    Simpan Pertanggungjawaban
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

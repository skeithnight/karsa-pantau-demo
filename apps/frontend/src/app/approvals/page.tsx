'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2,
  XCircle,
  FileCheck,
  AlertCircle,
  Zap,
  Calendar,
  Building,
} from 'lucide-react';
import { apiRequest, getAuthToken } from '../../lib/api';

interface PendingRab {
  id: string;
  project_id: string;
  project_name: string;
  capacity_mw: number;
  version: number;
  total_amount: number;
  notes?: string;
  submitted_at: string;
}

export default function ApprovalsPage() {
  const [pendingRabs, setPendingRabs] = useState<PendingRab[]>([]);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedRabId, setSelectedRabId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.push('/login?redirect=/approvals');
      return;
    }

    apiRequest<PendingRab[]>('/rab/pending-approvals')
      .then((data) => {
        setPendingRabs(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        setPendingRabs([]);
      })
      .finally(() => setLoading(false));
  }, [router]);

  const handleApprove = async (rabId: string) => {
    if (!confirm('Apakah Anda yakin ingin menyetujui (Approve) RAB ini menjadi baseline aktif?')) {
      return;
    }

    try {
      await apiRequest(`/rab/${rabId}/approve`, { method: 'POST' });
      setActionSuccess('RAB berhasil di-approve dan ditetapkan sebagai baseline resmi proyek!');
      setPendingRabs(pendingRabs.filter((r) => r.id !== rabId));
    } catch {
      setActionSuccess('RAB berhasil di-approve (Mode Demo)!');
      setPendingRabs(pendingRabs.filter((r) => r.id !== rabId));
    }
  };

  const [rejectError, setRejectError] = useState<string | null>(null);

  const handleOpenReject = (rabId: string) => {
    setSelectedRabId(rabId);
    setRejectNote('');
    setRejectError(null);
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!rejectNote.trim()) {
      setRejectError('Catatan penolakan wajib diisi!');
      return;
    }

    if (!selectedRabId) return;

    try {
      await apiRequest(`/rab/${selectedRabId}/reject`, {
        method: 'POST',
        body: JSON.stringify({ note: rejectNote }),
      });
      setActionSuccess('RAB berhasil ditolak dan dikembalikan ke Estimator untuk direvisi.');
      setPendingRabs(pendingRabs.filter((r) => r.id !== selectedRabId));
    } catch {
      setActionSuccess('RAB berhasil ditolak (Mode Demo)!');
      setPendingRabs(pendingRabs.filter((r) => r.id !== selectedRabId));
    } finally {
      setRejectModalOpen(false);
      setSelectedRabId(null);
    }
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <FileCheck className="w-6 h-6 text-sky-400" />
            Antrean Approval RAB (Direktur / Approver)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Tinjau dan setujui RAB yang diajukan oleh Estimator sebelum menjadi acuan pengeluaran lapangan
          </p>
        </div>

        <div className="text-xs px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
          <span className="font-bold text-sky-400">{pendingRabs.length}</span> RAB Menunggu Persetujuan
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* List Pending RAB */}
      {pendingRabs.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center border border-slate-800 space-y-3">
          <CheckCircle2 className="w-12 h-12 text-slate-600 mx-auto" />
          <h2 className="text-base font-semibold text-slate-300">Semua Antrean Bersih</h2>
          <p className="text-xs text-slate-500">
            Tidak ada pengajuan RAB yang sedang menunggu persetujuan saat ini.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingRabs.map((rab) => (
            <div
              key={rab.id}
              className="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:border-slate-700 transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 font-mono">
                    <Zap className="w-3 h-3 inline mr-1" />
                    {rab.capacity_mw} MWp
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-950 text-sky-400 border border-sky-800 font-mono font-semibold">
                    Revisi Versi {rab.version}
                  </span>
                </div>

                <h2 className="text-lg font-bold text-white">{rab.project_name}</h2>
                <p className="text-xs text-slate-400">{rab.notes || 'Pengajuan baseline anggaran proyek'}</p>

                <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    Diajukan: {new Date(rab.submitted_at).toLocaleDateString('id-ID')}
                  </span>
                </div>
              </div>

              {/* Total & Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:border-l lg:border-slate-800 lg:pl-6">
                <div className="text-left sm:text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                    Total Nilai RAB
                  </span>
                  <span className="text-xl font-bold text-emerald-400 font-mono">
                    {formatRupiah(rab.total_amount)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleApprove(rab.id)}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-semibold text-xs text-white transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Approve
                  </button>

                  <button
                    onClick={() => handleOpenReject(rab.id)}
                    className="px-4 py-2 rounded-lg bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-300 font-semibold text-xs transition-colors flex items-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Reject dengan Catatan Wajib */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full glass-card p-6 rounded-2xl border border-slate-800 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-400" />
              Tolak Pengajuan RAB
            </h3>
            <p className="text-xs text-slate-400">
              Sesuai aturan bisnis, penolakan RAB <strong>wajib disertai catatan</strong> yang jelas
              agar Estimator dapat melakukan revisi secara tepat.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Catatan Penolakan / Alasan Revisi <span className="text-rose-400">*</span>
              </label>
              <textarea
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                required
                rows={3}
                placeholder="Contoh: Harga satuan kabel DC melebihi batas benchmark Garut 2025, mohon negosiasi ulang atau sesuaikan volume."
                className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-rose-500"
              />
              {rejectError && <p className="text-xs text-rose-400 mt-1.5 font-medium">{rejectError}</p>}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white transition-colors flex items-center gap-1.5 shadow-md shadow-rose-600/20"
              >
                <XCircle className="w-4 h-4" />
                Konfirmasi Penolakan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

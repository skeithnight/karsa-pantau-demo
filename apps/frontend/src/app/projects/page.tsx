'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Layers,
  Plus,
  MapPin,
  Zap,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Building2,
  X,
  Loader2,
  Sparkles,
  DollarSign,
  Calendar,
} from 'lucide-react';
import { apiRequest, getAuthToken, getActiveOrganization } from '../../lib/api';

interface Project {
  id: string;
  name: string;
  location: string;
  category?: string;
  capacityMw?: number;
  status: 'planning' | 'ongoing' | 'completed';
  totalRab: number;
  totalActual: number;
  variancePct: number;
  physicalProgressPct: number;
  createdAt: string;
}

const DEFAULT_DEMO_PROJECTS: Project[] = [
  {
    id: 'demo-p1',
    name: 'Pembangunan Gedung Fasilitas & MEP Cikarang',
    location: 'Cikarang, Jawa Barat',
    category: 'Gedung & Komersial',
    status: 'ongoing',
    totalRab: 2450000000,
    totalActual: 2300000000,
    variancePct: 6.5,
    physicalProgressPct: 78.5,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-p2',
    name: 'Pekerjaan Struktur & Jembatan Tol Cisumdawu',
    location: 'Sumedang, Jawa Barat',
    category: 'Infrastruktur & Sipil',
    status: 'ongoing',
    totalRab: 18500000000,
    totalActual: 8200000000,
    variancePct: -12.4,
    physicalProgressPct: 45.0,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-p3',
    name: 'PLTS Cirata Terapung 50MW / Energi Terbarukan',
    location: 'Purwakarta, Jawa Barat',
    category: 'Energi & Utilitas',
    capacityMw: 50.0,
    status: 'ongoing',
    totalRab: 45000000000,
    totalActual: 6100000000,
    variancePct: -4.5,
    physicalProgressPct: 14.2,
    createdAt: new Date().toISOString(),
  },
];

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Create Project Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Gedung & Komersial',
    location: '',
    capacityMw: '1.0',
    estimatedBudget: '',
    targetCodDate: '',
  });

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.push('/login?redirect=/projects');
      return;
    }

    const org = getActiveOrganization();
    const isDemo = typeof window !== 'undefined' && localStorage.getItem('karsa_demo_mode') === 'true';

    apiRequest<{ data: Project[] }>('/projects')
      .then((res) => {
        if (res && Array.isArray(res.data)) {
          if (res.data.length > 0) {
            setProjects(res.data);
          } else if (org?.slug === 'karsa-solar' || isDemo) {
            setProjects(DEFAULT_DEMO_PROJECTS);
          } else {
            setProjects([]);
          }
        }
      })
      .catch(() => {
        if (org?.slug === 'karsa-solar' || isDemo) {
          setProjects(DEFAULT_DEMO_PROJECTS);
        } else {
          setProjects([]);
        }
      })
      .finally(() => setLoading(false));
  }, [router]);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.location.trim()) {
      setFormError('Nama proyek dan lokasi wajib diisi.');
      return;
    }

    setSubmitting(true);
    setFormError(null);

    const payload = {
      name: formData.name.trim(),
      location: formData.location.trim(),
      capacityMw: parseFloat(formData.capacityMw) || 1.0,
      targetCodDate: formData.targetCodDate || undefined,
    };

    try {
      const res = await apiRequest<any>('/projects', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const newProjId = res?.id || `proj-${Date.now()}`;
      const newProjItem: Project = {
        id: newProjId,
        name: formData.name.trim(),
        location: formData.location.trim(),
        category: formData.category,
        capacityMw: parseFloat(formData.capacityMw) || 1.0,
        status: 'planning',
        totalRab: parseFloat(formData.estimatedBudget) || 0,
        totalActual: 0,
        variancePct: 0,
        physicalProgressPct: 0,
        createdAt: new Date().toISOString(),
      };

      setProjects([newProjItem, ...projects]);
      setSuccessNotice(`Proyek "${newProjItem.name}" berhasil dibuat! Mengarahkan ke RAB Builder...`);
      setShowCreateModal(false);
      setTimeout(() => {
        router.push(`/projects/${newProjId}/rab/new`);
      }, 1000);
    } catch (err: any) {
      // Tampilkan error inline tanpa window.alert()
      setFormError(
        err.message || 'Gagal menyimpan proyek ke server pusat. Anda dapat tetap menyimpannya di sesi kerja ini.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveDemoLocally = () => {
    if (!formData.name.trim() || !formData.location.trim()) {
      setFormError('Nama proyek dan lokasi wajib diisi.');
      return;
    }

    const newProjId = `demo-local-${Date.now()}`;
    const newProjItem: Project = {
      id: newProjId,
      name: formData.name.trim(),
      location: formData.location.trim(),
      category: formData.category,
      capacityMw: parseFloat(formData.capacityMw) || 1.0,
      status: 'planning',
      totalRab: parseFloat(formData.estimatedBudget) || 0,
      totalActual: 0,
      variancePct: 0,
      physicalProgressPct: 0,
      createdAt: new Date().toISOString(),
    };

    setProjects([newProjItem, ...projects]);
    setShowCreateModal(false);
    setSuccessNotice(`Proyek "${newProjItem.name}" berhasil ditambahkan ke portofolio! Mengarahkan ke RAB Builder...`);
    setTimeout(() => {
      router.push(`/projects/${newProjId}/rab/new`);
    }, 1000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-sky-400" />
            Portofolio Proyek Konstruksi & EPC
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Monitoring anggaran, realisasi biaya, dan progres fisik seluruh proyek gedung, infrastruktur, MEP, dan industri
          </p>
        </div>

        <div>
          <button
            type="button"
            onClick={() => {
              setFormError(null);
              setShowCreateModal(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 font-semibold text-xs text-white transition-all shadow-lg shadow-sky-600/20 flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Proyek Baru</span>
          </button>
        </div>
      </div>

      {successNotice && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Grid Proyek */}
      {loading ? (
        <div className="flex items-center justify-center p-20">
          <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
        </div>
      ) : projects.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 border border-slate-800 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mb-4">
            <Building2 className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Belum Ada Proyek Aktif</h3>
          <p className="text-sm text-slate-400 max-w-md mb-6">
            Organisasi Anda belum memiliki proyek konstruksi terdaftar. Mulai kelola pagu anggaran, WBS, Kurva S, dan approval dengan membuat proyek pertama Anda.
          </p>
          <button
            type="button"
            onClick={() => {
              setFormError(null);
              setShowCreateModal(true);
            }}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold text-sm shadow-lg shadow-sky-500/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Proyek Pertama</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {projects.map((proj) => {
            const isOverbudget = proj.variancePct > 0;
            return (
              <div
                key={proj.id}
                className="glass-card glass-card-hover rounded-2xl p-6 border border-slate-800 flex flex-col justify-between"
              >
                <div>
                  {/* Status & Sektor */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-300 border border-sky-500/30">
                      <Building2 className="w-3.5 h-3.5 text-sky-400" />
                      {proj.category || (proj.capacityMw ? `${proj.capacityMw} MWp` : 'EPC & Konstruksi')}
                    </span>

                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider ${
                        proj.status === 'ongoing'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : proj.status === 'completed'
                          ? 'bg-sky-950 text-sky-300 border border-sky-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}
                    >
                      {proj.status}
                    </span>
                  </div>

                  {/* Nama & Lokasi Proyek */}
                  <h3 className="text-lg font-bold text-white mb-1.5">{proj.name}</h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5 mb-5">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    {proj.location}
                  </p>

                  {/* Metrik Finansial */}
                  <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800 mb-5">
                    <div>
                      <span className="text-[11px] text-slate-400 block uppercase font-medium">Pagu Anggaran RAB</span>
                      <span className="text-sm font-bold text-white font-mono">{formatRupiah(proj.totalRab)}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block uppercase font-medium">Realisasi Lapangan</span>
                      <span className="text-sm font-bold text-emerald-400 font-mono">
                        {formatRupiah(proj.totalActual)}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5 mb-5">
                    <div className="flex justify-between text-xs text-slate-400 font-medium">
                      <span>Progres Fisik Aktual</span>
                      <span className="text-sky-400 font-bold">{proj.physicalProgressPct}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-sky-500 to-emerald-400 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(proj.physicalProgressPct, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Card */}
                <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {isOverbudget ? (
                      <span className="text-xs text-rose-400 font-semibold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        +{proj.variancePct}% Overbudget
                      </span>
                    ) : (
                      <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5" />
                        {proj.variancePct}% On Track
                      </span>
                    )}
                  </div>

                  <Link
                    href={`/projects/${proj.id}`}
                    className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-white transition-colors border border-slate-700"
                  >
                    Buka Dashboard &rarr;
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Form Tambah Proyek Baru */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-xl rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-950 border border-sky-800 flex items-center justify-center text-sky-400">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Tambah Proyek Konstruksi Baru</h3>
                  <p className="text-xs text-slate-400">Inisialisasi baseline proyek untuk pembuatan RAB & monitoring</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/80 text-xs text-rose-300 space-y-2">
                <div className="flex items-center gap-2 font-semibold">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                  <span>{formError}</span>
                </div>
                <div className="pt-2 border-t border-rose-900/60 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveDemoLocally}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 font-semibold text-[11px] transition-all"
                  >
                    Tetap Lanjutkan di Sesi Portofolio Ini &rarr;
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleCreateProject} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold">Nama Proyek *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pembangunan Fasilitas Gudang Logistik Gresik"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-semibold">Sektor / Pilar Industri</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-sky-500 transition-colors cursor-pointer"
                  >
                    <option value="Gedung & Komersial">Gedung & Komersial</option>
                    <option value="Infrastruktur & Sipil">Infrastruktur & Sipil</option>
                    <option value="Mekanikal Elektrikal (MEP)">Mekanikal Elektrikal (MEP)</option>
                    <option value="Energi & Utilitas">Energi & Utilitas</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-semibold">Lokasi Proyek *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Gresik, Jawa Timur"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-semibold">Estimasi Pagu Anggaran (IDR)</label>
                  <input
                    type="number"
                    placeholder="Contoh: 5000000000"
                    value={formData.estimatedBudget}
                    onChange={(e) => setFormData({ ...formData, estimatedBudget: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-semibold">Target COD / Selesai</label>
                  <input
                    type="date"
                    value={formData.targetCodDate}
                    onChange={(e) => setFormData({ ...formData, targetCodDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-sky-500 transition-colors"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold shadow-lg shadow-sky-600/20 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  <span>Buat Proyek & Mulai Susun RAB</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

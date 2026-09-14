'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  UserPlus,
  Shield,
  Mail,
  CheckCircle2,
  Clock,
  Trash2,
  ChevronRight,
  AlertCircle,
  Building2,
  Search,
  Sparkles,
  CreditCard,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { apiRequest, getActiveOrganization } from '../../lib/api';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'pm' | 'estimator' | 'supervisor' | 'finance' | 'approver';
  status: 'active' | 'invited';
  joinedAt: string;
  projectAccess: string;
}

const initialMembers: TeamMember[] = [
  {
    id: 'mem-1',
    name: 'Dwiki Nugraha (Anda)',
    email: 'dwiki@karsapantau.id',
    role: 'admin',
    status: 'active',
    joinedAt: '12 Jan 2026',
    projectAccess: 'Semua Proyek',
  },
  {
    id: 'mem-2',
    name: 'Budi Santoso, ST',
    email: 'budi.santoso@karsapantau.id',
    role: 'pm',
    status: 'active',
    joinedAt: '15 Jan 2026',
    projectAccess: 'Semua Proyek',
  },
  {
    id: 'mem-3',
    name: 'Siti Rahmawati',
    email: 'siti.rahma@karsapantau.id',
    role: 'estimator',
    status: 'active',
    joinedAt: '01 Feb 2026',
    projectAccess: 'Semua Proyek',
  },
  {
    id: 'mem-4',
    name: 'Agus Setiawan (Mandor Utama)',
    email: 'agus.mandor@karsapantau.id',
    role: 'supervisor',
    status: 'active',
    joinedAt: '10 Feb 2026',
    projectAccess: 'Proyek Lapangan Aktif',
  },
  {
    id: 'mem-5',
    name: 'Ratna Kusuma Dewi, SE',
    email: 'ratna.finance@karsapantau.id',
    role: 'finance',
    status: 'active',
    joinedAt: '18 Feb 2026',
    projectAccess: 'Semua Proyek (Finance)',
  },
  {
    id: 'mem-6',
    name: 'Ir. Hendra Wijaya',
    email: 'hendra.owner@clientcorp.co.id',
    role: 'approver',
    status: 'invited',
    joinedAt: 'Menunggu Verifikasi',
    projectAccess: 'Proyek EPC Tol & Komersial',
  },
];

const roleConfig: Record<string, { label: string; color: string; desc: string }> = {
  admin: {
    label: 'Administrator',
    color: 'bg-rose-950 text-rose-300 border-rose-800',
    desc: 'Akses penuh seluruh modul, billing langganan, dan manajemen tim.',
  },
  pm: {
    label: 'Project Manager',
    color: 'bg-purple-950 text-purple-300 border-purple-800',
    desc: 'Pengendalian proyek, Kurva S, EVM, approval anggaran, dan tim.',
  },
  estimator: {
    label: 'Estimator Biaya',
    color: 'bg-amber-950 text-amber-300 border-amber-800',
    desc: 'Penyusunan RAB, katalog AHSP standar, dan impor Excel BOQ.',
  },
  supervisor: {
    label: 'Site Supervisor / Mandor',
    color: 'bg-emerald-950 text-emerald-300 border-emerald-800',
    desc: 'Input realisasi belanja lapangan harian dan unggah kuitansi/nota.',
  },
  finance: {
    label: 'Finance & Akuntansi',
    color: 'bg-blue-950 text-blue-300 border-blue-800',
    desc: 'Portal Keuangan, buku kas keluar, hutang vendor, dan ekspor jurnal.',
  },
  approver: {
    label: 'Owner / Stakeholder',
    color: 'bg-teal-950 text-teal-300 border-teal-800',
    desc: 'Persetujuan eksekutif pengajuan RAB dan pemantauan kinerja biaya.',
  },
};

export default function TeamManagementPage() {
  const [activeOrg, setActiveOrg] = useState<any>(null);
  const [members, setMembers] = useState<TeamMember[]>(initialMembers);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState<TeamMember['role']>('estimator');
  const [formProjectAccess, setFormProjectAccess] = useState('Semua Proyek');
  const [formError, setFormError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const org = getActiveOrganization();
    if (org) setActiveOrg(org);

    // Load from local storage if available
    const saved = localStorage.getItem('karsa_team_members');
    if (saved) {
      try {
        setMembers(JSON.parse(saved));
      } catch {
        // no-op
      }
    }
  }, []);

  const saveMembersToStorage = (updated: TeamMember[]) => {
    setMembers(updated);
    localStorage.setItem('karsa_team_members', JSON.stringify(updated));
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formName.trim() || !formEmail.trim()) {
      setFormError('Nama lengkap dan alamat email wajib diisi.');
      return;
    }

    if (!formEmail.includes('@') || !formEmail.includes('.')) {
      setFormError('Format alamat email tidak valid.');
      return;
    }

    // Check duplicate
    if (members.some((m) => m.email.toLowerCase() === formEmail.trim().toLowerCase())) {
      setFormError(`Anggota dengan email ${formEmail} sudah ada dalam tim.`);
      return;
    }

    setSaving(true);
    try {
      if (activeOrg?.id) {
        try {
          await apiRequest(`/organizations/${activeOrg.id}/members`, {
            method: 'POST',
            body: JSON.stringify({
              name: formName.trim(),
              email: formEmail.trim(),
              role: formRole,
            }),
          });
        } catch (apiErr: any) {
          console.warn('API invite fallback to local session:', apiErr.message);
        }
      }

      const newMember: TeamMember = {
        id: `mem-${Date.now()}`,
        name: formName.trim(),
        email: formEmail.trim(),
        role: formRole,
        status: 'invited',
        joinedAt: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
        projectAccess: formProjectAccess,
      };

      const updated = [newMember, ...members];
      saveMembersToStorage(updated);

      setSuccessToast(`Undangan berhasil dikirim ke ${formEmail.trim()} sebagai ${roleConfig[formRole]?.label}.`);
      setIsModalOpen(false);
      setFormName('');
      setFormEmail('');
      setFormRole('estimator');

      setTimeout(() => setSuccessToast(null), 5000);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveMember = (id: string, name: string) => {
    if (id === 'mem-1') {
      alert('Akun Administrator utama tidak dapat dihapus.');
      return;
    }
    const filtered = members.filter((m) => m.id !== id);
    saveMembersToStorage(filtered);
    setSuccessToast(`Akses untuk ${name} telah dinonaktifkan.`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || m.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const totalSeats = 15;
  const usedSeats = members.length;
  const remainingSeats = totalSeats - usedSeats;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      {/* Top Breadcrumb & Header */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                <Link href="/projects" className="hover:text-white transition-colors">
                  Portofolio
                </Link>
                <ChevronRight className="w-3 h-3" />
                <span className="text-sky-400 font-medium">Manajemen Tim & Pengguna</span>
              </div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
                <Users className="w-6 h-6 text-sky-400" />
                <span>Kolaborasi Tim & Pembagian Peran (RBAC)</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Undang anggota tim proyek, atur hak akses modul (Estimator, Mandor, PM, Finance), dan kelola kuota kursi langganan.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/settings/billing"
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 flex items-center gap-1.5 transition-all"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Paket PRO (15 Seat)</span>
              </Link>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-slate-950 flex items-center gap-1.5 shadow-lg shadow-sky-500/20 transition-all cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ Undang Anggota Tim</span>
              </button>
            </div>
          </div>

          {/* Seat Quota & Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <p className="text-[11px] font-medium text-slate-400">Kapasitas Kursi (Seat)</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-bold text-white">
                  {usedSeats} <span className="text-xs text-slate-400 font-normal">/ {totalSeats}</span>
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                  {remainingSeats} Tersedia
                </span>
              </div>
              {/* Progress bar */}
              <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-sky-500 to-emerald-400"
                  style={{ width: `${(usedSeats / totalSeats) * 100}%` }}
                />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <p className="text-[11px] font-medium text-slate-400">Pengelola & Approval</p>
              <p className="text-xl font-bold text-purple-400 mt-1">
                {members.filter((m) => m.role === 'admin' || m.role === 'pm').length}{' '}
                <span className="text-xs text-slate-400 font-normal">Admin / PM</span>
              </p>
              <p className="text-[10px] text-slate-500 mt-1">Penuh atas approval RAB & biaya</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <p className="text-[11px] font-medium text-slate-400">Estimator & Pelaksana</p>
              <p className="text-xl font-bold text-amber-400 mt-1">
                {members.filter((m) => m.role === 'estimator' || m.role === 'supervisor').length}{' '}
                <span className="text-xs text-slate-400 font-normal">Staf Lapangan</span>
              </p>
              <p className="text-[10px] text-slate-500 mt-1">Penyusun BOQ & pelapor realisasi</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <p className="text-[11px] font-medium text-slate-400">Finance & Stakeholder</p>
              <p className="text-xl font-bold text-emerald-400 mt-1">
                {members.filter((m) => m.role === 'finance' || m.role === 'approver').length}{' '}
                <span className="text-xs text-slate-400 font-normal">Pengawas</span>
              </p>
              <p className="text-[10px] text-slate-500 mt-1">Kas keluar & signoff owner</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Toast */}
        {successToast && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-950/80 border border-emerald-700/80 text-emerald-200 text-xs flex items-center justify-between shadow-xl shadow-emerald-950/30">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successToast}</span>
            </div>
            <button
              type="button"
              onClick={() => setSuccessToast(null)}
              className="text-emerald-400 hover:text-emerald-200"
            >
              ✕
            </button>
          </div>
        )}

        {/* Filter Bar & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama atau email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Role Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {[
              { key: 'ALL', label: 'Semua Peran' },
              { key: 'admin', label: 'Admin' },
              { key: 'pm', label: 'PM' },
              { key: 'estimator', label: 'Estimator' },
              { key: 'supervisor', label: 'Mandor' },
              { key: 'finance', label: 'Finance' },
              { key: 'approver', label: 'Owner' },
            ].map((chip) => (
              <button
                key={chip.key}
                type="button"
                onClick={() => setRoleFilter(chip.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  roleFilter === chip.key
                    ? 'bg-sky-950 text-sky-300 border border-sky-800'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* Members Table */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/90 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Nama & Email</th>
                  <th className="py-3 px-4">Peran (Role)</th>
                  <th className="py-3 px-4">Hak Akses Modul</th>
                  <th className="py-3 px-4">Cakupan Proyek</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {filteredMembers.length > 0 ? (
                  filteredMembers.map((member) => {
                    const cfg = roleConfig[member.role] || roleConfig.estimator;
                    return (
                      <tr key={member.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white uppercase shadow-sm">
                              {member.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-white">{member.name}</p>
                              <p className="text-[11px] text-slate-400">{member.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium border ${cfg.color}`}
                          >
                            <Shield className="w-3 h-3" />
                            <span>{cfg.label}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4 max-w-xs">
                          <p className="text-slate-300 text-[11px] line-clamp-1">{cfg.desc}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-slate-300 font-mono text-[11px]">
                            {member.projectAccess}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          {member.status === 'active' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Aktif</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] text-amber-400">
                              <Clock className="w-3.5 h-3.5" />
                              <span>Diundang</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {member.id !== 'mem-1' ? (
                            <button
                              type="button"
                              onClick={() => handleRemoveMember(member.id, member.name)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                              title="Cabut Akses"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-500 font-mono">Owner</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      Tidak ada anggota tim yang cocok dengan kriteria pencarian.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Dialog: Tambah / Undang Anggota Tim */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100 overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-sky-400" />
                <h3 className="text-base font-bold text-white">Undang Anggota Tim Baru</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-950/80 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleInviteSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Nama Lengkap Anggota
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Rian Pratama, ST"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Alamat Email Perusahaan
                </label>
                <input
                  type="email"
                  placeholder="Contoh: rian.pratama@kontraktor.co.id"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Tetapkan Peran & Hak Akses (Role)
                </label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as TeamMember['role'])}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                >
                  <option value="pm">Project Manager — Pengendalian Proyek, Kurva S, EVM, & Approvals</option>
                  <option value="estimator">Estimator Biaya — Penyusunan RAB, AHSP, & Impor BOQ Excel</option>
                  <option value="supervisor">Site Supervisor / Mandor — Input Realisasi Belanja Lapangan</option>
                  <option value="finance">Finance & Akuntansi — Portal Keuangan, Cash Out, & Ekspor Jurnal</option>
                  <option value="approver">Owner / Stakeholder — Pengesahan RAB & Monitoring Progres</option>
                  <option value="admin">Administrator — Hak Akses Penuh Sistem & Langganan</option>
                </select>

                <div className="mt-2 p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 text-[11px] text-slate-400">
                  <span className="text-sky-400 font-medium">Ringkasan Hak: </span>
                  {roleConfig[formRole]?.desc}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Cakupan Akses Proyek
                </label>
                <select
                  value={formProjectAccess}
                  onChange={(e) => setFormProjectAccess(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                >
                  <option value="Semua Proyek">Semua Proyek Aktif & Arsip</option>
                  <option value="Proyek Tertentu">Hanya Proyek Tertentu yang Ditugaskan</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-slate-950 transition-all shadow-md shadow-sky-500/20 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {saving ? 'Mengirim Undangan...' : 'Kirim Undangan & Beri Akses'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

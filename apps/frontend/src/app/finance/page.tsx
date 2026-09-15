'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  TrendingUp,
  Download,
  FileSpreadsheet,
  Building2,
  Calendar,
  Filter,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Receipt,
  Users,
} from 'lucide-react';

import { apiRequest, getActiveOrganization } from '../../lib/api';

interface JournalEntry {
  id: string;
  date: string;
  invoiceNo: string;
  projectName: string;
  vendor: string;
  wbsCode: string;
  category: 'MATERIAL' | 'LABOR' | 'EQUIPMENT' | 'SUBCON';
  amount: number;
  paymentStatus: 'PAID' | 'PENDING_30D';
}

const MOCK_JOURNAL_ENTRIES: JournalEntry[] = [
  {
    id: 'tx-001',
    date: '2026-09-12',
    invoiceNo: 'INV-ST-8821',
    projectName: 'Pembangunan Gedung Fasilitas & MEP Cikarang',
    vendor: 'PT Semen Tiga Roda Beton',
    wbsCode: '1.0 Pekerjaan Struktur Beton K-300',
    category: 'MATERIAL',
    amount: 145000000,
    paymentStatus: 'PAID',
  },
  {
    id: 'tx-002',
    date: '2026-09-10',
    invoiceNo: 'KWT-MND-09',
    projectName: 'Pembangunan Gedung Fasilitas & MEP Cikarang',
    vendor: 'Mandor Suparno (Upah Harian Tukang)',
    wbsCode: '1.0 Pekerjaan Struktur Beton K-300',
    category: 'LABOR',
    amount: 38500000,
    paymentStatus: 'PAID',
  },
  {
    id: 'tx-003',
    date: '2026-09-08',
    invoiceNo: 'INV-KBL-441',
    projectName: 'Pembangunan Gedung Fasilitas & MEP Cikarang',
    vendor: 'PT Supreme Cable Distributor',
    wbsCode: '2.0 Pekerjaan Elektrikal & Panel Feeder',
    category: 'MATERIAL',
    amount: 210000000,
    paymentStatus: 'PENDING_30D',
  },
  {
    id: 'tx-004',
    date: '2026-09-05',
    invoiceNo: 'INV-CRN-018',
    projectName: 'Pekerjaan Struktur & Jembatan Tol Cisumdawu',
    vendor: 'PT Daya Rental Alat Berat',
    wbsCode: '1.2 Sewa Mobile Crane 50 Ton (2 Minggu)',
    category: 'EQUIPMENT',
    amount: 85000000,
    paymentStatus: 'PAID',
  },
  {
    id: 'tx-005',
    date: '2026-09-01',
    invoiceNo: 'KWT-SB-004',
    projectName: 'Pekerjaan Struktur & Jembatan Tol Cisumdawu',
    vendor: 'CV Mandiri Subkon Bored Pile',
    wbsCode: '1.1 Pekerjaan Pondasi Bored Pile Titik P-12',
    category: 'SUBCON',
    amount: 195000000,
    paymentStatus: 'PENDING_30D',
  },
  {
    id: 'tx-006',
    date: '2026-08-28',
    invoiceNo: 'INV-PV-901',
    projectName: 'PLTS Cirata Terapung 50MW / Energi Terbarukan',
    vendor: 'PT Surya Panel Global',
    wbsCode: '2.1 Pengadaan Modul Surya 550Wp Batch 1',
    category: 'MATERIAL',
    amount: 4500000000,
    paymentStatus: 'PAID',
  },
  {
    id: 'tx-007',
    date: '2026-08-25',
    invoiceNo: 'INV-INV-332',
    projectName: 'PLTS Cirata Terapung 50MW / Energi Terbarukan',
    vendor: 'PT Power Inverter Indonesia',
    wbsCode: '2.3 Central Inverter 2.5MW Unit 1',
    category: 'EQUIPMENT',
    amount: 500000000,
    paymentStatus: 'PAID',
  },
];

export default function FinancePortalPage() {
  const [selectedProject, setSelectedProject] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [projectsList, setProjectsList] = useState<any[]>([]);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [totalContract, setTotalContract] = useState<number>(0);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  React.useEffect(() => {
    const org = getActiveOrganization();

    async function loadFinanceData() {
      try {
        const res = await apiRequest('/projects');
        const projs = res.data || [];
        setProjectsList(projs);

        const rabSum = projs.reduce((acc: number, p: any) => acc + (parseFloat(p.totalRab) || 0), 0);
        setTotalContract(rabSum > 0 ? rabSum : 0);

        if (org?.slug === 'karsa-solar') {
          setEntries(MOCK_JOURNAL_ENTRIES);
          setTotalContract(65951500000);
        } else {
          setEntries([]);
        }
      } catch (err) {
        console.warn('Gagal memuat data keuangan:', err);
        if (org?.slug === 'karsa-solar') {
          setEntries(MOCK_JOURNAL_ENTRIES);
          setTotalContract(65951500000);
        } else {
          setEntries([]);
        }
      }
    }

    loadFinanceData();
  }, []);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const filteredEntries = entries.filter((e) => {
    const matchProj = selectedProject === 'ALL' || e.projectName.includes(selectedProject);
    const matchCat = selectedCategory === 'ALL' || e.category === selectedCategory;
    return matchProj && matchCat;
  });

  const totalActualCashOut = filteredEntries.reduce((acc, curr) => acc + curr.amount, 0);
  const totalAccountsPayable = filteredEntries
    .filter((e) => e.paymentStatus === 'PENDING_30D')
    .reduce((acc, curr) => acc + curr.amount, 0);
  const effectiveContract = totalContract > 0 ? totalContract : (totalActualCashOut > 0 ? totalActualCashOut * 1.25 : 0);
  const grossMargin = effectiveContract > 0 ? effectiveContract - totalActualCashOut : 0;
  const grossMarginPct = effectiveContract > 0 ? Math.round((grossMargin / effectiveContract) * 100) : 0;

  const handleExportCsv = () => {
    const headers = ['Tanggal', 'Nomor Bukti', 'Nama Proyek', 'Vendor / Penerima', 'Pos WBS', 'Kategori', 'Nominal (IDR)', 'Status Pembayaran'];
    const rows = filteredEntries.map((e) => [
      e.date,
      e.invoiceNo,
      `"${e.projectName}"`,
      `"${e.vendor}"`,
      `"${e.wbsCode}"`,
      e.category,
      e.amount,
      e.paymentStatus === 'PAID' ? 'LUNAS' : 'TEMPO 30 HARI',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `jurnal_pengeluaran_karsa_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportNotice('File Jurnal Akuntansi (.CSV) berhasil diunduh. Format siap diimpor langsung ke SAP, Accurate, atau Zahir.');
    setTimeout(() => setExportNotice(null), 5000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800/80 text-xs font-semibold text-emerald-400 mb-2">
            <DollarSign className="w-3.5 h-3.5" />
            <span>Portal Keuangan & Akuntansi Konstruksi</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
            Pengendalian Kas Keluar & Rekap Jurnal
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Monitoring Gross Margin proyek, hutang tempo vendor (Accounts Payable), dan ekspor data siap impor software akuntansi.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCsv}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-semibold text-xs text-white transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor Jurnal (.CSV / Excel)</span>
          </button>
        </div>
      </div>

      {exportNotice && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* 4 Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            Total Pagu Kontrak (Baseline)
          </span>
          <div className="text-xl font-bold text-white font-mono">{formatRupiah(totalContract)}</div>
          <p className="text-[11px] text-slate-500">Nilai kontrak disahkan owner</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            Total Kas Keluar (Cash Out)
          </span>
          <div className="text-xl font-bold text-sky-400 font-mono">{formatRupiah(totalActualCashOut)}</div>
          <p className="text-[11px] text-slate-400">Realisasi belanja material & upah</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-2">
          <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block">
            Hutang Vendor (Accounts Payable)
          </span>
          <div className="text-xl font-bold text-amber-400 font-mono">{formatRupiah(totalAccountsPayable)}</div>
          <p className="text-[11px] text-amber-500/80">Nota tempo belum jatuh tempo</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-2">
          <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block">
            Proyeksi Gross Margin
          </span>
          <div className="text-xl font-bold text-emerald-400 font-mono">
            {grossMarginPct}% <span className="text-xs font-normal text-slate-400">({formatRupiah(grossMargin)})</span>
          </div>
          <p className="text-[11px] text-emerald-400/80">Margin laba kotor portofolio</p>
        </div>
      </div>

      {/* Filter & Data Table */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">Buku Jurnal Pengeluaran Realisasi Proyek</h2>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400">Proyek:</span>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
              >
                <option value="ALL" className="bg-slate-900">Semua Proyek</option>
                {projectsList.map((p) => (
                  <option key={p.id} value={p.name} className="bg-slate-900">
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              <span className="text-slate-400">Kategori:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
              >
                <option value="ALL" className="bg-slate-900">Semua Kategori</option>
                <option value="MATERIAL" className="bg-slate-900">Material</option>
                <option value="LABOR" className="bg-slate-900">Upah (Labor)</option>
                <option value="EQUIPMENT" className="bg-slate-900">Alat Berat</option>
                <option value="SUBCON" className="bg-slate-900">Subkontraktor</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-900/60 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-3">Tanggal</th>
                <th className="py-3 px-3">No. Bukti / Nota</th>
                <th className="py-3 px-3">Proyek</th>
                <th className="py-3 px-3">Vendor / Pihak Penerima</th>
                <th className="py-3 px-3">Pos WBS Pekerjaan</th>
                <th className="py-3 px-3">Kategori</th>
                <th className="py-3 px-3 text-right">Nominal Transaksi</th>
                <th className="py-3 px-3 text-center">Status Bayar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400">
                    <Receipt className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-slate-300">Belum Ada Catatan Transaksi</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      Belum ada pencatatan pengeluaran riil atau invoice vendor untuk proyek di organisasi ini.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredEntries.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="py-3 px-3 font-mono text-slate-400 whitespace-nowrap">{row.date}</td>
                  <td className="py-3 px-3 font-mono text-sky-400 font-semibold">{row.invoiceNo}</td>
                  <td className="py-3 px-3 text-slate-200 font-medium max-w-[200px] truncate">{row.projectName}</td>
                  <td className="py-3 px-3 text-slate-300">{row.vendor}</td>
                  <td className="py-3 px-3 text-slate-400 max-w-[200px] truncate">{row.wbsCode}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        row.category === 'MATERIAL'
                          ? 'bg-sky-950 text-sky-300'
                          : row.category === 'LABOR'
                          ? 'bg-emerald-950 text-emerald-300'
                          : row.category === 'EQUIPMENT'
                          ? 'bg-amber-950 text-amber-300'
                          : 'bg-purple-950 text-purple-300'
                      }`}
                    >
                      {row.category}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-white whitespace-nowrap">
                    {formatRupiah(row.amount)}
                  </td>
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    {row.paymentStatus === 'PAID' ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-semibold inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        Lunas
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-semibold inline-flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-400" />
                        Tempo 30H
                      </span>
                    )}
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

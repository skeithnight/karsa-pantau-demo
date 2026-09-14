'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Database,
  Plus,
  FileSpreadsheet,
  UploadCloud,
  Download,
  Search,
  Filter,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Building2,
  Layers,
  ChevronRight,
  Sparkles,
  DollarSign,
  Briefcase,
  Wrench,
  Users,
  Calendar,
  Loader2,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { getActiveOrganization } from '../../lib/api';

interface CatalogItem {
  id: string;
  itemCode: string;
  description: string;
  category: 'material' | 'upah' | 'alat' | 'subkon';
  workPackage: string;
  unit: string;
  unitPrice: number;
  sourceType: 'vendor' | 'project_history' | 'pupr_sni';
  vendorOrSourceName: string;
  location?: string;
  updatedAt: string;
}

const defaultCatalogSeed: CatalogItem[] = [
  {
    id: 'cat-1',
    itemCode: 'MAT-CIV-01',
    description: 'Beton Ready Mix Mutu K-300 / fc 25 MPa Struktur Kolom & Balok',
    category: 'material',
    workPackage: 'CIVIL',
    unit: 'm3',
    unitPrice: 1150000,
    sourceType: 'vendor',
    vendorOrSourceName: 'PT SCG Readymix Indonesia',
    location: 'Jawa Barat & Banten',
    updatedAt: '10 Sep 2026',
  },
  {
    id: 'cat-2',
    itemCode: 'MAT-CIV-02',
    description: 'Besi Beton Ulir BJTD-40 Diameter D16 - D25 Panjang 12m SNI',
    category: 'material',
    workPackage: 'CIVIL',
    unit: 'kg',
    unitPrice: 16800,
    sourceType: 'vendor',
    vendorOrSourceName: 'PT Krakatau Steel Tbk',
    location: 'Cilegon, Banten',
    updatedAt: '05 Sep 2026',
  },
  {
    id: 'cat-3',
    itemCode: 'MAT-CIV-03',
    description: 'Pasangan Dinding Bata Ringan (Hebel) Tebal 10cm Grade A',
    category: 'material',
    workPackage: 'CIVIL',
    unit: 'm2',
    unitPrice: 145000,
    sourceType: 'vendor',
    vendorOrSourceName: 'PT Broco Aerated Concrete',
    location: 'Jabodetabek',
    updatedAt: '28 Agu 2026',
  },
  {
    id: 'cat-4',
    itemCode: 'MAT-EL-01',
    description: 'Kabel Power NYY 4x16 mm2 0.6/1kV Tembaga Cu/PVC/PVC',
    category: 'material',
    workPackage: 'ELECTRICAL_AC',
    unit: 'meter',
    unitPrice: 145000,
    sourceType: 'vendor',
    vendorOrSourceName: 'PT Supreme Cable (Kabelindo)',
    location: 'Jakarta',
    updatedAt: '02 Sep 2026',
  },
  {
    id: 'cat-5',
    itemCode: 'MAT-EL-02',
    description: 'Modul Surya PV Monokristalin Tier-1 Bifacial 550Wp',
    category: 'material',
    workPackage: 'ELECTRICAL_DC',
    unit: 'unit',
    unitPrice: 1650000,
    sourceType: 'project_history',
    vendorOrSourceName: 'Histori Proyek Cirata EPC 2025',
    location: 'Purwakarta',
    updatedAt: '15 Agu 2026',
  },
  {
    id: 'cat-6',
    itemCode: 'EQP-EL-01',
    description: 'Inverter String On-Grid 50 kW 3-Phase Smart Grid Support',
    category: 'alat',
    workPackage: 'ELECTRICAL_AC',
    unit: 'unit',
    unitPrice: 62000000,
    sourceType: 'vendor',
    vendorOrSourceName: 'Sungrow / Huawei Authorized Distributor',
    location: 'Surabaya',
    updatedAt: '12 Sep 2026',
  },
  {
    id: 'cat-7',
    itemCode: 'LAB-CIV-01',
    description: 'Upah Mandor Lapangan / Site Inspector Konstruksi Sipil',
    category: 'upah',
    workPackage: 'CIVIL',
    unit: 'mandays',
    unitPrice: 220000,
    sourceType: 'pupr_sni',
    vendorOrSourceName: 'Standar Upah PUPR 2024 Wilayah I',
    location: 'Nasional',
    updatedAt: '01 Jan 2026',
  },
  {
    id: 'cat-8',
    itemCode: 'LAB-CIV-02',
    description: 'Upah Tukang Batu / Tukang Besi / Tukang Kayu Berpengalaman',
    category: 'upah',
    workPackage: 'CIVIL',
    unit: 'mandays',
    unitPrice: 180000,
    sourceType: 'pupr_sni',
    vendorOrSourceName: 'Standar Upah PUPR 2024 Wilayah I',
    location: 'Nasional',
    updatedAt: '01 Jan 2026',
  },
  {
    id: 'cat-9',
    itemCode: 'LAB-CIV-03',
    description: 'Upah Pekerja / Kenek Lapangan Harian',
    category: 'upah',
    workPackage: 'CIVIL',
    unit: 'mandays',
    unitPrice: 140000,
    sourceType: 'pupr_sni',
    vendorOrSourceName: 'Standar Upah PUPR 2024 Wilayah I',
    location: 'Nasional',
    updatedAt: '01 Jan 2026',
  },
  {
    id: 'cat-10',
    itemCode: 'EQP-CIV-01',
    description: 'Sewa Excavator Komatsu Standard Bucket 0.8 m3 + Solar & Operator',
    category: 'alat',
    workPackage: 'CIVIL',
    unit: 'jam',
    unitPrice: 450000,
    sourceType: 'vendor',
    vendorOrSourceName: 'PT Surya Rental Alat Berat',
    location: 'Jawa Barat',
    updatedAt: '04 Sep 2026',
  },
  {
    id: 'cat-11',
    itemCode: 'EQP-CIV-02',
    description: 'Sewa Mobile Crane 25 Ton Erection Rangka Baja & Pondasi',
    category: 'alat',
    workPackage: 'CIVIL',
    unit: 'hari',
    unitPrice: 8500000,
    sourceType: 'vendor',
    vendorOrSourceName: 'PT Berdikari Heavy Equipment',
    location: 'Jawa Timur',
    updatedAt: '08 Sep 2026',
  },
  {
    id: 'cat-12',
    itemCode: 'MAT-MEP-01',
    description: 'Pipa Air Bersih PVC AW Diameter 4 Inch Rucika / Wavin SNI',
    category: 'material',
    workPackage: 'CIVIL',
    unit: 'meter',
    unitPrice: 115000,
    sourceType: 'vendor',
    vendorOrSourceName: 'PT Wahana Duta Persada',
    location: 'Jabodetabek',
    updatedAt: '30 Agu 2026',
  },
  {
    id: 'cat-13',
    itemCode: 'SUB-CIV-01',
    description: 'Subkon Pekerjaan Tiang Pancang Spun Pile Dia. 400mm L=12m',
    category: 'subkon',
    workPackage: 'CIVIL',
    unit: 'titik',
    unitPrice: 3850000,
    sourceType: 'project_history',
    vendorOrSourceName: 'Histori Proyek Jembatan Cisumdawu 2025',
    location: 'Sumedang',
    updatedAt: '12 Jan 2026',
  },
];

const categoryLabels: Record<string, { label: string; badge: string; icon: any }> = {
  material: {
    label: 'Material / Bahan',
    badge: 'bg-sky-950 text-sky-300 border-sky-800',
    icon: Layers,
  },
  upah: {
    label: 'Upah (Manpower)',
    badge: 'bg-amber-950 text-amber-300 border-amber-800',
    icon: Users,
  },
  alat: {
    label: 'Alat Berat & Mesin',
    badge: 'bg-purple-950 text-purple-300 border-purple-800',
    icon: Wrench,
  },
  subkon: {
    label: 'Subkontraktor / Jasa',
    badge: 'bg-emerald-950 text-emerald-300 border-emerald-800',
    icon: Briefcase,
  },
};

export default function CatalogPage() {
  const [items, setItems] = useState<CatalogItem[]>(defaultCatalogSeed);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedSource, setSelectedSource] = useState('ALL');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Manual Add Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formCode, setFormCode] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formCat, setFormCat] = useState<CatalogItem['category']>('material');
  const [formUnit, setFormUnit] = useState('unit');
  const [formPrice, setFormPrice] = useState<number | ''>('');
  const [formSourceType, setFormSourceType] = useState<CatalogItem['sourceType']>('vendor');
  const [formSourceName, setFormSourceName] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Excel / CSV State
  const [importing, setImporting] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('karsa_catalog_items');
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch {
        // no-op
      }
    }
  }, []);

  const saveToStorage = (updated: CatalogItem[]) => {
    setItems(updated);
    localStorage.setItem('karsa_catalog_items', JSON.stringify(updated));
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Manual Add Submit
  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formDesc.trim() || !formPrice || Number(formPrice) <= 0) {
      setFormError('Deskripsi barang/pekerjaan dan harga satuan wajib diisi dengan benar.');
      return;
    }

    const newItem: CatalogItem = {
      id: `cat-${Date.now()}`,
      itemCode: formCode.trim() || `ITM-${items.length + 1}`,
      description: formDesc.trim(),
      category: formCat,
      workPackage: 'CIVIL',
      unit: formUnit.trim() || 'unit',
      unitPrice: Number(formPrice),
      sourceType: formSourceType,
      vendorOrSourceName: formSourceName.trim() || 'Vendor Rekanan',
      location: formLocation.trim() || 'Indonesia',
      updatedAt: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
    };

    const updated = [newItem, ...items];
    saveToStorage(updated);
    setIsModalOpen(false);
    setFormCode('');
    setFormDesc('');
    setFormPrice('');
    setFormSourceName('');
    setFormLocation('');

    setToastMsg({
      type: 'success',
      text: `Item "${newItem.description}" berhasil ditambahkan ke Katalog Harga.`,
    });
    setTimeout(() => setToastMsg(null), 5000);
  };

  // Delete item
  const handleDelete = (id: string, name: string) => {
    const filtered = items.filter((i) => i.id !== id);
    saveToStorage(filtered);
    setToastMsg({
      type: 'success',
      text: `Item "${name}" dihapus dari pustaka.`,
    });
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Download Catalog Template
  const handleDownloadTemplate = () => {
    const csvContent =
      'Kode Item,Deskripsi Pekerjaan / Material,Kategori (material/upah/alat/subkon),Satuan,Harga Satuan,Nama Vendor / Sumber Asal,Lokasi Kota\n' +
      'MAT-01,Beton Ready Mix K-350 Cor Struktur,material,m3,1250000,PT Pionirbeton Industri,Jabodetabek\n' +
      'MAT-02,Semen Portland Composite (PCC) 50kg,material,sak,72000,Toko Bangunan Sumber Rejeki,Bandung\n' +
      'LAB-01,Upah Tukang Pipa / Plumber Harian,upah,mandays,175000,Mandor Subkon MEP,Surabaya\n' +
      'EQP-01,Sewa Genset Silent 100 kVA + BBM,alat,hari,1800000,PT Sewa Power Mandiri,Semarang\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'Template_Katalog_Harga_Vendor_Karsa.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Excel / CSV File Ingestion
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

        if (!rows || rows.length === 0) {
          setToastMsg({ type: 'error', text: 'File Excel kosong atau tidak memiliki data.' });
          setImporting(false);
          return;
        }

        const newParsed: CatalogItem[] = [];
        let index = items.length + 1;

        for (const r of rows) {
          const keys = Object.keys(r);
          const findKey = (patterns: string[]) =>
            keys.find((k) => patterns.some((p) => k.toLowerCase().replace(/[^a-z0-9]/g, '').includes(p))) || '';

          const codeK = findKey(['kode', 'kodeitem', 'itemcode']);
          const descK = findKey(['deskripsi', 'uraian', 'namabarang', 'material', 'pekerjaan', 'item']);
          const catK = findKey(['kategori', 'category', 'jenis']);
          const unitK = findKey(['satuan', 'unit', 'sat']);
          const priceK = findKey(['harga', 'hargasatuan', 'tarif', 'price']);
          const vendorK = findKey(['vendor', 'supplier', 'sumber', 'toko', 'proyek']);
          const locK = findKey(['lokasi', 'kota', 'wilayah', 'daerah']);

          const descVal = String(r[descK] || '').trim();
          if (!descVal) continue;

          const priceVal = parseFloat(String(r[priceK]).replace(/[^0-9.-]/g, '')) || 0;

          // Categorization
          let catVal: CatalogItem['category'] = 'material';
          const catLower = String(r[catK] || '').toLowerCase();
          if (catLower.includes('upah') || catLower.includes('tenaga') || catLower.includes('manpower') || catLower.includes('labor')) {
            catVal = 'upah';
          } else if (catLower.includes('alat') || catLower.includes('sewa') || catLower.includes('machin') || catLower.includes('equipment')) {
            catVal = 'alat';
          } else if (catLower.includes('subkon') || catLower.includes('jasa')) {
            catVal = 'subkon';
          }

          newParsed.push({
            id: `cat-imp-${Date.now()}-${index++}`,
            itemCode: String(r[codeK] || `IMP-${index}`).trim(),
            description: descVal,
            category: catVal,
            workPackage: 'CIVIL',
            unit: String(r[unitK] || 'unit').trim(),
            unitPrice: priceVal,
            sourceType: 'vendor',
            vendorOrSourceName: String(r[vendorK] || file.name.replace(/\.[^/.]+$/, '')).trim(),
            location: String(r[locK] || 'Indonesia').trim(),
            updatedAt: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
          });
        }

        if (newParsed.length === 0) {
          setToastMsg({ type: 'error', text: 'Tidak ada baris harga yang valid ditemukan dalam file Excel.' });
        } else {
          const updated = [...newParsed, ...items];
          saveToStorage(updated);
          setToastMsg({
            type: 'success',
            text: `Sukses mengimpor ${newParsed.length} item katalog harga dari file "${file.name}"!`,
          });
        }
      } catch (err: any) {
        setToastMsg({ type: 'error', text: `Gagal membaca Excel: ${err.message}` });
      } finally {
        setImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setTimeout(() => setToastMsg(null), 6000);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // Export full catalog as CSV
  const handleExportCatalog = () => {
    let csv = 'Kode Item,Deskripsi,Kategori,Satuan,Harga Satuan,Vendor/Sumber,Lokasi,Tanggal\n';
    items.forEach((i) => {
      csv += `"${i.itemCode}","${i.description.replace(/"/g, '""')}","${i.category}","${i.unit}",${i.unitPrice},"${i.vendorOrSourceName.replace(/"/g, '""')}","${i.location || ''}","${i.updatedAt}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Katalog_Harga_Karsa_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredItems = items.filter((item) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      item.description.toLowerCase().includes(q) ||
      item.itemCode.toLowerCase().includes(q) ||
      item.vendorOrSourceName.toLowerCase().includes(q) ||
      (item.location || '').toLowerCase().includes(q);

    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchesSource = selectedSource === 'ALL' || item.sourceType === selectedSource;

    return matchesSearch && matchesCategory && matchesSource;
  });

  const countMaterial = items.filter((i) => i.category === 'material').length;
  const countUpah = items.filter((i) => i.category === 'upah').length;
  const countAlat = items.filter((i) => i.category === 'alat').length;
  const countSubkon = items.filter((i) => i.category === 'subkon').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      {/* Top Header */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                <Link href="/projects" className="hover:text-white transition-colors">
                  Portofolio
                </Link>
                <ChevronRight className="w-3 h-3" />
                <span className="text-sky-400 font-medium">Master Data & Referensi</span>
              </div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
                <Database className="w-6 h-6 text-sky-400" />
                <span>Katalog Harga & Histori RAB Vendor</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Database harga historis material, upah (manpower), sewa alat berat, dan daftar harga supplier untuk estimasi cerdas AI.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
                title="Unduh Contoh Format Excel/CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Template Excel</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={importing}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow-md shadow-emerald-600/20 disabled:opacity-50 transition-all cursor-pointer"
              >
                {importing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Mengimpor...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>+ Upload Excel / Pricelist</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-slate-950 flex items-center gap-1.5 shadow-lg shadow-sky-500/20 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Tambah Item Manual</span>
              </button>
            </div>
          </div>

          {/* Metric Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span>Total Item Pustaka</span>
                <Database className="w-3.5 h-3.5 text-sky-400" />
              </div>
              <p className="text-xl font-bold text-white mt-1">{items.length} Item</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Terindeks untuk pencarian AI</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span>Material & Fabrikasi</span>
                <Layers className="w-3.5 h-3.5 text-sky-400" />
              </div>
              <p className="text-xl font-bold text-sky-400 mt-1">{countMaterial} Material</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Besi, beton, kabel, pipa</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span>Upah (Manpower)</span>
                <Users className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <p className="text-xl font-bold text-amber-400 mt-1">{countUpah} Pos Upah</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Mandor, tukang, pekerja</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span>Alat Berat & Subkon</span>
                <Wrench className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <p className="text-xl font-bold text-purple-400 mt-1">{countAlat + countSubkon} Pos</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Excavator, crane, jasa bor</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Toast Alert */}
        {toastMsg && (
          <div
            className={`mb-6 p-4 rounded-xl border text-xs flex items-center justify-between shadow-xl ${
              toastMsg.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-700 text-emerald-200 shadow-emerald-950/30'
                : 'bg-rose-950/90 border-rose-700 text-rose-200 shadow-rose-950/30'
            }`}
          >
            <div className="flex items-center gap-2">
              {toastMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{toastMsg.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setToastMsg(null)}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        )}

        {/* Filter and Search Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 mb-6">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama barang, kode, supplier, atau kota..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {/* Category Filter */}
            <div className="flex items-center gap-1">
              {[
                { key: 'ALL', label: 'Semua Kategori' },
                { key: 'material', label: 'Material' },
                { key: 'upah', label: 'Upah (Manpower)' },
                { key: 'alat', label: 'Alat Berat' },
                { key: 'subkon', label: 'Subkon' },
              ].map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setSelectedCategory(c.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === c.key
                      ? 'bg-sky-950 text-sky-300 border border-sky-800'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleExportCatalog}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 flex items-center gap-1.5 shrink-0"
              title="Ekspor Seluruh Katalog ke CSV"
            >
              <Download className="w-3 h-3" />
              <span>Ekspor CSV</span>
            </button>
          </div>
        </div>

        {/* Table of Items */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/90 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Kode Item</th>
                  <th className="py-3 px-4">Deskripsi / Spesifikasi Bahan</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4">Satuan</th>
                  <th className="py-3 px-4 text-right">Harga Satuan (IDR)</th>
                  <th className="py-3 px-4">Vendor / Sumber Data</th>
                  <th className="py-3 px-4">Lokasi</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => {
                    const catCfg = categoryLabels[item.category] || categoryLabels.material;
                    const CatIcon = catCfg.icon;

                    return (
                      <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-sky-400">
                          {item.itemCode}
                        </td>
                        <td className="py-3.5 px-4 max-w-sm">
                          <p className="font-medium text-white line-clamp-2">{item.description}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${catCfg.badge}`}
                          >
                            <CatIcon className="w-3 h-3" />
                            <span>{catCfg.label}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px]">
                            {item.unit}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400">
                          {formatRupiah(item.unitPrice)}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 text-slate-300">
                            <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span className="truncate max-w-[150px]">{item.vendorOrSourceName}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                          {item.location || '-'}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id, item.description)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Hapus dari Pustaka"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500">
                      Tidak ada item harga yang cocok dengan filter atau kata kunci.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Dialog: Tambah Item Manual */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100 overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-sky-400" />
                <h3 className="text-base font-bold text-white">Tambah Item Katalog Harga Baru</h3>
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
              <div className="mt-4 p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleManualAdd} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Kode Item</label>
                  <input
                    type="text"
                    placeholder="Contoh: MAT-CIV-10"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:border-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Kategori Biaya</label>
                  <select
                    value={formCat}
                    onChange={(e) => setFormCat(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-sky-500 focus:outline-none"
                  >
                    <option value="material">Material / Bahan Konstruksi</option>
                    <option value="upah">Upah Tenaga Kerja (Manpower)</option>
                    <option value="alat">Sewa Alat Berat & Mesin</option>
                    <option value="subkon">Subkontraktor / Jasa Spesialis</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">
                  Deskripsi / Spesifikasi Lengkap
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Semen Portland PCC 50kg SNI Tiga Roda / Holcim"
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Satuan (Unit)</label>
                  <input
                    type="text"
                    placeholder="m3, kg, m, mandays, unit, sak..."
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Harga Satuan (IDR)</label>
                  <input
                    type="number"
                    placeholder="Contoh: 75000"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:border-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Nama Vendor / Sumber Data</label>
                  <input
                    type="text"
                    placeholder="Contoh: PT Semen Tiga Roda / Toko Bangunan"
                    value={formSourceName}
                    onChange={(e) => setFormSourceName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Kota / Wilayah Proyek</label>
                  <input
                    type="text"
                    placeholder="Contoh: Surabaya, Jawa Timur"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold shadow-md shadow-sky-500/20 transition-all cursor-pointer"
                >
                  Simpan ke Katalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

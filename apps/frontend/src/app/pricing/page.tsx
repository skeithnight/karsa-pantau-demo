'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Check, Zap, Sparkles, Building2, Shield, ArrowRight } from 'lucide-react';

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const plans = [
    {
      code: 'TRIAL',
      name: 'Free Trial',
      description: 'Evaluasi fitur lengkap budgeting & Kurva S PLTS selama 14 hari tanpa kartu kredit.',
      priceMonthly: 0,
      priceYearly: 0,
      badge: 'Coba Gratis',
      features: [
        '1 Proyek Konstruksi PLTS',
        '3 Pengguna (PM, Estimator, Approver)',
        '50 Ekstraksi Struk OCR / Bulan',
        'Kalkulator EVM & Kurva S Otomatis',
        'Akses Aplikasi Lapangan PWA Offline',
      ],
      ctaText: 'Mulai Trial 14 Hari',
      ctaHref: '/register',
      popular: false,
    },
    {
      code: 'STARTER',
      name: 'Starter EPC',
      description: 'Untuk kontraktor dan installer PLTS atap yang mengelola hingga 3 proyek aktif.',
      priceMonthly: 1500000,
      priceYearly: 15000000,
      badge: 'Skala Kecil',
      features: [
        'Hingga 3 Proyek Aktif Simultan',
        '5 Pengguna Terdaftar',
        '150 Ekstraksi Struk OCR / Bulan',
        'Kalkulator EVM & Kurva S Otomatis',
        'Ekspor Laporan PDF & Excel',
        'Support Teknis via Email',
      ],
      ctaText: 'Pilih Starter',
      ctaHref: '/register?plan=STARTER',
      popular: false,
    },
    {
      code: 'PRO',
      name: 'Professional Developer',
      description: 'Solusi terlengkap untuk kontraktor EPC skala menengah dengan multi-tim lapangan.',
      priceMonthly: 4500000,
      priceYearly: 45000000,
      badge: 'Paling Populer',
      features: [
        'Hingga 15 Proyek Aktif Simultan',
        '25 Pengguna (Multi-Role Lapangan)',
        '1.000 Ekstraksi Struk OCR / Bulan',
        'Deteksi Anomali Biaya Real-Time',
        'Pencarian Harga Historis AHSP (Vector)',
        'Multi-Approval Workflow Direksi',
        'Prioritas Support WhatsApp & Email',
      ],
      ctaText: 'Mulai dengan Pro',
      ctaHref: '/register?plan=PRO',
      popular: true,
    },
    {
      code: 'ENTERPRISE',
      name: 'Enterprise Utility',
      description: 'Kapasitas tanpa batas untuk konsorsium pengembang PLTS utilitas (GW scale).',
      priceMonthly: 12000000,
      priceYearly: 120000000,
      badge: 'Skala Utilitas',
      features: [
        'Unlimited Proyek Aktif',
        'Unlimited Pengguna & Anggota',
        '5.000+ Ekstraksi Struk OCR / Bulan',
        'Custom Master Library AHSP',
        'Dedicated AI Throughput 9Router',
        'SLA Ketersediaan 99.9%',
        'Dedicated Account Manager 24/7',
      ],
      ctaText: 'Hubungi Sales',
      ctaHref: '/register?plan=ENTERPRISE',
      popular: false,
    },
  ];

  const formatRupiah = (val: number) => {
    if (val === 0) return 'Gratis';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="min-h-screen bg-slate-950 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-950/80 border border-sky-800/60 text-sky-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Paket Berlangganan B2B SaaS
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            Transparansi Biaya & Monitoring untuk <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-amber-400">Setiap Skala Proyek PLTS</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-400">
            Pilih paket yang sesuai dengan jumlah proyek aktif dan ukuran tim konstruksi Anda. Tanpa komitmen jangka panjang, upgrade kapan saja.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="mt-8 inline-flex items-center p-1 bg-slate-900 border border-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-sky-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Penagihan Bulanan
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                billingCycle === 'yearly'
                  ? 'bg-sky-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Penagihan Tahunan</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 font-bold">
                Hemat 2 Bulan
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((p) => {
            const price = billingCycle === 'yearly' ? p.priceYearly : p.priceMonthly;
            const periodLabel = p.priceMonthly === 0 ? '/ 14 hari' : billingCycle === 'yearly' ? '/ tahun' : '/ bulan';

            return (
              <div
                key={p.code}
                className={`relative rounded-2xl p-6 flex flex-col justify-between transition-all ${
                  p.popular
                    ? 'bg-slate-900/90 border-2 border-sky-500 shadow-2xl shadow-sky-500/10'
                    : 'bg-slate-900/40 border border-slate-800 hover:border-slate-700'
                }`}
              >
                {p.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-sky-500 text-slate-950 text-[11px] font-extrabold uppercase tracking-wider shadow-md">
                    {p.badge}
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-white">{p.name}</h3>
                    {!p.popular && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                        {p.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 min-h-[36px] mb-6">{p.description}</p>

                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl sm:text-3xl font-extrabold text-white">
                        {formatRupiah(price)}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">{periodLabel}</span>
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="space-y-3 pt-4 border-t border-slate-800 mb-8">
                    <p className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">
                      Fitur Termasuk:
                    </p>
                    {p.features.map((feat) => (
                      <div key={feat} className="flex items-start gap-2 text-xs text-slate-300">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Link
                  href={p.ctaHref}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5 transition-all ${
                    p.popular
                      ? 'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-lg shadow-sky-500/20'
                      : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                  }`}
                >
                  <span>{p.ctaText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

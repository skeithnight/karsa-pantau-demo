import './globals.css';
import React from 'react';
import { Providers } from '../components/Providers';
import { Navigation } from '../components/Navigation';

export const metadata = {
  title: 'Karsa Pantau — Sistem Manajemen Anggaran & Kontrol Realisasi Konstruksi (General EPC)',
  description: 'Platform Enterprise SaaS untuk RAB AHSP, Realisasi Biaya Lapangan, dan EVM Proyek Konstruksi Gedung, Infrastruktur, MEP, dan Energi Terbarukan.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen flex flex-col">
        <Providers>
          <Navigation />
          <main className="flex-1 w-full">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}

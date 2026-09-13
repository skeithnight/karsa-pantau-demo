# design.md — Spesifikasi Desain UI

Referensi fitur: lihat 04-modul-dan-fitur.md. Mockup visual awal sudah dibuat dalam sesi desain (dashboard, RAB builder, actual input) — dokumen ini mendeskripsikan strukturnya secara tertulis untuk implementasi.

## 1. Prinsip Desain

- Flat, bersih, minim dekorasi — prioritas keterbacaan angka finansial
- Warna dipakai untuk makna, bukan estetika: merah/oranye = peringatan biaya, biru = netral/informasi, abu-abu = struktural
- Mobile-first (PWA) — semua layar utama harus tetap fungsional di layar sempit (~380px)

## 2. Inventaris Layar

### 2.1 Dashboard Monitoring (`/projects/:id`)
- Header: nama proyek, nomor proyek, badge status (on track / over budget)
- 4 metric card: Total RAB, Realisasi, Varian, Progres fisik
- Breakdown RAB vs realisasi per kategori (progress bar per kategori, warna sesuai status: hijau/biru aman, kuning mendekati limit, merah over)
- Daftar alert AI (anomali, keterlambatan) — tiap alert punya ikon, teks singkat, link ke detail item
- Status tenaga kerja per tim (target vs aktual)
- Entry point ke Chat Assistant (floating button atau tab)

### 2.2 RAB Builder (`/projects/:id/rab/new`)
- Header: nama proyek target
- Form tambah item: kategori (dropdown), deskripsi (dengan AI search saat mengetik), volume, satuan, harga satuan
- Daftar item yang sudah ditambahkan (editable, bisa dihapus)
- Ringkasan total RAB real-time di bagian bawah
- Tombol "Simpan & ajukan approval"

### 2.3 Approval (`/approvals`)
- Daftar RAB berstatus `submitted`, terurut tanggal pengajuan
- Tiap baris: nama proyek, total RAB, tanggal ajuan, tombol approve/reject
- Reject membuka modal wajib isi catatan

### 2.4 Actual Input (`/projects/:id/actual/new`)
- Pilih item RAB terkait (dropdown/search)
- Banner peringatan otomatis bila item sudah mendekati/melebihi RAB
- Form: tanggal, vendor, deskripsi, qty, harga satuan aktual
- Upload bukti (drag-drop atau kamera di mobile) — trigger OCR opsional
- Ringkasan subtotal sebelum simpan

### 2.5 Manpower Tracker (`/projects/:id/manpower`)
- Daftar tim dengan target vs aktual headcount
- Input harian per tim
- Indikator gap (kurang/lebih/sesuai) per tim

### 2.6 Chat Assistant (panel/side sheet)
- Riwayat percakapan per proyek
- Input teks bebas, respons AI di-stream
- Setiap jawaban AI menyertakan referensi data yang dipakai (mis. "berdasarkan 3 entri realisasi minggu ini")

## 3. Navigasi

- Struktur utama: daftar proyek → detail proyek (dashboard sebagai landing) → tab/menu ke RAB, Actual, Manpower, Chat
- Approval sebagai menu terpisah di level atas (lintas proyek) khusus role Approver
- Bottom navigation untuk mobile PWA: Dashboard, RAB, Input, Chat, Profil

## 4. Catatan PWA

- Semua form (RAB Builder, Actual Input) harus tetap bisa diisi offline dan disimpan ke queue lokal — lihat 02-arsitektur-sistem.md §2
- Alert AI dan approval pending harus trigger push notification, bukan hanya badge di dalam app

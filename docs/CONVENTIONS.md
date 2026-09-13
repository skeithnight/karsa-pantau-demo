# CONVENTIONS.md — Coding Conventions

## 1. Struktur Folder

**Backend (NestJS), per domain module:**
```
src/
  modules/
    auth/
    projects/
    rab/
    actuals/
    manpower/
    ai/            # RAB search, anomaly, chat, ocr
    reports/
  common/          # guard, decorator, filter bersama
  database/        # migration, seed
```

**Frontend (Next.js):**
```
app/
  (dashboard)/projects/[id]/
  (dashboard)/approvals/
  components/
  lib/             # api client, hooks
  styles/
```

## 2. Penamaan

- File & folder: `kebab-case` (`rab-builder.tsx`, `actual-entries.service.ts`)
- Class & komponen React: `PascalCase`
- Variabel & fungsi: `camelCase`
- Tabel & kolom database: `snake_case` (lihat 03-skema-database.md)
- Enum status ditulis lowercase (`draft`, `submitted`, `approved`) — konsisten di DB, API, dan frontend, tidak boleh beda casing antar layer

## 3. Git Workflow

- Branch: `feature/<nama-fitur>`, `fix/<nama-bug>`, `chore/<deskripsi>`
- Commit message: format singkat `<tipe>: <deskripsi>` — tipe: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`
- Setiap PR wajib lulus CI (lint, unit test, integration test — lihat TESTING.md §7) sebelum merge
- Tidak ada commit langsung ke `main` — selalu lewat PR + review

## 4. Code Style

- Linting: ESLint + Prettier, konfigurasi dishare antara backend & frontend lewat root config
- TypeScript strict mode aktif di kedua project
- Tidak ada `any` tanpa justifikasi komentar — terutama di modul finansial (RAB, actuals) dan modul AI (parsing response)

## 5. Konvensi Khusus Domain

- Semua nilai uang disimpan & dihitung sebagai `numeric`/`decimal`, tidak pernah `float`, untuk menghindari rounding error
- Kalkulasi finansial (subtotal, variance, EVM) hanya boleh ada di satu tempat (service layer backend) — tidak diduplikasi logikanya di frontend selain untuk preview real-time (dan harus dites agar hasilnya identik dengan backend)
- Semua pemanggilan ke lapisan AI wajib lewat modul `modules/ai/`, tidak boleh ada service lain yang memanggil 9Router langsung (lihat AGENTS.md §Konvensi Penting)

## 6. Dokumentasi Kode

- Setiap modul AI (`modules/ai/*`) wajib punya komentar yang menjelaskan prompt/template yang dipakai dan alasan desainnya, merujuk ke `05-implementasi-ai.md`
- Perubahan skema database wajib disertai migration file bernama deskriptif, bukan `update1.sql`

import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { UserRole, ProjectStatus, RabStatus, BaselineType, WorkPackage, CostCategory } from '@karsa/shared-types';

dotenv.config();

async function seed() {
  const connectionString =
    process.env.DATABASE_URL ||
    'postgresql://karsa_user:karsa_local_password@localhost:5432/karsa_db?sslmode=disable';

  const pool = new Pool({ connectionString });
  console.log('Memulai proses seeding data contoh...');

  try {
    const passwordHash = await bcrypt.hash('Password123!', 10);

    // 1. Seed Users
    const users = [
      { name: 'Administrator Karsa', email: 'admin@karsapantau.id', role: UserRole.ADMIN },
      { name: 'Budi Santoso (PM)', email: 'pm@karsapantau.id', role: UserRole.PM },
      { name: 'Siti Rahma (Estimator)', email: 'estimator@karsapantau.id', role: UserRole.ESTIMATOR },
      { name: 'Ir. Hendra (Direktur/Approver)', email: 'approver@karsapantau.id', role: UserRole.APPROVER },
      { name: 'Agus Pratama (Site Supervisor)', email: 'supervisor@karsapantau.id', role: UserRole.SUPERVISOR },
    ];

    const userMap: Record<string, string> = {};
    for (const u of users) {
      const res = await pool.query(
        `INSERT INTO users (name, email, password_hash, role)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
         RETURNING id, role`,
        [u.name, u.email, passwordHash, u.role],
      );
      userMap[res.rows[0].role] = res.rows[0].id;
    }
    console.log('✓ Users berhasil di-seed.');

    // 2. Seed Sample Project
    const projRes = await pool.query(
      `INSERT INTO projects (name, location, capacity_mw, status, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      ['PLTS Cirata Terapung 50MW', 'Purwakarta, Jawa Barat', 50.0, ProjectStatus.ONGOING, userMap[UserRole.PM]],
    );
    const projectId = projRes.rows[0].id;
    console.log(`✓ Project PLTS Cirata Terapung 50MW berhasil di-seed (ID: ${projectId}).`);

    // 3. Seed Baseline RAB v1 (Approved)
    const rabRes = await pool.query(
      `INSERT INTO rab (project_id, version, baseline_type, status, total_amount, approved_by, approved_at)
       VALUES ($1, 1, $2, $3, $4, $5, now())
       RETURNING id`,
      [projectId, BaselineType.ORIGINAL_CONTRACT, RabStatus.APPROVED, 45000000000.0, userMap[UserRole.APPROVER]],
    );
    const rabId = rabRes.rows[0].id;

    // 4. Seed RAB Items (WBS)
    const items = [
      {
        wbs: '1.0',
        code: 'CIV-01',
        pkg: WorkPackage.CIVIL,
        cat: CostCategory.MATERIAL,
        desc: 'Floating Mounting Structure & Ponton HDPE',
        vol: 90000,
        unit: 'unit',
        price: 120000,
        weight: 24.0,
      },
      {
        wbs: '2.0',
        code: 'EL-DC-01',
        pkg: WorkPackage.ELECTRICAL_DC,
        cat: CostCategory.MATERIAL,
        desc: 'Modul PV Monokristalin Tier-1 550Wp',
        vol: 91000,
        unit: 'Wp',
        price: 285000,
        weight: 57.6,
      },
      {
        wbs: '2.1',
        code: 'EL-DC-02',
        pkg: WorkPackage.ELECTRICAL_DC,
        cat: CostCategory.MATERIAL,
        desc: 'Solar Cable PV1-F 4mm2 Black & Red',
        vol: 45000,
        unit: 'meter',
        price: 14500,
        weight: 1.45,
      },
      {
        wbs: '3.0',
        code: 'EL-AC-01',
        pkg: WorkPackage.ELECTRICAL_AC,
        cat: CostCategory.ALAT,
        desc: 'Central Inverter 2.5MW & Step-up Transformer 20kV',
        vol: 20,
        unit: 'unit',
        price: 320000000,
        weight: 14.22,
      },
      {
        wbs: '4.0',
        code: 'LAB-01',
        pkg: WorkPackage.CIVIL,
        cat: CostCategory.UPAH,
        desc: 'Upah Tenaga Kerja Instalasi Ponton & Racking',
        vol: 1200,
        unit: 'mandays',
        price: 250000,
        weight: 0.67,
      },
      {
        wbs: '5.0',
        code: 'MGT-01',
        pkg: WorkPackage.OVERHEAD_PERMITS,
        cat: CostCategory.OVERHEAD,
        desc: 'HSE / K3 Konstruksi, Pengujian Lingkungan & Perizinan',
        vol: 1,
        unit: 'lot',
        price: 935000000,
        weight: 2.06,
      },
    ];

    for (const it of items) {
      await pool.query(
        `INSERT INTO rab_items (rab_id, wbs_code, item_code, work_package, category, description, volume, unit, unit_price, weight_pct)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [rabId, it.wbs, it.code, it.pkg, it.cat, it.desc, it.vol, it.unit, it.price, it.weight],
      );

      // Seed historical repository
      await pool.query(
        `INSERT INTO rab_item_history (source_project_id, item_code, work_package, category, description, unit, unit_price)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [projectId, it.code, it.pkg, it.cat, it.desc, it.unit, it.price],
      );
    }
    console.log('✓ RAB Items & Historical Data berhasil di-seed.');

    // 5. Seed Project Progress Log (Kurva S)
    await pool.query(
      `INSERT INTO project_progress_logs (
         project_id, period_week, log_date, planned_progress_pct, actual_progress_pct,
         earned_value, actual_cost, cpi, spi, eac, notes, reported_by
       ) VALUES ($1, 4, CURRENT_DATE, 15.0, 14.2, 6390000000.0, 6100000000.0, 1.0475, 0.9467, 42959427207.0, 'Pemasangan ponton dan perakitan rangka modul berjalan lancar', $2)`,
      [projectId, userMap[UserRole.PM]],
    );
    console.log('✓ Project Progress Log & Kurva S berhasil di-seed.');

    // 6. Seed Manpower Logs
    await pool.query(
      `INSERT INTO manpower_logs (project_id, team_name, planned_headcount, actual_headcount, output_unit_installed, log_date, entered_by)
       VALUES ($1, 'Tim Perakitan Ponton Apung', 25, 24, 180, CURRENT_DATE, $2)`,
      [projectId, userMap[UserRole.SUPERVISOR]],
    );
    console.log('✓ Manpower Log berhasil di-seed.');

    console.log('\n--- DATA SEEDING SELESAI DENGAN SUKSES ---');
  } catch (error) {
    console.error('Error saat seeding data:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();

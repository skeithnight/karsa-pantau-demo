import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { WorkPackage, CostCategory } from '@karsa/shared-types';

describe('Karsa Pantau End-to-End (E2E) Critical Business Scenarios', () => {
  let app: INestApplication;
  let estimatorToken: string;
  let approverToken: string;
  let supervisorToken: string;
  let pmToken: string;
  let testProjectId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    await app.init();

    // 1. Dapatkan JWT token untuk setiap peranan (seeding sudah dilakukan)
    const loginRole = async (email: string) => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email, password: 'Password123!' });
      return res.body.accessToken;
    };

    estimatorToken = await loginRole('estimator@karsapantau.id');
    approverToken = await loginRole('approver@karsapantau.id');
    supervisorToken = await loginRole('supervisor@karsapantau.id');
    pmToken = await loginRole('pm@karsapantau.id');

    // 2. Buat proyek uji khusus untuk E2E suite
    const projRes = await request(app.getHttpServer())
      .post('/api/v1/projects')
      .set('Authorization', `Bearer ${pmToken}`)
      .send({
        name: 'PLTS E2E Test Suite 20MW',
        location: 'Garut, Jawa Barat',
        capacityMw: 20.0,
      });

    testProjectId = projRes.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('1. Health Probes (Kubernetes Pod Readiness & Liveness)', () => {
    it('GET /api/v1/health/liveness harus mengembalikan status OK', async () => {
      const res = await request(app.getHttpServer()).get('/api/v1/health/liveness').expect(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.uptime).toBeGreaterThanOrEqual(0);
    });

    it('GET /api/v1/health/readiness harus mengonfirmasi koneksi database PostgreSQL', async () => {
      const res = await request(app.getHttpServer()).get('/api/v1/health/readiness').expect(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.database).toBe('connected');
    });
  });

  describe('2. RBAC Security Guardrails', () => {
    it('Estimator dilarang menyetujui (approve) RAB (harus HTTP 403 Forbidden)', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/rab/00000000-0000-0000-0000-000000000000/approve')
        .set('Authorization', `Bearer ${estimatorToken}`)
        .expect(403);
    });

    it('Site Supervisor dilarang membuat proyek baru (harus HTTP 403 Forbidden)', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${supervisorToken}`)
        .send({ name: 'Proyek Illegal', location: 'Jakarta', capacityMw: 1.0 })
        .expect(403);
    });
  });

  describe('3. Scenario 1: Estimator buat RAB -> Submit -> Approver Approve', () => {
    let rabId: string;
    let itemId1: string;
    let itemId2: string;

    it('Estimator membuat draft RAB baru', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/projects/${testProjectId}/rab`)
        .set('Authorization', `Bearer ${estimatorToken}`)
        .send({ notes: 'RAB Baseline E2E Test' })
        .expect(201);

      rabId = res.body.id;
      expect(res.body.status).toBe('draft');
      expect(res.body.version).toBeGreaterThanOrEqual(1);
    });

    it('Estimator menambahkan 2 item WBS dan total terhitung otomatis', async () => {
      // Item 1: 1000 unit @ Rp 500.000 = Rp 500.000.000
      const it1 = await request(app.getHttpServer())
        .post(`/api/v1/rab/${rabId}/items`)
        .set('Authorization', `Bearer ${estimatorToken}`)
        .send({
          wbsCode: '1.0',
          itemCode: 'MOD-01',
          workPackage: WorkPackage.ELECTRICAL_DC,
          category: CostCategory.MATERIAL,
          description: 'Modul Surya 550Wp Tier 1',
          volume: 1000,
          unit: 'unit',
          unitPrice: 500000,
        })
        .expect(201);
      itemId1 = it1.body.id;

      // Item 2: 500 mandays @ Rp 200.000 = Rp 100.000.000
      const it2 = await request(app.getHttpServer())
        .post(`/api/v1/rab/${rabId}/items`)
        .set('Authorization', `Bearer ${estimatorToken}`)
        .send({
          wbsCode: '2.0',
          itemCode: 'LAB-01',
          workPackage: WorkPackage.CIVIL,
          category: CostCategory.UPAH,
          description: 'Upah Pemasangan Struktur & Piling',
          volume: 500,
          unit: 'mandays',
          unitPrice: 200000,
        })
        .expect(201);
      itemId2 = it2.body.id;

      expect(itemId2).toBeDefined();

      // Verifikasi akumulasi total RAB (500M + 100M = 600M)
      const rabList = await request(app.getHttpServer())
        .get(`/api/v1/projects/${testProjectId}/rab`)
        .set('Authorization', `Bearer ${estimatorToken}`)
        .expect(200);

      const currentRab = rabList.body.find((r: any) => r.id === rabId);
      expect(parseFloat(currentRab.total_amount)).toBe(600000000);
    });

    it('Estimator mengajukan RAB untuk approval (status berubah ke submitted)', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/rab/${rabId}/submit`)
        .set('Authorization', `Bearer ${estimatorToken}`)
        .expect(201);

      expect(res.body.status).toBe('submitted');
      expect(res.body.submitted_at).toBeDefined();
    });

    it('Approver melihat RAB di daftar pending approvals', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/rab/pending-approvals')
        .set('Authorization', `Bearer ${approverToken}`)
        .expect(200);

      const found = res.body.find((r: any) => r.id === rabId);
      expect(found).toBeDefined();
      expect(found.total_amount).toBe(600000000);
    });

    it('Approver menyetujui RAB (status berubah ke approved)', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/rab/${rabId}/approve`)
        .set('Authorization', `Bearer ${approverToken}`)
        .expect(201);

      expect(res.body.status).toBe('approved');
      expect(res.body.approved_at).toBeDefined();
    });

    describe('4. Scenario 2: Site Supervisor input actual pada RAB approved & verifikasi variance', () => {
      it('Site Supervisor mencatat realisasi belanja material pada item approved', async () => {
        // Pembelian 500 unit @ Rp 520.000 = Rp 260.000.000
        const res = await request(app.getHttpServer())
          .post(`/api/v1/rab-items/${itemId1}/actuals`)
          .set('Authorization', `Bearer ${supervisorToken}`)
          .send({
            entryDate: '2026-09-13',
            qty: 500,
            actualUnitPrice: 520000,
            vendor: 'PT Surya Prima Energi',
            invoiceNumber: 'INV-2026-E2E-001',
            description: 'Pengiriman Batch 1 Modul Surya',
          })
          .expect(201);

        expect(res.body.qty).toBe(500);
        expect(res.body.actual_unit_price).toBe(520000);
        expect(res.body.total_actual_amount).toBe(260000000);
      });

      it('Dashboard proyek menampilkan ringkasan realisasi dan variance ter-update', async () => {
        const res = await request(app.getHttpServer())
          .get(`/api/v1/projects/${testProjectId}`)
          .set('Authorization', `Bearer ${pmToken}`)
          .expect(200);

        expect(res.body.totalRab).toBe(600000000);
        expect(res.body.totalActual).toBe(260000000);
      });
    });
  });

  describe('5. Scenario 3: Penolakan input actual pada RAB berstatus DRAFT (Financial Guardrail)', () => {
    let draftRabId: string;
    let draftItemId: string;

    beforeAll(async () => {
      // Buat RAB draft kedua
      const rRes = await request(app.getHttpServer())
        .post(`/api/v1/projects/${testProjectId}/rab`)
        .set('Authorization', `Bearer ${estimatorToken}`)
        .send({ notes: 'Draft RAB Kedua' });
      draftRabId = rRes.body.id;

      const iRes = await request(app.getHttpServer())
        .post(`/api/v1/rab/${draftRabId}/items`)
        .set('Authorization', `Bearer ${estimatorToken}`)
        .send({
          wbsCode: '3.0',
          itemCode: 'CAB-01',
          workPackage: WorkPackage.ELECTRICAL_DC,
          category: CostCategory.MATERIAL,
          description: 'Kabel DC 4mm2',
          volume: 100,
          unit: 'meter',
          unitPrice: 15000,
        });
      draftItemId = iRes.body.id;
    });

    it('Input actual pada item berstatus DRAFT harus ditolak dengan HTTP 400 Bad Request', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/rab-items/${draftItemId}/actuals`)
        .set('Authorization', `Bearer ${supervisorToken}`)
        .send({
          entryDate: '2026-09-13',
          qty: 50,
          actualUnitPrice: 15000,
          vendor: 'Toko Listrik Sejahtera',
        })
        .expect(400);

      expect(res.body.message).toContain("Hanya RAB berstatus 'approved' yang dapat menerima input realisasi");
    });
  });

  describe('6. Scenario 4: Validasi penolakan (Reject) RAB wajib catatan', () => {
    let submitRabId: string;

    beforeAll(async () => {
      const rRes = await request(app.getHttpServer())
        .post(`/api/v1/projects/${testProjectId}/rab`)
        .set('Authorization', `Bearer ${estimatorToken}`)
        .send({ notes: 'RAB untuk Uji Reject' });
      submitRabId = rRes.body.id;

      await request(app.getHttpServer())
        .post(`/api/v1/rab/${submitRabId}/items`)
        .set('Authorization', `Bearer ${estimatorToken}`)
        .send({
          wbsCode: '4.0',
          itemCode: 'INV-01',
          workPackage: WorkPackage.ELECTRICAL_AC,
          category: CostCategory.ALAT,
          description: 'Inverter String 100kW',
          volume: 2,
          unit: 'unit',
          unitPrice: 75000000,
        });

      await request(app.getHttpServer())
        .post(`/api/v1/rab/${submitRabId}/submit`)
        .set('Authorization', `Bearer ${estimatorToken}`);
    });

    it('Approver menolak RAB tanpa catatan harus ditolak dengan HTTP 400 Bad Request', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/rab/${submitRabId}/reject`)
        .set('Authorization', `Bearer ${approverToken}`)
        .send({ note: '' })
        .expect(400);

      expect(res.body.message).toContain('Catatan penolakan (note) wajib disertakan');
    });

    it('Approver menolak RAB dengan catatan valid harus berhasil (status berubah ke rejected)', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/rab/${submitRabId}/reject`)
        .set('Authorization', `Bearer ${approverToken}`)
        .send({ note: 'Harga inverter melebihi batas benchmark Garut 2025, mohon negosiasi ulang.' })
        .expect(201);

      expect(res.body.status).toBe('rejected');
      expect(res.body.rejection_note).toBe(
        'Harga inverter melebihi batas benchmark Garut 2025, mohon negosiasi ulang.',
      );
    });
  });

  describe('7. Scenario 5: Idempotency-Key handling untuk Offline Sync Lapangan', () => {
    it('Request dengan Idempotency-Key yang sama tidak menduplikasi entri transaksi', async () => {
      // Ambil RAB aktif dari proyek
      const activeRab = await request(app.getHttpServer())
        .get(`/api/v1/projects/${testProjectId}/rab/active`)
        .set('Authorization', `Bearer ${pmToken}`);

      const targetItemId = activeRab.body.items[0].id;
      const idempotencyKey = `e2e-offline-key-${Date.now()}`;

      // Request pertama
      const res1 = await request(app.getHttpServer())
        .post(`/api/v1/rab-items/${targetItemId}/actuals`)
        .set('Authorization', `Bearer ${supervisorToken}`)
        .set('Idempotency-Key', idempotencyKey)
        .send({
          entryDate: '2026-09-13',
          qty: 10,
          actualUnitPrice: 500000,
          vendor: 'Vendor Idempotent',
        })
        .expect(201);

      // Request kedua dengan Idempotency-Key yang sama
      const res2 = await request(app.getHttpServer())
        .post(`/api/v1/rab-items/${targetItemId}/actuals`)
        .set('Authorization', `Bearer ${supervisorToken}`)
        .set('Idempotency-Key', idempotencyKey)
        .send({
          entryDate: '2026-09-13',
          qty: 10,
          actualUnitPrice: 500000,
          vendor: 'Vendor Idempotent',
        })
        .expect(201);

      // Verifikasi ID yang dikembalikan identik (tidak dibuat duplikat)
      expect(res1.body.id).toBe(res2.body.id);
    });
  });

  describe('8. Scenario 6: Log Progres Fisik Kurva S & Metrik EVM', () => {
    it('PM mencatat progres fisik mingguan dan menerima kalkulasi EVM deterministik', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/projects/${testProjectId}/progress`)
        .set('Authorization', `Bearer ${pmToken}`)
        .send({
          periodWeek: 2,
          logDate: '2026-09-13',
          plannedProgressPct: 20.0,
          actualProgressPct: 18.5,
          notes: 'Instalasi struktur racking berjalan lancar di area barat',
        })
        .expect(201);

      expect(res.body.evmMetrics).toBeDefined();
      expect(res.body.evmMetrics.plannedValue).toBeGreaterThan(0);
      expect(res.body.evmMetrics.earnedValue).toBeGreaterThan(0);
      expect(res.body.evmMetrics.cpi).toBeGreaterThan(0);
      expect(res.body.evmMetrics.spi).toBeGreaterThan(0);
      expect(res.body.evmMetrics.estimateAtCompletion).toBeGreaterThan(0);
    });
  });
});

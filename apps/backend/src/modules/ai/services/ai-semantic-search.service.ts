import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { NineRouterService } from './nine-router.service';

export interface SemanticSearchResultItem {
  id: string;
  itemCode: string;
  workPackage: string;
  category: string;
  description: string;
  unit: string;
  unitPrice: number;
  sourceProjectName?: string;
  similarityScore?: number;
}

export interface SemanticSearchResponse {
  query: string;
  aiExplanation?: string;
  isAiAssisted: boolean;
  candidates: SemanticSearchResultItem[];
}

@Injectable()
export class AiSemanticSearchService {
  private readonly logger = new Logger(AiSemanticSearchService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly nineRouter: NineRouterService,
  ) {}

  async searchPriceHistory(query: string, _organizationId?: string): Promise<SemanticSearchResponse> {
    if (!query || !query.trim()) {
      return { query: '', isAiAssisted: false, candidates: [] };
    }

    const cleanQuery = query.trim();

    // 1. Coba pencarian semantik vektor via 9Router (OpenAI Embedding + pgvector HNSW)
    try {
      const embedding = await this.nineRouter.createEmbedding(cleanQuery);

      if (embedding && embedding.length > 0) {
        const embeddingStr = `[${embedding.join(',')}]`;
        const vectorSql = `
          SELECT 
            h.id, 
            h.item_code as "itemCode", 
            h.work_package as "workPackage", 
            h.category, 
            h.description, 
            h.unit, 
            h.unit_price as "unitPrice", 
            COALESCE(p.name, 'Histori Standar') as "sourceProjectName",
            ROUND((1 - (h.embedding <=> $1::vector))::numeric, 3) as "similarityScore"
          FROM rab_item_history h
          LEFT JOIN projects p ON p.id = h.source_project_id
          WHERE h.embedding IS NOT NULL
          ORDER BY h.embedding <=> $1::vector ASC
          LIMIT 5;
        `;

        const res = await this.db.query(vectorSql, [embeddingStr]);

        if (res.rows && res.rows.length > 0) {
          const candidates: SemanticSearchResultItem[] = res.rows.map((r: any) => ({
            id: r.id,
            itemCode: r.itemCode,
            workPackage: r.workPackage,
            category: r.category,
            description: r.description,
            unit: r.unit,
            unitPrice: Number(r.unitPrice),
            sourceProjectName: r.sourceProjectName,
            similarityScore: Number(r.similarityScore),
          }));

          // 2. Kirim ke Claude (via 9Router) untuk di-rerank dan dijelaskan secara naratif
          let aiExplanation = '';
          try {
            const candidateList = candidates
              .map(
                (c, idx) =>
                  `${idx + 1}. ${c.description} — Rp ${c.unitPrice.toLocaleString('id-ID')} / ${c.unit} (${c.sourceProjectName})`,
              )
              .join('\n');

            const chat = await this.nineRouter.createChatCompletion([
              {
                role: 'system',
                content:
                  'Kamu asisten cerdas estimator konstruksi (General EPC & Kontraktor). Jawab singkat dalam 2 kalimat bahasa Indonesia: item mana yang paling cocok dan rekomendasikan rentang harga satuan serta proyek/standar acuannya.',
              },
              {
                role: 'user',
                content: `Query: "${cleanQuery}"\nKandidat:\n${candidateList}`,
              },
            ]);

            aiExplanation = chat.content;
          } catch (aiErr: any) {
            this.logger.warn(`Claude rerank via 9Router dilewati: ${aiErr.message}`);
          }

          return {
            query: cleanQuery,
            isAiAssisted: true,
            aiExplanation: aiExplanation || undefined,
            candidates,
          };
        }
      }
    } catch (err: any) {
      this.logger.warn(`Semantic vector search gagal, beralih ke text-based search fallback: ${err.message}`);
    }

    // 3. Fallback: Pencarian teks toleran (ILIKE) pada rab_item_history dan rab_items
    try {
      const searchTerms = cleanQuery.toLowerCase().split(/\s+/).filter(Boolean);
      const firstTerm = searchTerms[0] || cleanQuery;
      
      const fallbackSql = `
        SELECT 
          h.id, 
          h.item_code as "itemCode", 
          h.work_package as "workPackage", 
          h.category, 
          h.description, 
          h.unit, 
          h.unit_price as "unitPrice", 
          COALESCE(p.name, 'Histori Standar AHSP') as "sourceProjectName",
          0.85 as "similarityScore"
        FROM rab_item_history h
        LEFT JOIN projects p ON p.id = h.source_project_id
        WHERE h.description ILIKE $1 OR h.item_code ILIKE $1 OR h.work_package ILIKE $1
        UNION
        SELECT 
          i.id, 
          i.item_code as "itemCode", 
          i.work_package as "workPackage", 
          i.category, 
          i.description, 
          i.unit, 
          i.unit_price as "unitPrice",
          'Proyek Berjalan' as "sourceProjectName",
          0.80 as "similarityScore"
        FROM rab_items i
        WHERE i.description ILIKE $1 OR i.item_code ILIKE $1
        ORDER BY "similarityScore" DESC, "description" ASC
        LIMIT 6;
      `;

      const fallbackRes = await this.db.query(fallbackSql, [`%${firstTerm}%`]);
      if (fallbackRes.rows && fallbackRes.rows.length > 0) {
        const candidates: SemanticSearchResultItem[] = fallbackRes.rows.map((r: any) => ({
          id: r.id,
          itemCode: r.itemCode,
          workPackage: r.workPackage,
          category: r.category,
          description: r.description,
          unit: r.unit,
          unitPrice: Number(r.unitPrice),
          sourceProjectName: r.sourceProjectName,
          similarityScore: Number(r.similarityScore),
        }));

        return {
          query: cleanQuery,
          isAiAssisted: false,
          aiExplanation: `Ditemukan ${candidates.length} item acuan harga historis yang cocok untuk pencarian "${cleanQuery}".`,
          candidates,
        };
      }
    } catch (dbErr: any) {
      this.logger.warn(`Fallback database search error: ${dbErr.message}`);
    }

    // 4. Fallback Standar AHSP Katalog General EPC (SNI / Permen PUPR)
    const ahspStandardCatalog = this.getStandardAhspCatalog();

    const qLower = cleanQuery.toLowerCase();
    const matched = ahspStandardCatalog.filter((item) => {
      const matchText = `${item.description} ${item.itemCode} ${item.workPackage} ${item.category}`.toLowerCase();
      const terms = qLower.split(/\s+/).filter(Boolean);
      return terms.some((t) => matchText.includes(t));
    });

    const candidates = matched.length > 0 ? matched.slice(0, 5) : ahspStandardCatalog.slice(0, 4);

    return {
      query: cleanQuery,
      isAiAssisted: false,
      aiExplanation: `Rekomendasi acuan harga satuan AHSP (PUPR & SNI) untuk kata kunci "${cleanQuery}". Silakan pilih item untuk diterapkan ke form RAB.`,
      candidates,
    };
  }

  /**
   * Historical Price Guardrail (Anti Mark-Up & Typo Prevention)
   * Evaluates if an input unit price deviates significantly from historical/AHSP catalog median
   */
  async checkPriceGuardrail(
    description: string,
    unitPrice: number,
    unit?: string,
    _category?: string,
  ): Promise<{

    itemDescription: string;
    inputUnitPrice: number;
    unit?: string;
    isAnomaly: boolean;
    medianPrice: number;
    deviationPercent: number;
    riskLevel: 'NORMAL' | 'MEDIUM' | 'HIGH' | 'LOW';
    sampleCount: number;
    message: string;
    historicalReference?: {
      source: string;
      itemCode: string;
      unitPrice: number;
    };
  }> {
    const cleanDesc = (description || '').trim();
    if (!cleanDesc || isNaN(unitPrice) || unitPrice <= 0) {
      return {
        itemDescription: cleanDesc,
        inputUnitPrice: unitPrice,
        unit,
        isAnomaly: false,
        medianPrice: unitPrice,
        deviationPercent: 0,
        riskLevel: 'NORMAL',
        sampleCount: 0,
        message: 'Deskripsi pekerjaan atau harga satuan belum diisi.',
      };
    }

    const prices: { price: number; code: string; source: string }[] = [];

    // 1. Query database for similar items
    try {
      const searchTerms = cleanDesc.toLowerCase().split(/\s+/).filter((t) => t.length > 2);
      const firstTerm = searchTerms[0] || cleanDesc;

      const dbRes = await this.db.query(
        `SELECT 
           h.unit_price as price, 
           h.item_code as code, 
           COALESCE(p.name, 'Histori Proyek') as source
         FROM rab_item_history h
         LEFT JOIN projects p ON p.id = h.source_project_id
         WHERE h.description ILIKE $1 OR h.item_code ILIKE $1
         UNION
         SELECT 
           i.unit_price as price, 
           i.item_code as code, 
           'Katalog RAB Internal' as source
         FROM rab_items i
         WHERE i.description ILIKE $1
         LIMIT 30`,
        [`%${firstTerm}%`],
      );

      for (const row of dbRes.rows) {
        const p = parseFloat(row.price);
        if (!isNaN(p) && p > 0) {
          prices.push({ price: p, code: row.code, source: row.source });
        }
      }
    } catch (err: any) {
      this.logger.warn(`Price guardrail database lookup warning: ${err.message}`);
    }

    // 2. Also search fallback AHSP catalog for broad EPC coverage
    const terms = cleanDesc.toLowerCase().split(/\s+/).filter(Boolean);
    const ahspMatches = this.getStandardAhspCatalog().filter((item) => {
      const matchText = `${item.description} ${item.itemCode} ${item.workPackage} ${item.category}`.toLowerCase();
      return terms.some((t) => matchText.includes(t));
    });
    for (const c of ahspMatches) {
      if (c.unitPrice > 0) {
        prices.push({
          price: c.unitPrice,
          code: c.itemCode,
          source: c.sourceProjectName || 'Standar AHSP PUPR',

        });
      }
    }

    if (prices.length === 0) {
      return {
        itemDescription: cleanDesc,
        inputUnitPrice: unitPrice,
        unit,
        isAnomaly: false,
        medianPrice: unitPrice,
        deviationPercent: 0,
        riskLevel: 'NORMAL',
        sampleCount: 0,
        message: 'Belum ada data historis pembanding yang relevan untuk item ini.',
      };
    }

    // Calculate median
    prices.sort((a, b) => a.price - b.price);
    const mid = Math.floor(prices.length / 2);
    const medianPrice =
      prices.length % 2 !== 0
        ? prices[mid].price
        : Math.round((prices[mid - 1].price + prices[mid].price) / 2);

    const deviationPercent = Math.round(((unitPrice - medianPrice) / medianPrice) * 100 * 10) / 10;
    const closestRef = prices[mid];

    let riskLevel: 'NORMAL' | 'MEDIUM' | 'HIGH' | 'LOW' = 'NORMAL';
    let isAnomaly = false;
    let message = `Harga Rp ${unitPrice.toLocaleString('id-ID')} berada dalam rentang wajar standar historis (median Rp ${medianPrice.toLocaleString('id-ID')}).`;

    if (deviationPercent >= 50) {
      riskLevel = 'HIGH';
      isAnomaly = true;
      message = `🚨 Deviasi Sangat Tinggi: Harga Rp ${unitPrice.toLocaleString('id-ID')} adalah +${deviationPercent}% di atas median historis (Rp ${medianPrice.toLocaleString('id-ID')}). Potensi mark-up atau kesalahan ketik nol.`;
    } else if (deviationPercent >= 25) {
      riskLevel = 'MEDIUM';
      isAnomaly = true;
      message = `⚠️ Deviasi Di Atas Ambang Wajar: Harga Rp ${unitPrice.toLocaleString('id-ID')} adalah +${deviationPercent}% di atas median historis (Rp ${medianPrice.toLocaleString('id-ID')}). Harap masukkan catatan justifikasi teknis.`;
    } else if (deviationPercent <= -35) {
      riskLevel = 'LOW';
      isAnomaly = true;
      message = `ℹ️ Potensi Under-Estimate: Harga Rp ${unitPrice.toLocaleString('id-ID')} adalah ${deviationPercent}% di bawah median historis (Rp ${medianPrice.toLocaleString('id-ID')}). Pastikan spesifikasi material tidak di bawah standar tender.`;
    }

    return {
      itemDescription: cleanDesc,
      inputUnitPrice: unitPrice,
      unit,
      isAnomaly,
      medianPrice,
      deviationPercent,
      riskLevel,
      sampleCount: prices.length,
      message,
      historicalReference: {
        source: closestRef.source,
        itemCode: closestRef.code,
        unitPrice: closestRef.price,
      },
    };
  }

  /**
   * Reference catalog for standard Indonesian EPC construction (AHSP SNI & Permen PUPR)
   */
  private getStandardAhspCatalog(): SemanticSearchResultItem[] {
    return [
      {
        id: 'ahsp-civ-01',
        itemCode: 'CIV-SNI-01',
        workPackage: 'civil',
        category: 'upah',
        description: 'Galian Tanah Biasa Kedalaman 1-2 Meter (Standar PUPR)',
        unit: 'm3',
        unitPrice: 85000,
        sourceProjectName: 'Standar AHSP PUPR 2024',
        similarityScore: 0.9,
      },
      {
        id: 'ahsp-civ-02',
        itemCode: 'CIV-SNI-02',
        workPackage: 'civil',
        category: 'material',
        description: 'Urugan Pasir Bawah Pondasi & Lantai Padat',
        unit: 'm3',
        unitPrice: 295000,
        sourceProjectName: 'Standar AHSP PUPR 2024',
        similarityScore: 0.88,
      },
      {
        id: 'ahsp-civ-03',
        itemCode: 'CIV-SNI-03',
        workPackage: 'civil',
        category: 'material',
        description: 'Beton Ready Mix Mutu K-250 / fc 20 MPa Cor di Tempat',
        unit: 'm3',
        unitPrice: 1050000,
        sourceProjectName: 'Standar SNI Konstruksi',
        similarityScore: 0.92,
      },
      {
        id: 'ahsp-civ-04',
        itemCode: 'CIV-SNI-04',
        workPackage: 'civil',
        category: 'material',
        description: 'Beton Ready Mix Mutu K-300 / fc 25 MPa Struktur Kolom & Balok',
        unit: 'm3',
        unitPrice: 1150000,
        sourceProjectName: 'Standar SNI Konstruksi',
        similarityScore: 0.95,
      },
      {
        id: 'ahsp-civ-05',
        itemCode: 'CIV-SNI-05',
        workPackage: 'civil',
        category: 'material',
        description: 'Pembesian Besi Beton Ulir BJTD-40 D10 s/d D25 Terpasang',
        unit: 'kg',
        unitPrice: 16800,
        sourceProjectName: 'Standar SNI Konstruksi',
        similarityScore: 0.91,
      },
      {
        id: 'ahsp-civ-06',
        itemCode: 'CIV-SNI-06',
        workPackage: 'civil',
        category: 'material',
        description: 'Pasang Bekisting Balok, Kolom & Lantai Kayu Meranti / Multiplex',
        unit: 'm2',
        unitPrice: 235000,
        sourceProjectName: 'Standar AHSP PUPR 2024',
        similarityScore: 0.89,
      },
      {
        id: 'ahsp-civ-07',
        itemCode: 'CIV-STR-01',
        workPackage: 'civil',
        category: 'material',
        description: 'Struktur Baja Profil WF / H-Beam Fabrikasi & Erection Crane',
        unit: 'kg',
        unitPrice: 34500,
        sourceProjectName: 'General EPC Fabrikasi',
        similarityScore: 0.94,
      },
      {
        id: 'ahsp-arc-01',
        itemCode: 'ARC-SNI-01',
        workPackage: 'civil',
        category: 'material',
        description: 'Pasangan Dinding Bata Ringan Hebel Tebal 10cm + Perekat Mortar',
        unit: 'm2',
        unitPrice: 145000,
        sourceProjectName: 'Standar SNI Arsitektur',
        similarityScore: 0.9,
      },
      {
        id: 'ahsp-arc-02',
        itemCode: 'ARC-SNI-02',
        workPackage: 'civil',
        category: 'material',
        description: 'Plesteran Dinding Campuran 1:4 Tebal 15mm & Acian Halus',
        unit: 'm2',
        unitPrice: 68000,
        sourceProjectName: 'Standar SNI Arsitektur',
        similarityScore: 0.89,
      },
      {
        id: 'ahsp-arc-03',
        itemCode: 'ARC-SNI-03',
        workPackage: 'civil',
        category: 'material',
        description: 'Pengecatan Dinding Eksterior / Interior Tahan Cuaca Weathercoat',
        unit: 'm2',
        unitPrice: 42000,
        sourceProjectName: 'Standar SNI Finishing',
        similarityScore: 0.88,
      },
      {
        id: 'ahsp-el-01',
        itemCode: 'EL-SNI-01',
        workPackage: 'electrical',
        category: 'material',
        description: 'Kabel Power NYY 4x16 mm2 Supreme / Kabelmetal SPLN',
        unit: 'meter',
        unitPrice: 145000,
        sourceProjectName: 'Standar PLN / MEP',
        similarityScore: 0.92,
      },
      {
        id: 'ahsp-el-02',
        itemCode: 'EL-SNI-02',
        workPackage: 'electrical',
        category: 'material',
        description: 'Kabel Instalasi Penerangan NYM 3x2.5 mm2 dalam Conduit PVC',
        unit: 'meter',
        unitPrice: 24000,
        sourceProjectName: 'Standar PLN / MEP',
        similarityScore: 0.9,
      },
      {
        id: 'ahsp-el-03',
        itemCode: 'EL-PV-01',
        workPackage: 'electrical',
        category: 'material',
        description: 'Modul Surya PV Tier-1 Monokristalin Bifacial 550Wp',
        unit: 'unit',
        unitPrice: 1650000,
        sourceProjectName: 'Pengadaan EPC Energi',
        similarityScore: 0.95,
      },
      {
        id: 'ahsp-el-04',
        itemCode: 'EL-PV-02',
        workPackage: 'electrical',
        category: 'alat',
        description: 'Inverter String On-Grid 50 kW 3-Phase Smart Grid Support',
        unit: 'unit',
        unitPrice: 62000000,
        sourceProjectName: 'Pengadaan EPC Energi',
        similarityScore: 0.93,
      },
      {
        id: 'ahsp-mep-01',
        itemCode: 'MEP-SNI-01',
        workPackage: 'mep',
        category: 'material',
        description: 'Pipa Air Bersih PVC Kelas AW Diameter 2 Inch Wavin / Rucika',
        unit: 'meter',
        unitPrice: 48000,
        sourceProjectName: 'Standar PUPR Pemipaan',
        similarityScore: 0.9,
      },
      {
        id: 'ahsp-mep-02',
        itemCode: 'MEP-SNI-02',
        workPackage: 'mep',
        category: 'material',
        description: 'Pipa Tekan HDPE PN-10 Diameter 63mm Saluran Distribusi',
        unit: 'meter',
        unitPrice: 65000,
        sourceProjectName: 'Standar PUPR Pemipaan',
        similarityScore: 0.91,
      },
      {
        id: 'ahsp-lab-01',
        itemCode: 'LAB-SNI-01',
        workPackage: 'civil',
        category: 'upah',
        description: 'Upah Tukang Batu / Tukang Besi / Tukang Kayu Berpengalaman',
        unit: 'mandays',
        unitPrice: 180000,
        sourceProjectName: 'Standar Upah PUPR 2024',
        similarityScore: 0.9,
      },
      {
        id: 'ahsp-lab-02',
        itemCode: 'LAB-SNI-02',
        workPackage: 'civil',
        category: 'upah',
        description: 'Upah Mandor Lapangan / Site Inspector',
        unit: 'mandays',
        unitPrice: 220000,
        sourceProjectName: 'Standar Upah PUPR 2024',
        similarityScore: 0.92,
      },
    ];
  }
}



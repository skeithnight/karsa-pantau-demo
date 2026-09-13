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
                  'Kamu membantu estimator memilih harga satuan yang paling relevan dari histori proyek PLTS. Jawab singkat dalam 2-3 kalimat bahasa Indonesia: item mana yang paling cocok dan alasannya, sebut rentang harga dan proyek asalnya.',
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

    // 3. Fallback: Pencarian teks tradisional (ILIKE) pada rab_items dan rab_item_history
    const fallbackSql = `
      SELECT 
        id, 
        item_code as "itemCode", 
        work_package as "workPackage", 
        category, 
        description, 
        unit, 
        unit_price as "unitPrice",
        'Proyek Berjalan' as "sourceProjectName",
        0.80 as "similarityScore"
      FROM rab_items
      WHERE description ILIKE $1 OR item_code ILIKE $1
      ORDER BY created_at DESC
      LIMIT 5;
    `;

    const fallbackRes = await this.db.query(fallbackSql, [`%${cleanQuery}%`]);
    const candidates: SemanticSearchResultItem[] = fallbackRes.rows.map((r: any) => ({
      id: r.id,
      itemCode: r.itemCode,
      workPackage: r.workPackage,
      category: r.category,
      description: r.description,
      unit: r.unit,
      unitPrice: Number(r.unitPrice),
      sourceProjectName: r.sourceProjectName,
      similarityScore: 0.8,
    }));

    return {
      query: cleanQuery,
      isAiAssisted: false,
      aiExplanation:
        candidates.length > 0
          ? `Ditemukan ${candidates.length} item dengan kecocokan kata kunci pada database proyek.`
          : 'Belum ditemukan item harga historis yang cocok.',
      candidates,
    };
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { NineRouterService, ChatMessage } from './nine-router.service';

export interface ChatRequestDto {
  projectId: string;
  message: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

@Injectable()
export class AiChatService {
  private readonly logger = new Logger(AiChatService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly nineRouter: NineRouterService,
  ) {}

  async *streamProjectChat(
    dto: ChatRequestDto,
  ): AsyncGenerator<string, void, unknown> {
    const { projectId, message, history = [] } = dto;

    // 1. Ambil konteks proyek dari database
    let projectContext = '';
    let organizationId: string | null = null;

    try {
      const projRes = await this.db.query(
        `SELECT p.id, p.name, p.capacity_kwp, p.status, p.organization_id,
                COALESCE(r.total_amount, 0) as total_rab,
                COALESCE(SUM(ae.total_actual_amount), 0) as total_actual
         FROM projects p
         LEFT JOIN rab r ON r.project_id = p.id AND r.status = 'approved'
         LEFT JOIN rab_items ri ON ri.rab_id = r.id
         LEFT JOIN actual_entries ae ON ae.rab_item_id = ri.id
         WHERE p.id = $1
         GROUP BY p.id, r.total_amount;`,
        [projectId],
      );

      if (projRes.rows.length > 0) {
        const p = projRes.rows[0];
        organizationId = p.organization_id;
        const totalRab = Number(p.total_rab);
        const totalActual = Number(p.total_actual);
        const variance = totalActual - totalRab;
        const variancePct = totalRab > 0 ? ((variance / totalRab) * 100).toFixed(1) : '0';

        projectContext = `
Informasi Proyek:
- Nama: ${p.name}
- Kapasitas: ${p.capacity_kwp} kWp
- Status: ${p.status}
- Total RAB: Rp ${totalRab.toLocaleString('id-ID')}
- Realisasi Saat Ini: Rp ${totalActual.toLocaleString('id-ID')}
- Variance: Rp ${variance.toLocaleString('id-ID')} (${variancePct}%)
        `.trim();
      }
    } catch (err: any) {
      this.logger.warn(`Gagal mengambil konteks proyek: ${err.message}`);
    }

    // 2. Susun system prompt dengan guardrail RAG
    const systemPrompt = `
Kamu adalah Karsa AI Assistant — asisten cerdas untuk estimasi, monitoring, dan cost-control proyek konstruksi PLTS (Pembangkit Listrik Tenaga Surya).
Jawab pertanyaan pengguna dalam bahasa Indonesia yang ringkas, ramah, dan profesional.

Konteks Proyek Terkait:
${projectContext || 'Data proyek tidak tersedia secara spesifik.'}

Prinsip Penting:
1. Hanya gunakan fakta atau angka yang tercantum di Konteks Proyek di atas.
2. Jika ada informasi finansial/teknis yang tidak ada di konteks, katakan dengan jujur bahwa data tersebut belum tercatat di sistem Karsa Pantau. Jangan pernah mengarang data biaya atau progres.
3. Selalu prioritaskan kepatuhan anggaran dan efisiensi pengeluaran.
    `.trim();

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...history.map((h) => ({ role: h.role, content: h.content })),
      { role: 'user', content: message },
    ];

    let fullResponse = '';

    // 3. Streaming response via 9Router
    try {
      for await (const chunk of this.nineRouter.streamChat(messages)) {
        fullResponse += chunk;
        yield chunk;
      }
    } catch (err: any) {
      this.logger.warn(`Streaming 9Router gagal, fallback respons: ${err.message}`);
      const fallbackText = `[Mode Offline] Maaf, koneksi ke gateway AI (9Router) sedang tidak dapat dijangkau. Berdasarkan data lokal sistem, proyek memiliki Total Anggaran Rp ${projectContext ? 'yang tercatat di dashboard' : '-'} dengan realisasi berjalan.`;
      fullResponse = fallbackText;
      yield fallbackText;
    }

    // 4. Catat output ke ai_insights
    try {
      await this.db.query(
        `
        INSERT INTO ai_insights (
          project_id, 
          type, 
          input_context, 
          output, 
          tokens_used, 
          model_used, 
          organization_id
        ) VALUES ($1, 'chat_response', $2, $3, $4, 'claude-3-5-sonnet', $5);
        `,
        [
          projectId,
          JSON.stringify({ query: message }),
          JSON.stringify({ response: fullResponse }),
          Math.round((message.length + fullResponse.length) / 4),
          organizationId,
        ],
      );
    } catch (saveErr: any) {
      this.logger.warn(`Gagal mencatat chat ke ai_insights: ${saveErr.message}`);
    }
  }
}

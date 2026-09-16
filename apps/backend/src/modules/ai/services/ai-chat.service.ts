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
        `SELECT p.id, p.name, p.capacity_mw, p.status, p.organization_id,
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
        const capacityKwp = p.capacity_mw ? Number(p.capacity_mw) * 1000 : 0;

        projectContext = `
Informasi Proyek:
- Nama: ${p.name}
- Kapasitas: ${capacityKwp} kWp (${p.capacity_mw} MW)
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
Jawab pertanyaan pengguna dalam bahasa Indonesia yang ringkas, jelas, to the point, dan profesional (maksimal 3 paragraf).

Konteks Proyek Terkait:
${projectContext || 'Data proyek tidak tersedia secara spesifik atau proyek baru belum memiliki rincian transaksi.'}

Prinsip Penting:
1. Gunakan fakta atau angka yang tercantum di Konteks Proyek di atas bila relevan.
2. Jika ada informasi finansial/teknis yang belum tercatat di sistem, sampaikan dengan jelas dan berikan arahan atau rekomendasi standar industri EPC PLTS. Jangan pernah mengarang angka realisasi atau RAB yang tidak ada.
3. Selalu prioritaskan kepatuhan anggaran dan efisiensi pengeluaran.
    `.trim();

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...history.map((h) => ({ role: h.role, content: h.content })),
      { role: 'user', content: message },
    ];

    let fullResponse = '';

    // 3. Streaming response via 9Router (dengan non-streaming fallback)
    try {
      for await (const chunk of this.nineRouter.streamChat(messages, { maxTokens: 800, temperature: 0.3 })) {
        fullResponse += chunk;
        yield chunk;
      }
    } catch (err: any) {
      this.logger.warn(`Streaming AI gagal (${err.message}), mencoba fallback non-streaming...`);
      try {
        const nonStreamRes = await this.nineRouter.createChatCompletion(messages, {
          maxTokens: 600,
          temperature: 0.3,
        });
        if (nonStreamRes && nonStreamRes.content) {
          fullResponse = nonStreamRes.content;
          yield nonStreamRes.content;
        } else {
          throw new Error('Respons non-streaming kosong');
        }
      } catch (nonStreamErr: any) {
        this.logger.warn(`Non-streaming fallback juga gagal: ${nonStreamErr.message}`);
        const fallbackText = projectContext
          ? `Maaf, respons AI real-time membutuhkan waktu lebih lama dari biasanya. Berdasarkan data sistem Karsa Pantau saat ini:\n\n${projectContext}\n\nSilakan ajukan pertanyaan kembali atau periksa detail Kurva S pada menu Proyek.`
          : `Maaf, layanan asisten AI sedang mengalami antrean pemrosesan server. Rincian anggaran dan progres dapat Anda pantau langsung melalui menu Proyek & Keuangan. Silakan coba beberapa saat lagi.`;
        fullResponse = fallbackText;
        yield fallbackText;
      }
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
        ) VALUES ($1, 'chat_response', $2, $3, $4, $5, $6);
        `,
        [
          projectId,
          JSON.stringify({ query: message }),
          JSON.stringify({ response: fullResponse }),
          Math.round((message.length + fullResponse.length) / 4),
          this.nineRouter.getDefaultModel(),
          organizationId,
        ],
      );
    } catch (saveErr: any) {
      this.logger.warn(`Gagal mencatat chat ke ai_insights: ${saveErr.message}`);
    }
  }
}

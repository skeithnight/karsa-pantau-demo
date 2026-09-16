import { Controller, Get, Post, Body, Param, Query, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { NineRouterService } from './services/nine-router.service';
import { AiSemanticSearchService } from './services/ai-semantic-search.service';
import { AiAnomalyService } from './services/ai-anomaly.service';
import { AiForecastService } from './services/ai-forecast.service';
import { AiChatService, ChatRequestDto } from './services/ai-chat.service';
import { DatabaseService } from '../../database/database.service';

@Controller('ai')
@UseGuards(AuthGuard('jwt'))
export class AiController {
  constructor(
    private readonly nineRouter: NineRouterService,
    private readonly semanticSearchService: AiSemanticSearchService,
    private readonly anomalyService: AiAnomalyService,
    private readonly forecastService: AiForecastService,
    private readonly chatService: AiChatService,
    private readonly db: DatabaseService,
  ) {}

  @Get('status')
  async getStatus() {
    const health = await this.nineRouter.isAvailable();
    return {
      service: '9Router AI Gateway',
      baseUrl: (process.env.NINE_ROUTER_BASE_URL || 'http://localhost:20128/v1'),
      ...health,
    };
  }

  @Get('semantic-search')
  async semanticSearch(
    @Query('q') query?: string,
    @Query('organizationId') orgId?: string,
  ) {
    return this.semanticSearchService.searchPriceHistory(query || '', orgId);
  }

  @Get('price-guardrail')
  async checkPriceGuardrail(
    @Query('description') description: string,
    @Query('unitPrice') unitPrice: string,
    @Query('unit') unit?: string,
    @Query('category') category?: string,
  ) {
    const price = parseFloat(unitPrice || '0');
    return this.semanticSearchService.checkPriceGuardrail(description || '', price, unit, category);
  }

  @Post('anomalies/:projectId')
  async triggerAnomalyDetectionPost(
    @Param('projectId') projectId: string,
    @Query('threshold') threshold?: string,
  ) {
    const thresholdNum = threshold ? parseInt(threshold, 10) : 10;
    return this.anomalyService.detectProjectAnomalies(projectId, thresholdNum);
  }

  @Get('anomalies/:projectId')
  async triggerAnomalyDetectionGet(
    @Param('projectId') projectId: string,
    @Query('threshold') threshold?: string,
  ) {
    const thresholdNum = threshold ? parseInt(threshold, 10) : 10;
    return this.anomalyService.detectProjectAnomalies(projectId, thresholdNum);
  }

  @Get('forecast/:projectId')
  async getForecast(@Param('projectId') projectId: string) {
    return this.forecastService.generateForecast(projectId);
  }

  @Post('chat')
  async streamChat(@Body() body: ChatRequestDto, @Res() res: Response) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    if (typeof (res as any).flushHeaders === 'function') {
      (res as any).flushHeaders();
    }
    // Kirim keepalive awal agar proxy Caddy dan browser segera membuka stream SSE
    res.write(': keep-alive\n\n');

    try {
      for await (const chunk of this.chatService.streamProjectChat(body)) {
        res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
      }
      res.write('data: [DONE]\n\n');
      res.end();
    } catch (err: any) {
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      res.end();
    }
  }

  @Get('insights/:projectId')
  async getProjectInsights(
    @Param('projectId') projectId: string,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 50;
    const sql = `
      SELECT id, project_id, type, input_context, output, tokens_used, model_used, latency_ms, created_at
      FROM ai_insights
      WHERE project_id = $1
      ORDER BY created_at DESC
      LIMIT $2;
    `;
    const result = await this.db.query(sql, [projectId, limitNum]);
    return result.rows;
  }
}

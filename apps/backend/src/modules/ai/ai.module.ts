import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { AiController } from './ai.controller';
import { NineRouterService } from './services/nine-router.service';
import { AiSemanticSearchService } from './services/ai-semantic-search.service';
import { AiAnomalyService } from './services/ai-anomaly.service';
import { AiForecastService } from './services/ai-forecast.service';
import { AiChatService } from './services/ai-chat.service';

@Module({
  imports: [DatabaseModule],
  controllers: [AiController],
  providers: [
    NineRouterService,
    AiSemanticSearchService,
    AiAnomalyService,
    AiForecastService,
    AiChatService,
  ],
  exports: [
    NineRouterService,
    AiSemanticSearchService,
    AiAnomalyService,
    AiForecastService,
    AiChatService,
  ],
})
export class AiModule {}

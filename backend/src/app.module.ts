import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { VenuesModule } from './modules/venues/venues.module';
import { ScraperModule } from './modules/scraper/scraper.module';
import { EnrichmentModule } from './modules/enrichment/enrichment.module';
import { MessagesModule } from './modules/messages/messages.module';
import { PipelineModule } from './modules/pipeline/pipeline.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    VenuesModule,
    ScraperModule,
    EnrichmentModule,
    MessagesModule,
    PipelineModule,
  ],
})
export class AppModule {}

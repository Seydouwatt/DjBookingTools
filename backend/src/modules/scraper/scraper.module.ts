import { Module } from '@nestjs/common';
import { ScraperController } from './scraper.controller';
import { ScraperService } from './scraper.service';
import { EnrichmentModule } from '../enrichment/enrichment.module';
import { VenuesModule } from '../venues/venues.module';

@Module({
  imports: [EnrichmentModule, VenuesModule],
  controllers: [ScraperController],
  providers: [ScraperService],
})
export class ScraperModule {}

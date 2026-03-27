import { Module } from "@nestjs/common";
import { VenuesController } from "./venues.controller";
import { VenuesService } from "./venues.service";
import { EnrichmentService } from "../enrichment/enrichment.service";

@Module({
  controllers: [VenuesController],
  providers: [VenuesService, EnrichmentService],
  exports: [VenuesService],
})
export class VenuesModule {}

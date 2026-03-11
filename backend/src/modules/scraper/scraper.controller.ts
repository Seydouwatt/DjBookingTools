import { Controller, Post, Get, Body, UseGuards } from "@nestjs/common";
import { ScraperService } from "./scraper.service";

@Controller("scraper")
export class ScraperController {
  constructor(private readonly scraperService: ScraperService) {}

  @Post("start")
  start(@Body() body: { city: string; type: string; limit?: number }) {
    return this.scraperService.startScraping(body.city, body.type, body.limit);
  }

  @Get("status")
  status() {
    return this.scraperService.getStatus();
  }
}

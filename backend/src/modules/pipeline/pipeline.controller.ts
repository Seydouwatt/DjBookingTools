import { Controller, Get, Put, Param, Body, UseGuards } from "@nestjs/common";
import { PipelineService } from "./pipeline.service";

@Controller("pipeline")
export class PipelineController {
  constructor(private readonly pipelineService: PipelineService) {}

  @Get()
  getColumns() {
    return this.pipelineService.getColumns();
  }

  @Put(":id/move")
  moveVenue(@Param("id") id: string, @Body() body: { status: string }) {
    return this.pipelineService.moveVenue(id, body.status);
  }
}

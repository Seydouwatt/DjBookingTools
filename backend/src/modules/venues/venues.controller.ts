import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
} from "@nestjs/common";
import { VenuesService } from "./venues.service";
import { CreateVenueDto } from "./dto/create-venue.dto";
import { UpdateVenueDto } from "./dto/update-venue.dto";

@Controller("venues")
export class VenuesController {
  constructor(private readonly venuesService: VenuesService) {}

  @Get("stats")
  getStats() {
    return this.venuesService.getStats();
  }

  @Get()
  findAll(
    @Query("status") status?: string,
    @Query("city") city?: string,
    @Query("search") search?: string,
    @Query("followup") followup?: string,
    @Query("sortBy") sortBy?: string,
    @Query("sortOrder") sortOrder?: "asc" | "desc",
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    return this.venuesService.findAll({
      status,
      city,
      search,
      followup: followup === "true",
      sortBy,
      sortOrder,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.venuesService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateVenueDto) {
    return this.venuesService.create(dto);
  }

  @Post(":id/reenrich")
  async reenrich(@Param("id") id: string) {
    return this.venuesService.reenrichVenue(id);
  }

  @Post("reenrich-incomplete")
  async reenrichIncomplete() {
    return this.venuesService.reenrichIncompleteVenues();
  }

  @Post(":id/find-email")
  async findEmail(@Param("id") id: string) {
    return this.venuesService.findEmail(id);
  }

  @Put(":id")
  update(@Param("id") id: string, @Body() dto: UpdateVenueDto) {
    return this.venuesService.update(id, dto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.venuesService.remove(id);
  }
}

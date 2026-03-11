import { Injectable, NotFoundException } from "@nestjs/common";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { CreateVenueDto } from "./dto/create-venue.dto";
import { UpdateVenueDto } from "./dto/update-venue.dto";

@Injectable()
export class VenuesService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }

  async findAll(filters?: {
    status?: string;
    city?: string;
    search?: string;
    followup?: boolean;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    page?: number;
    limit?: number;
  }) {
    let query = this.supabase.from("venues").select("*");

    if (filters?.status) {
      query = query.eq("status", filters.status);
    }

    if (filters?.city) {
      query = query.ilike("city", `%${filters.city}%`);
    }

    if (filters?.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,city.ilike.%${filters.search}%,email.ilike.%${filters.search}%,address.ilike.%${filters.search}%`,
      );
    }

    if (filters?.followup) {
      const today = new Date().toISOString().split("T")[0];
      query = query
        .lte("next_followup_date", today)
        .not("next_followup_date", "is", null);
    }

    const sortBy = filters?.sortBy || "created_at";
    const sortOrder = filters?.sortOrder === "asc" ? false : true;
    query = query.order(sortBy, { ascending: !sortOrder });

    const page = filters?.page || 1;
    const limit = filters?.limit || 100;
    const from = (page - 1) * limit;
    query = query.range(from, from + limit - 1);

    const { data, error, count } = await query;
    if (error) throw new Error(error.message);
    return { data, count };
  }

  async findOne(id: string) {
    const { data, error } = await this.supabase
      .from("venues")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw new NotFoundException("Venue not found");
    return data;
  }

  async create(dto: CreateVenueDto) {
    const { data, error } = await this.supabase
      .from("venues")
      .insert({ ...dto, status: dto.status || "to_contact" })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  async update(id: string, dto: UpdateVenueDto) {
    const { data, error } = await this.supabase
      .from("venues")
      .update(dto)
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  async remove(id: string) {
    const { error } = await this.supabase.from("venues").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return { success: true };
  }

  async bulkInsert(venues: CreateVenueDto[]) {
    const toInsert = venues.map((v) => ({
      ...v,
      status: v.status || "to_contact",
    }));
    const { data, error } = await this.supabase
      .from("venues")
      .upsert(toInsert, { onConflict: "name,city", ignoreDuplicates: true })
      .select();
    if (error) throw new Error(error.message);
    return data;
  }

  async getStats() {
    const { data, error } = await this.supabase.from("venues").select("status");
    if (error) throw new Error(error.message);

    const stats = {
      total: data.length,
      to_contact: 0,
      contacted: 0,
      discussion: 0,
      booked: 0,
      no_response: 0,
      not_interested: 0,
    };

    data.forEach((v) => {
      if (v.status in stats) stats[v.status]++;
    });

    const today = new Date().toISOString().split("T")[0];
    const { count: followupCount } = await this.supabase
      .from("venues")
      .select("*", { count: "exact", head: true })
      .lte("next_followup_date", today)
      .not("next_followup_date", "is", null);

    return { ...stats, followup_due: followupCount || 0 };
  }
}

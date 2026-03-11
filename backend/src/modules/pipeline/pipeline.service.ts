import { Injectable } from "@nestjs/common";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

@Injectable()
export class PipelineService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }

  async getColumns() {
    const statuses = [
      "to_contact",
      "contacted",
      "discussion",
      "booked",
      "no_response",
      "not_interested",
    ];

    const results = await Promise.all(
      statuses.map(async (status) => {
        const { data } = await this.supabase
          .from("venues")
          .select("id, name, city, category, instagram, email, rating")
          .eq("status", status)

          .order("created_at", { ascending: false });
        return { status, venues: data || [] };
      }),
    );

    return results;
  }

  async moveVenue(venueId: string, newStatus: string) {
    const { data, error } = await this.supabase
      .from("venues")
      .update({ status: newStatus })
      .eq("id", venueId)

      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }
}

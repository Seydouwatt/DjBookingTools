import { Injectable, NotFoundException } from "@nestjs/common";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { CreateVenueDto } from "./dto/create-venue.dto";
import { UpdateVenueDto } from "./dto/update-venue.dto";
import { EnrichmentService } from "../enrichment/enrichment.service";

@Injectable()
export class VenuesService {
  private supabase: SupabaseClient;

  constructor(private enrichmentService: EnrichmentService) {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }

  private async findEmailViaGoogle(
    name: string,
    city?: string,
  ): Promise<string | null> {
    try {
      const query = `"${name}" ${city || ""} email`;
      const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;

      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120 Safari/537.36",
        },
      });

      const html = await response.text();

      const emailRegex = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
      const matches = html.match(emailRegex);

      if (!matches) return null;

      const filtered = matches.find(
        (e) =>
          !e.includes("example") &&
          !e.includes("google") &&
          !e.includes("sentry"),
      );

      return filtered || null;
    } catch {
      return null;
    }
  }

  private async findEmailViaSocial(
    name: string,
    city?: string,
  ): Promise<string | null> {
    try {
      const queries = [
        `site:instagram.com "${name}" ${city || ""} email`,
        `site:facebook.com "${name}" ${city || ""} email`,
      ];

      for (const q of queries) {
        const url = `https://www.google.com/search?q=${encodeURIComponent(q)}`;

        const response = await fetch(url, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120 Safari/537.36",
          },
        });

        const html = await response.text();

        const emailRegex = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;

        const matches = html.match(emailRegex);

        if (!matches) continue;

        const filtered = matches.find(
          (e) =>
            !e.includes("example") &&
            !e.includes("google") &&
            !e.includes("sentry"),
        );

        if (filtered) return filtered;
      }

      return null;
    } catch {
      return null;
    }
  }

  private async findEmailViaGoogleMaps(
    mapsUrl?: string,
  ): Promise<string | null> {
    if (!mapsUrl) return null;

    try {
      const response = await fetch(mapsUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120 Safari/537.36",
        },
      });

      const html = await response.text();

      const mailtoMatch = html.match(
        /mailto:([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/,
      );
      if (mailtoMatch) return mailtoMatch[1];

      const emailRegex = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
      const matches = html.match(emailRegex);

      if (!matches) return null;

      const filtered = matches.find(
        (e) =>
          !e.includes("example") &&
          !e.includes("google") &&
          !e.includes("sentry"),
      );

      return filtered || null;
    } catch {
      return null;
    }
  }

  async findEmail(id: string) {
    const venue = await this.findOne(id);

    if (!venue) {
      throw new Error("Venue not found");
    }

    let email: string | null = venue.email || null;

    // Try extracting email from Google Maps page
    if (!email && venue.google_maps_url) {
      try {
        const mapsEmail = await this.findEmailViaGoogleMaps(
          venue.google_maps_url,
        );
        if (mapsEmail) email = mapsEmail;
      } catch {}
    }

    if (!email && venue.website) {
      try {
        const enriched = await this.enrichmentService.enrichFromWebsite(
          venue.website,
        );
        email = enriched.email || null;
      } catch {}
    }

    // Try Google search enrichment if still no email
    if (!email && venue.name) {
      try {
        const googleEmail = await this.findEmailViaGoogle(
          venue.name,
          venue.city,
        );
        if (googleEmail) email = googleEmail;
      } catch {}
    }

    // Try social network enrichment
    if (!email && venue.name) {
      try {
        const socialEmail = await this.findEmailViaSocial(
          venue.name,
          venue.city,
        );
        if (socialEmail) email = socialEmail;
      } catch {}
    }

    if (email) {
      await this.supabase.from("venues").update({ email }).eq("id", id);
    }

    return { email };
  }

  async reenrichIncompleteVenues() {
    const { data: venues } = await this.supabase
      .from("venues")
      .select("*")
      .or("email.is.null,instagram.is.null,facebook.is.null");

    if (!venues?.length) return { processed: 0 };

    const BATCH_SIZE = 5; // nombre de scrapes en parallèle
    let processed = 0;

    for (let i = 0; i < venues.length; i += BATCH_SIZE) {
      const batch = venues.slice(i, i + BATCH_SIZE);

      await Promise.all(
        batch.map(async (venue) => {
          try {
            await this.reenrichVenue(venue.id);
            processed++;
          } catch (err) {
            console.error("Erreur reenrich venue", venue.id);
          }
        }),
      );
    }

    return { processed };
  }

  async reenrichVenue(id: string) {
    const venue = await this.findOne(id);

    if (!venue) throw new Error("Venue not found");

    let enriched: any = {};

    if (venue.website) {
      try {
        enriched = await this.enrichmentService.enrichFromWebsite(
          venue.website,
        );
      } catch {}
    }

    let instagram = venue.instagram || enriched.instagram || null;
    let facebook = venue.facebook || enriched.facebook || null;
    let email = venue.email || enriched.email || null;

    await this.supabase
      .from("venues")
      .update({
        instagram,
        facebook,
        email,
        updated_at: new Date(),
      })
      .eq("id", id);

    return { success: true };
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

import { Injectable } from "@nestjs/common";
import axios from "axios";
import * as cheerio from "cheerio";

export interface EnrichmentResult {
  email?: string;
  instagram?: string;
  facebook?: string;
}

@Injectable()
export class EnrichmentService {
  private readonly pagesToVisit = [
    "",
    "/contact",
    "/about",
    "/nous-contacter",
    "/contact-us",
  ];

  async enrichFromWebsite(websiteUrl: string): Promise<EnrichmentResult> {
    const result: EnrichmentResult = {};
    const baseUrl = websiteUrl.replace(/\/$/, "");

    for (const path of this.pagesToVisit) {
      try {
        const url = `${baseUrl}${path}`;
        const response = await axios.get(url, {
          timeout: 8000,
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
          },
          maxRedirects: 3,
        });

        const $ = cheerio.load(response.data);
        const html = response.data as string;

        // Extract from structured data (JSON-LD)
        try {
          const scripts = $('script[type="application/ld+json"]');
          scripts.each((_, el) => {
            try {
              const json = JSON.parse($(el).contents().text());

              const candidates = Array.isArray(json) ? json : [json];

              for (const item of candidates) {
                if (!result.email && item.email) {
                  result.email = item.email;
                }

                if (
                  !result.instagram &&
                  item.sameAs &&
                  Array.isArray(item.sameAs)
                ) {
                  const insta = item.sameAs.find((l: string) =>
                    l.includes("instagram.com"),
                  );
                  if (insta) result.instagram = insta;

                  const fb = item.sameAs.find((l: string) =>
                    l.includes("facebook.com"),
                  );
                  if (!result.facebook && fb) result.facebook = fb;
                }
              }
            } catch {}
          });
        } catch {}

        // Extract email
        if (!result.email) {
          const emailMatch = html.match(
            /mailto:([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/,
          );
          if (emailMatch) result.email = emailMatch[1];

          if (!result.email) {
            const emailRegex =
              /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
            const emails = html.match(emailRegex);
            if (emails) {
              result.email = emails.find(
                (e) =>
                  !e.includes("example") &&
                  !e.includes("sentry") &&
                  !e.includes("wix"),
              );
            }
          }

          // Check mailto links explicitly
          if (!result.email) {
            $('a[href^="mailto:"]').each((_, el) => {
              const href = $(el).attr("href");
              if (href) {
                const match = href.match(/mailto:([^?]+)/);
                if (match) result.email = match[1];
              }
            });
          }

          // Check tooltip / aria-label
          if (!result.email) {
            $("[data-tooltip], [aria-label]").each((_, el) => {
              const text =
                $(el).attr("data-tooltip") || $(el).attr("aria-label") || "";
              const match = text.match(
                /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/,
              );
              if (match) result.email = match[0];
            });
          }
        }

        // Extract Instagram
        if (!result.instagram) {
          $('a[href*="instagram.com"]').each((_, el) => {
            const href = $(el).attr("href");
            if (href && href.includes("instagram.com")) {
              const match = href.match(/instagram\.com\/([^/?#]+)/);
              if (match && match[1] && match[1] !== "p") {
                result.instagram = `https://instagram.com/${match[1]}`;
              }
            }
          });

          // Look inside meta tags
          if (!result.instagram) {
            $("meta").each((_, el) => {
              const content = $(el).attr("content") || "";
              if (content.includes("instagram.com")) {
                const match = content.match(/instagram\.com\/([^/?#]+)/);
                if (match)
                  result.instagram = `https://instagram.com/${match[1]}`;
              }
            });
          }
        }

        // Extract Facebook
        if (!result.facebook) {
          $('a[href*="facebook.com"]').each((_, el) => {
            const href = $(el).attr("href");
            if (
              href &&
              href.includes("facebook.com") &&
              !href.includes("share")
            ) {
              result.facebook = href;
            }
          });

          // Look inside meta tags
          if (!result.facebook) {
            $("meta").each((_, el) => {
              const content = $(el).attr("content") || "";
              if (content.includes("facebook.com")) {
                result.facebook = content;
              }
            });
          }
        }

        if (result.email && result.instagram && result.facebook) break;
      } catch {
        // page not accessible, skip
      }
    }

    return result;
  }
}

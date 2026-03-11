import { Injectable } from "@nestjs/common";
import puppeteer, { Browser } from "puppeteer";
import { EnrichmentService } from "../enrichment/enrichment.service";
import { VenuesService } from "../venues/venues.service";

export interface ScraperJob {
  id: string;
  status: "idle" | "running" | "completed" | "error";
  city: string;
  type: string;
  limit: number;
  found: number;
  progress: number;
  error?: string;
  startedAt?: Date;
  completedAt?: Date;
}

const USER_AGENTS = [
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
];

function randomDelay(min = 1500, max = 3500): Promise<void> {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

function classifyVenue(name: string, category?: string): string {
  const text = `${name} ${category || ""}`.toLowerCase();
  if (text.includes("guinguette")) return "guinguette";
  if (text.includes("péniche") || text.includes("peniche")) return "peniche";
  if (text.includes("club") || text.includes("nightclub")) return "club";
  if (text.includes("festival")) return "festival spot";
  if (text.includes("tiers-lieu") || text.includes("tiers lieu"))
    return "tiers-lieu";
  if (
    text.includes("restaurant") &&
    (text.includes("music") || text.includes("live"))
  )
    return "restaurant musical";
  if (text.includes("bar")) return "bar";
  return "bar";
}

@Injectable()
export class ScraperService {
  private currentJob: ScraperJob | null = null;

  constructor(
    private readonly enrichmentService: EnrichmentService,
    private readonly venuesService: VenuesService,
  ) {}

  getStatus(): ScraperJob {
    return (
      this.currentJob || {
        id: "",
        status: "idle",
        city: "",
        type: "",
        limit: 0,
        found: 0,
        progress: 0,
      }
    );
  }

  async startScraping(
    city: string,
    type: string,
    limit = 50,
  ): Promise<ScraperJob> {
    if (this.currentJob?.status === "running") {
      throw new Error("A scraping job is already running");
    }

    const job: ScraperJob = {
      id: Date.now().toString(),
      status: "running",
      city,
      type,
      limit: Math.min(limit, 100),
      found: 0,
      progress: 0,
      startedAt: new Date(),
    };

    this.currentJob = job;
    this.runScrapingJob(job).catch((err) => {
      job.status = "error";
      job.error = err.message;
    });

    return job;
  }

  private async runScrapingJob(job: ScraperJob): Promise<void> {
    let browser: Browser | null = null;

    try {
      browser = await puppeteer.launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--no-first-run",
          "--no-zygote",
          "--disable-gpu",
        ],
      });

      const page = await browser.newPage();
      await page.setUserAgent(randomUserAgent());
      await page.setViewport({ width: 1280, height: 800 });

      const searchQuery = `${job.type} ${job.city}`;
      const searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(searchQuery)}`;

      await page.goto(searchUrl, { waitUntil: "networkidle2", timeout: 30000 });
      await randomDelay(2000, 4000);

      // Scroll to load more results
      const resultsSelector = '[role="feed"]';
      let previousCount = 0;
      let sameCountRetries = 0;

      while (job.found < job.limit) {
        await page.evaluate((selector) => {
          const feed = document.querySelector(selector);
          if (feed) feed.scrollTop = feed.scrollHeight;
        }, resultsSelector);

        await randomDelay(1500, 2500);

        const links = await page.$$eval('a[href*="/maps/place/"]', (els) =>
          els.map((el) => el.getAttribute("href")).filter(Boolean),
        );
        const uniqueLinks = [...new Set(links)].slice(0, job.limit);

        if (uniqueLinks.length === previousCount) {
          sameCountRetries++;
          if (sameCountRetries >= 3) break;
        } else {
          sameCountRetries = 0;
          previousCount = uniqueLinks.length;
        }

        if (uniqueLinks.length >= job.limit) break;
      }

      const placeLinks = await page.$$eval('a[href*="/maps/place/"]', (els) => [
        ...new Set(els.map((el) => el.getAttribute("href")).filter(Boolean)),
      ]);

      const toProcess = placeLinks.slice(0, job.limit);
      const venues: any[] = [];

      for (let i = 0; i < toProcess.length; i++) {
        const link = toProcess[i];
        job.progress = Math.round((i / toProcess.length) * 100);

        try {
          const detailPage = await browser.newPage();
          await detailPage.setUserAgent(randomUserAgent());

          const fullUrl = link.startsWith("http")
            ? link
            : `https://www.google.com${link}`;
          await detailPage.goto(fullUrl, {
            waitUntil: "networkidle2",
            timeout: 20000,
          });
          await randomDelay(1000, 2500);

          const venueData = await detailPage.evaluate(() => {
            const getText = (selector: string) =>
              document.querySelector(selector)?.textContent?.trim() || "";

            const name = getText("h1");
            const address =
              getText('[data-item-id="address"] .fontBodyMedium') ||
              getText(".rogA2c .fontBodyMedium");
            const phone =
              getText('[data-item-id*="phone"] .fontBodyMedium') ||
              getText('[data-tooltip*="phone"] .fontBodyMedium');
            const website =
              (
                document.querySelector(
                  '[data-item-id="authority"] a',
                ) as HTMLAnchorElement
              )?.href || "";
            const ratingText = getText(".F7nice span[aria-hidden]");
            const rating = ratingText
              ? parseFloat(ratingText.replace(",", "."))
              : null;
            const reviewsText =
              getText('.F7nice span[aria-label*="avis"]') ||
              getText('.F7nice span[aria-label*="review"]');
            const reviewsMatch = reviewsText.match(/(\d[\d\s]*)/);
            const reviews_count = reviewsMatch
              ? parseInt(reviewsMatch[1].replace(/\s/g, ""))
              : null;

            const category =
              getText(".DkEaL") || getText(".mgr77e .fontBodyMedium");

            return {
              name,
              address,
              phone,
              website,
              rating,
              reviews_count,
              category,
            };
          });

          if (venueData.name) {
            const cityMatch =
              venueData.address?.match(/\d{5}\s+(.+)$/) ||
              venueData.address?.match(/,\s*([^,]+)$/);
            const postal_code = venueData.address?.match(/\d{5}/)?.[0];
            const city = cityMatch ? cityMatch[1].trim() : job.city;

            let enriched: any = {};
            if (venueData.website) {
              try {
                enriched = await this.enrichmentService.enrichFromWebsite(
                  venueData.website,
                );
              } catch {}
            }

            venues.push({
              name: venueData.name,
              address: venueData.address,
              city,
              postal_code,
              phone: venueData.phone,
              website: venueData.website,
              google_maps_url: fullUrl,
              rating: venueData.rating,
              reviews_count: venueData.reviews_count,
              category: classifyVenue(venueData.name, venueData.category),
              ...enriched,
            });

            job.found++;
          }

          await detailPage.close();
          await randomDelay(2000, 4000);
        } catch {
          // skip this venue
        }
      }

      if (venues.length > 0) {
        await this.venuesService.bulkInsert(venues);
      }

      job.status = "completed";
      job.progress = 100;
      job.completedAt = new Date();
    } catch (err) {
      job.status = "error";
      job.error = err.message;
    } finally {
      if (browser) await browser.close();
    }
  }
}

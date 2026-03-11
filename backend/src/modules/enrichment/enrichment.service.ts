import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';

export interface EnrichmentResult {
  email?: string;
  instagram?: string;
  facebook?: string;
}

@Injectable()
export class EnrichmentService {
  private readonly pagesToVisit = ['', '/contact', '/about', '/nous-contacter', '/contact-us'];

  async enrichFromWebsite(websiteUrl: string): Promise<EnrichmentResult> {
    const result: EnrichmentResult = {};
    const baseUrl = websiteUrl.replace(/\/$/, '');

    for (const path of this.pagesToVisit) {
      try {
        const url = `${baseUrl}${path}`;
        const response = await axios.get(url, {
          timeout: 8000,
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
          },
          maxRedirects: 3,
        });

        const $ = cheerio.load(response.data);
        const html = response.data as string;

        // Extract email
        if (!result.email) {
          const emailMatch = html.match(/mailto:([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/);
          if (emailMatch) result.email = emailMatch[1];

          if (!result.email) {
            const emailRegex = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
            const emails = html.match(emailRegex);
            if (emails) {
              result.email = emails.find(
                (e) => !e.includes('example') && !e.includes('sentry') && !e.includes('wix'),
              );
            }
          }
        }

        // Extract Instagram
        if (!result.instagram) {
          $('a[href*="instagram.com"]').each((_, el) => {
            const href = $(el).attr('href');
            if (href && href.includes('instagram.com')) {
              const match = href.match(/instagram\.com\/([^/?#]+)/);
              if (match && match[1] && match[1] !== 'p') {
                result.instagram = `https://instagram.com/${match[1]}`;
              }
            }
          });
        }

        // Extract Facebook
        if (!result.facebook) {
          $('a[href*="facebook.com"]').each((_, el) => {
            const href = $(el).attr('href');
            if (href && href.includes('facebook.com') && !href.includes('share')) {
              result.facebook = href;
            }
          });
        }

        if (result.email && result.instagram && result.facebook) break;
      } catch {
        // page not accessible, skip
      }
    }

    return result;
  }
}

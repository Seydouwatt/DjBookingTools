import { create } from 'zustand';
import { ScraperJob } from '../types/venue';
import { scraperApi } from '../lib/api';

interface ScraperStore {
  job: ScraperJob | null;
  polling: boolean;
  startScraping: (city: string, type: string, limit: number) => Promise<void>;
  pollStatus: () => Promise<void>;
  stopPolling: () => void;
}

let pollInterval: ReturnType<typeof setInterval> | null = null;

export const useScraperStore = create<ScraperStore>((set, get) => ({
  job: null,
  polling: false,

  startScraping: async (city, type, limit) => {
    const job = await scraperApi.start(city, type, limit);
    set({ job, polling: true });

    pollInterval = setInterval(async () => {
      await get().pollStatus();
    }, 3000);
  },

  pollStatus: async () => {
    try {
      const job = await scraperApi.status();
      set({ job });
      if (job.status === 'completed' || job.status === 'error') {
        get().stopPolling();
      }
    } catch {}
  },

  stopPolling: () => {
    if (pollInterval) {
      clearInterval(pollInterval);
      pollInterval = null;
    }
    set({ polling: false });
  },
}));

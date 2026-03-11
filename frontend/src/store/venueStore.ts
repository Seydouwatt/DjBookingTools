import { create } from 'zustand';
import { Venue, DashboardStats } from '../types/venue';
import { venuesApi } from '../lib/api';

interface VenueStore {
  venues: Venue[];
  total: number;
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
  filters: {
    status?: string;
    city?: string;
    search?: string;
    followup?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  };

  fetchVenues: () => Promise<void>;
  fetchStats: () => Promise<void>;
  setFilters: (filters: Partial<VenueStore['filters']>) => void;
  updateVenue: (id: string, data: Partial<Venue>) => Promise<void>;
  deleteVenue: (id: string) => Promise<void>;
  createVenue: (venue: Partial<Venue>) => Promise<void>;
}

export const useVenueStore = create<VenueStore>((set, get) => ({
  venues: [],
  total: 0,
  stats: null,
  loading: false,
  error: null,
  filters: { page: 1, limit: 100 },

  fetchVenues: async () => {
    set({ loading: true, error: null });
    try {
      const { filters } = get();
      const params: Record<string, string> = {};
      if (filters.status) params.status = filters.status;
      if (filters.city) params.city = filters.city;
      if (filters.search) params.search = filters.search;
      if (filters.followup) params.followup = 'true';
      if (filters.sortBy) params.sortBy = filters.sortBy;
      if (filters.sortOrder) params.sortOrder = filters.sortOrder;
      if (filters.page) params.page = String(filters.page);
      if (filters.limit) params.limit = String(filters.limit);

      const { data, count } = await venuesApi.getAll(params);
      set({ venues: data, total: count || 0 });
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },

  fetchStats: async () => {
    try {
      const stats = await venuesApi.getStats();
      set({ stats });
    } catch {}
  },

  setFilters: (filters) => {
    set((state) => ({ filters: { ...state.filters, ...filters } }));
  },

  updateVenue: async (id, data) => {
    const updated = await venuesApi.update(id, data);
    set((state) => ({
      venues: state.venues.map((v) => (v.id === id ? { ...v, ...updated } : v)),
    }));
  },

  deleteVenue: async (id) => {
    await venuesApi.delete(id);
    set((state) => ({ venues: state.venues.filter((v) => v.id !== id) }));
  },

  createVenue: async (venue) => {
    const created = await venuesApi.create(venue);
    set((state) => ({ venues: [created, ...state.venues] }));
  },
}));

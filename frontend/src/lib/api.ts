import axios from 'axios';
import { Venue, ScraperJob, DashboardStats } from '../types/venue';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Venues
export const venuesApi = {
  getAll: (params?: Record<string, string>) =>
    api.get<{ data: Venue[]; count: number }>('/venues', { params }).then((r) => r.data),

  getOne: (id: string) => api.get<Venue>(`/venues/${id}`).then((r) => r.data),

  create: (venue: Partial<Venue>) => api.post<Venue>('/venues', venue).then((r) => r.data),

  update: (id: string, venue: Partial<Venue>) =>
    api.put<Venue>(`/venues/${id}`, venue).then((r) => r.data),

  delete: (id: string) => api.delete(`/venues/${id}`).then((r) => r.data),

  getStats: () => api.get<DashboardStats>('/venues/stats').then((r) => r.data),
};

// Scraper
export const scraperApi = {
  start: (city: string, type: string, limit: number) =>
    api.post<ScraperJob>('/scraper/start', { city, type, limit }).then((r) => r.data),

  status: () => api.get<ScraperJob>('/scraper/status').then((r) => r.data),
};

// Pipeline
export const pipelineApi = {
  getColumns: () =>
    api.get<{ status: string; venues: Partial<Venue>[] }[]>('/pipeline').then((r) => r.data),

  moveVenue: (id: string, status: string) =>
    api.put(`/pipeline/${id}/move`, { status }).then((r) => r.data),
};

// Messages
export const messagesApi = {
  generate: (venue: Partial<Venue>, djName?: string, mixLink?: string) =>
    api
      .post<{ message: string }>('/messages/generate', { venue, djName, mixLink })
      .then((r) => r.data),
};

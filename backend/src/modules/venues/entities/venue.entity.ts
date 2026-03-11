export type VenueStatus =
  | 'to_contact'
  | 'contacted'
  | 'discussion'
  | 'booked'
  | 'no_response'
  | 'not_interested';

export type VenueCategory =
  | 'guinguette'
  | 'bar'
  | 'peniche'
  | 'club'
  | 'tiers-lieu'
  | 'restaurant musical'
  | 'festival spot'
  | 'autre';

export interface Venue {
  id: string;
  name: string;
  address?: string;
  city?: string;
  postal_code?: string;
  phone?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  email?: string;
  google_maps_url?: string;
  rating?: number;
  reviews_count?: number;
  category?: VenueCategory;
  status: VenueStatus;
  notes?: string;
  last_contact_date?: string;
  next_followup_date?: string;
  created_at: string;
}

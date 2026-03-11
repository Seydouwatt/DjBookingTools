import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { pipelineApi } from '../lib/api';
import { venuesApi } from '../lib/api';
import { VenueStatus } from '../types/venue';
import { StatusBadge } from '../components/StatusBadge';

interface PipelineVenue {
  id: string;
  name: string;
  city?: string;
  category?: string;
  instagram?: string;
  email?: string;
  rating?: number;
}

interface Column {
  status: VenueStatus;
  label: string;
  color: string;
  venues: PipelineVenue[];
}

const COLUMNS_CONFIG: { status: VenueStatus; label: string; color: string }[] = [
  { status: 'to_contact', label: 'À contacter', color: 'border-blue-500' },
  { status: 'contacted', label: 'Contacté', color: 'border-yellow-500' },
  { status: 'discussion', label: 'En discussion', color: 'border-orange-500' },
  { status: 'booked', label: 'Booké ✅', color: 'border-green-500' },
  { status: 'no_response', label: 'Pas de réponse', color: 'border-gray-500' },
  { status: 'not_interested', label: 'Pas intéressé', color: 'border-red-500' },
];

export const Pipeline: React.FC = () => {
  const [columns, setColumns] = useState<Column[]>([]);
  const [loading, setLoading] = useState(true);
  const [dragging, setDragging] = useState<string | null>(null);

  useEffect(() => {
    loadPipeline();
  }, []);

  const loadPipeline = async () => {
    setLoading(true);
    try {
      const data = await pipelineApi.getColumns();
      const cols: Column[] = COLUMNS_CONFIG.map((config) => {
        const found = data.find((d) => d.status === config.status);
        return { ...config, venues: (found?.venues || []) as PipelineVenue[] };
      });
      setColumns(cols);
    } catch {}
    setLoading(false);
  };

  const handleDragStart = (e: React.DragEvent, venueId: string) => {
    setDragging(venueId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: VenueStatus) => {
    e.preventDefault();
    if (!dragging) return;

    try {
      await pipelineApi.moveVenue(dragging, targetStatus);
      await loadPipeline();
    } catch {}
    setDragging(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-400">Chargement du pipeline...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Pipeline</h1>
        <p className="text-gray-400 text-sm mt-1">Glissez-déposez les lieux pour changer leur statut</p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((col) => (
          <div
            key={col.status}
            className={`flex-shrink-0 w-64 bg-gray-900 border border-gray-800 rounded-xl border-t-4 ${col.color}`}
            onDrop={(e) => handleDrop(e, col.status)}
            onDragOver={handleDragOver}
          >
            <div className="p-3 border-b border-gray-800">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{col.label}</span>
                <span className="text-xs bg-gray-800 px-2 py-0.5 rounded-full text-gray-400">
                  {col.venues.length}
                </span>
              </div>
            </div>

            <div className="p-2 space-y-2 min-h-32">
              {col.venues.map((venue) => (
                <div
                  key={venue.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, venue.id)}
                  className="bg-gray-800 border border-gray-700 rounded-lg p-3 cursor-grab hover:border-gray-500 transition-colors"
                >
                  <Link
                    to={`/venues/${venue.id}`}
                    className="block"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <p className="font-medium text-sm text-white hover:text-primary-400 transition-colors">
                      {venue.name}
                    </p>
                    {venue.city && (
                      <p className="text-xs text-gray-500 mt-0.5">{venue.city}</p>
                    )}
                  </Link>
                  {venue.category && (
                    <span className="inline-block mt-1 text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded">
                      {venue.category}
                    </span>
                  )}
                  <div className="flex gap-2 mt-2">
                    {venue.instagram && (
                      <a
                        href={venue.instagram}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-pink-400"
                        onClick={(e) => e.stopPropagation()}
                      >
                        📷
                      </a>
                    )}
                    {venue.email && (
                      <a
                        href={`mailto:${venue.email}`}
                        className="text-xs text-blue-400"
                        onClick={(e) => e.stopPropagation()}
                      >
                        ✉
                      </a>
                    )}
                    {venue.rating && (
                      <span className="text-xs text-yellow-400">★ {venue.rating}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

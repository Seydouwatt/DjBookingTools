import React, { useState } from 'react';
import { useScraperStore } from '../store/scraperStore';
import { useVenueStore } from '../store/venueStore';

interface Props {
  onClose: () => void;
}

const VENUE_TYPES = [
  'guinguette',
  'bar',
  'bar musique',
  'péniche bar',
  'club',
  'restaurant musique live',
  'bar terrasse',
  'concert',
];

export const ScraperModal: React.FC<Props> = ({ onClose }) => {
  const [city, setCity] = useState('Nantes');
  const [type, setType] = useState('guinguette');
  const [limit, setLimit] = useState(20);
  const { job, startScraping } = useScraperStore();
  const { fetchVenues, fetchStats } = useVenueStore();

  const handleStart = async () => {
    await startScraping(city, type, limit);
  };

  const isRunning = job?.status === 'running';
  const isCompleted = job?.status === 'completed';

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Lancer un scraping</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">✕</button>
        </div>

        {!isRunning && !isCompleted && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Ville</label>
              <input
                className="input w-full"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="ex: Nantes"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Type de lieu</label>
              <select
                className="input w-full"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                {VENUE_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Limite ({limit} lieux max)
              </label>
              <input
                type="range"
                min={5}
                max={100}
                step={5}
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="w-full accent-primary-500"
              />
            </div>
            <button
              onClick={handleStart}
              className="btn-primary w-full"
            >
              Lancer le scraping
            </button>
          </div>
        )}

        {isRunning && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-4xl mb-2 animate-spin">⚙️</div>
              <p className="text-gray-300">Scraping en cours...</p>
              <p className="text-sm text-gray-500">{job.city} — {job.type}</p>
            </div>
            <div className="bg-gray-800 rounded-full h-2">
              <div
                className="bg-primary-500 h-2 rounded-full transition-all"
                style={{ width: `${job.progress}%` }}
              />
            </div>
            <p className="text-center text-sm text-gray-400">
              {job.found} lieux trouvés — {job.progress}%
            </p>
          </div>
        )}

        {isCompleted && (
          <div className="text-center space-y-4">
            <div className="text-5xl">✅</div>
            <p className="text-lg font-medium">Scraping terminé !</p>
            <p className="text-gray-400">{job?.found} lieux ajoutés</p>
            <button
              onClick={() => {
                fetchVenues();
                fetchStats();
                onClose();
              }}
              className="btn-primary w-full"
            >
              Voir les résultats
            </button>
          </div>
        )}

        {job?.status === 'error' && (
          <div className="text-center space-y-4">
            <div className="text-5xl">❌</div>
            <p className="text-red-400">{job.error}</p>
            <button onClick={onClose} className="btn-secondary w-full">Fermer</button>
          </div>
        )}
      </div>
    </div>
  );
};

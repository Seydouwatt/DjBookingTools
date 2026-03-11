import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useVenueStore } from '../store/venueStore';
import { ScraperModal } from '../components/ScraperModal';

const StatCard: React.FC<{ label: string; value: number; color: string; link?: string }> = ({
  label, value, color, link,
}) => {
  const content = (
    <div className={`card flex flex-col gap-1 border-l-4 ${color} hover:border-opacity-100 transition-all`}>
      <span className="text-3xl font-bold">{value}</span>
      <span className="text-gray-400 text-sm">{label}</span>
    </div>
  );
  if (link) return <Link to={link}>{content}</Link>;
  return content;
};

export const Dashboard: React.FC = () => {
  const { stats, fetchStats, loading } = useVenueStore();
  const [showScraper, setShowScraper] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-400 mt-1">Vue d'ensemble de ta prospection</p>
        </div>
        <button onClick={() => setShowScraper(true)} className="btn-primary flex items-center gap-2">
          <span>🔍</span> Lancer un scraping
        </button>
      </div>

      {loading && <div className="text-gray-400">Chargement...</div>}

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total lieux" value={stats.total} color="border-gray-500" link="/venues" />
          <StatCard label="À contacter" value={stats.to_contact} color="border-blue-500" link="/venues?status=to_contact" />
          <StatCard label="En discussion" value={stats.discussion} color="border-orange-500" link="/venues?status=discussion" />
          <StatCard label="Bookings" value={stats.booked} color="border-green-500" link="/venues?status=booked" />
          <StatCard label="Contactés" value={stats.contacted} color="border-yellow-500" link="/venues?status=contacted" />
          <StatCard label="Pas de réponse" value={stats.no_response} color="border-gray-400" link="/venues?status=no_response" />
          <StatCard label="Pas intéressés" value={stats.not_interested} color="border-red-500" link="/venues?status=not_interested" />
          <StatCard label="Relances en retard" value={stats.followup_due} color="border-purple-500" link="/venues?followup=true" />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold mb-3 text-gray-200">Actions rapides</h3>
          <div className="space-y-2">
            <Link to="/venues" className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
              <span>📋</span>
              <span className="text-sm">Voir tous les lieux</span>
            </Link>
            <Link to="/pipeline" className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
              <span>🎯</span>
              <span className="text-sm">Gérer le pipeline</span>
            </Link>
            <button
              onClick={() => setShowScraper(true)}
              className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors w-full text-left"
            >
              <span>🔍</span>
              <span className="text-sm">Lancer un scraping</span>
            </button>
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold mb-3 text-gray-200">Taux de conversion</h3>
          {stats && stats.total > 0 ? (
            <div className="space-y-3">
              {[
                { label: 'Contactés', value: stats.contacted + stats.discussion + stats.booked, total: stats.total, color: 'bg-yellow-500' },
                { label: 'En discussion', value: stats.discussion + stats.booked, total: stats.total, color: 'bg-orange-500' },
                { label: 'Bookings', value: stats.booked, total: stats.total, color: 'bg-green-500' },
              ].map(({ label, value, total, color }) => (
                <div key={label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">{label}</span>
                    <span>{Math.round((value / total) * 100)}%</span>
                  </div>
                  <div className="bg-gray-800 rounded-full h-2">
                    <div
                      className={`${color} h-2 rounded-full transition-all`}
                      style={{ width: `${(value / total) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Aucune donnée</p>
          )}
        </div>
      </div>

      {showScraper && <ScraperModal onClose={() => setShowScraper(false)} />}
    </div>
  );
};

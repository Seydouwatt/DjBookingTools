import React, { useState } from 'react';

export const Settings: React.FC = () => {
  const [djName, setDjName] = useState(localStorage.getItem('djName') || '');
  const [mixLink, setMixLink] = useState(localStorage.getItem('mixLink') || '');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    localStorage.setItem('djName', djName);
    localStorage.setItem('mixLink', mixLink);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Paramètres</h1>

      <div className="card space-y-6">
        <div>
          <h3 className="font-semibold mb-4">Profil DJ</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Nom DJ</label>
              <input
                className="input w-full"
                value={djName}
                onChange={(e) => setDjName(e.target.value)}
                placeholder="ex: DJ SeydouK7"
              />
              <p className="text-xs text-gray-500 mt-1">Utilisé dans les messages générés</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Lien mix</label>
              <input
                className="input w-full"
                value={mixLink}
                onChange={(e) => setMixLink(e.target.value)}
                placeholder="https://soundcloud.com/..."
              />
              <p className="text-xs text-gray-500 mt-1">Inséré automatiquement dans les messages</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-4">Configuration Supabase</h3>
          <div className="bg-gray-800 rounded-lg p-4 text-sm text-gray-400 space-y-1">
            <p>VITE_SUPABASE_URL: <span className={import.meta.env.VITE_SUPABASE_URL ? 'text-green-400' : 'text-red-400'}>{import.meta.env.VITE_SUPABASE_URL ? '✓ Configuré' : '✗ Manquant'}</span></p>
            <p>VITE_SUPABASE_ANON_KEY: <span className={import.meta.env.VITE_SUPABASE_ANON_KEY ? 'text-green-400' : 'text-red-400'}>{import.meta.env.VITE_SUPABASE_ANON_KEY ? '✓ Configuré' : '✗ Manquant'}</span></p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className={`btn-primary ${saved ? 'bg-green-600' : ''}`}
        >
          {saved ? '✓ Sauvegardé !' : 'Sauvegarder'}
        </button>
      </div>
    </div>
  );
};

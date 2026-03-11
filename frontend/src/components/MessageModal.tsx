import React, { useState, useEffect } from 'react';
import { Venue } from '../types/venue';
import { messagesApi } from '../lib/api';

interface Props {
  venue: Venue;
  onClose: () => void;
}

export const MessageModal: React.FC<Props> = ({ venue, onClose }) => {
  const [message, setMessage] = useState('');
  const [djName, setDjName] = useState(localStorage.getItem('djName') || '');
  const [mixLink, setMixLink] = useState(localStorage.getItem('mixLink') || '');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    generateMsg();
  }, []);

  const generateMsg = async () => {
    setLoading(true);
    try {
      const { message: msg } = await messagesApi.generate(venue, djName, mixLink);
      setMessage(msg);
    } catch {}
    setLoading(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openInstagram = () => {
    if (venue.instagram) {
      copyToClipboard();
      window.open(venue.instagram, '_blank');
    }
  };

  const openEmail = () => {
    if (venue.email) {
      const subject = encodeURIComponent(`Proposition DJ — ${venue.name}`);
      const body = encodeURIComponent(message);
      window.open(`mailto:${venue.email}?subject=${subject}&body=${body}`, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Message pour {venue.name}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">✕</button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Ton nom DJ</label>
            <input
              className="input w-full text-sm"
              value={djName}
              onChange={(e) => {
                setDjName(e.target.value);
                localStorage.setItem('djName', e.target.value);
              }}
              placeholder="ex: DJ SeydouK7"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Lien mix</label>
            <input
              className="input w-full text-sm"
              value={mixLink}
              onChange={(e) => {
                setMixLink(e.target.value);
                localStorage.setItem('mixLink', e.target.value);
              }}
              placeholder="https://soundcloud.com/..."
            />
          </div>
        </div>

        <button onClick={generateMsg} className="btn-secondary text-sm mb-4">
          Regénérer
        </button>

        {loading ? (
          <div className="text-center py-8 text-gray-400">Génération...</div>
        ) : (
          <textarea
            className="input w-full h-64 resize-none text-sm"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        )}

        <div className="flex gap-3 mt-4">
          <button
            onClick={copyToClipboard}
            className={`btn-primary flex-1 ${copied ? 'bg-green-600' : ''}`}
          >
            {copied ? '✓ Copié !' : 'Copier le message'}
          </button>
          {venue.instagram && (
            <button onClick={openInstagram} className="btn-secondary flex-1">
              📷 Ouvrir Instagram (+ copier)
            </button>
          )}
          {venue.email && (
            <button onClick={openEmail} className="btn-secondary flex-1">
              ✉️ Envoyer par email
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

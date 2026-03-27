import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { venuesApi } from "../lib/api";
import { Venue, VenueStatus } from "../types/venue";
import { StatusBadge } from "../components/StatusBadge";
import { MessageModal } from "../components/MessageModal";

const STATUS_OPTIONS: VenueStatus[] = [
  "to_contact",
  "contacted",
  "discussion",
  "booked",
  "no_response",
  "not_interested",
];

export const VenueDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<Venue>>({});
  const [showMessage, setShowMessage] = useState(false);
  const [saved, setSaved] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    if (id) loadVenue(id);
  }, [id]);

  const loadVenue = async (venueId: string) => {
    setLoading(true);
    try {
      const data = await venuesApi.getOne(venueId);
      setVenue(data);
      setForm(data);
    } catch {}
    setLoading(false);
  };

  const handleSave = async () => {
    if (!id) return;
    try {
      const updated = await venuesApi.update(id, form);
      setVenue(updated);
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
  };

  const handleDelete = async () => {
    if (!id || !confirm("Supprimer ce lieu définitivement ?")) return;
    await venuesApi.delete(id);
    navigate("/venues");
  };

  const handleReenrich = async () => {
    if (!id) return;
    setActionLoading("reenrich");
    try {
      const res = await fetch(`/api/venues/${id}/reenrich`, { method: "POST" });
      await loadVenue(id);

      if (res.ok) {
        setActionMessage("✅ Ré-enrichissement terminé");
      } else {
        setActionMessage(
          "⚠️ Ré-enrichissement terminé mais aucune donnée nouvelle",
        );
      }
    } catch (err) {
      console.error("Erreur reenrich:", err);
      setActionMessage("❌ Erreur pendant le ré-enrichissement");
    }
    setActionLoading(null);
  };

  const handleFindInstagram = async () => {
    if (!id) return;
    setActionLoading("instagram");
    try {
      const res = await fetch(`/api/venues/${id}/find-instagram`, {
        method: "POST",
      });
      await loadVenue(id);

      if (res.ok) {
        setActionMessage("🔎 Recherche Instagram terminée");
      } else {
        setActionMessage("⚠️ Aucun Instagram trouvé");
      }
    } catch (err) {
      console.error("Erreur recherche Instagram:", err);
      setActionMessage("❌ Erreur pendant la recherche Instagram");
    }
    setActionLoading(null);
  };

  const handleFindEmail = async () => {
    if (!id) return;
    setActionLoading("email");
    try {
      const res = await fetch(`/api/venues/${id}/find-email`, {
        method: "POST",
      });
      await loadVenue(id);

      if (res.ok) {
        setActionMessage("📧 Recherche email terminée");
      } else {
        setActionMessage("⚠️ Aucun email trouvé");
      }
    } catch (err) {
      console.error("Erreur recherche email:", err);
      setActionMessage("❌ Erreur pendant la recherche email");
    }
    setActionLoading(null);
  };

  if (loading)
    return <div className="text-center py-12 text-gray-400">Chargement...</div>;
  if (!venue)
    return (
      <div className="text-center py-12 text-gray-400">Lieu non trouvé</div>
    );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="text-gray-400 hover:text-white text-sm mb-2"
          >
            ← Retour
          </button>
          <h1 className="text-2xl font-bold">{venue.name}</h1>
          {venue.city && <p className="text-gray-400 mt-1">{venue.city}</p>}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowMessage(true)}
            className="btn-primary flex items-center gap-2"
          >
            💬 Générer message
          </button>
          <button
            onClick={() => setEditing(!editing)}
            className="btn-secondary"
          >
            {editing ? "Annuler" : "Modifier"}
          </button>

          <button
            onClick={handleReenrich}
            className="btn-secondary flex items-center gap-2"
            title="Relancer l'enrichissement"
          >
            🔄 Re-enrichir
          </button>

          <button
            onClick={handleDelete}
            className="bg-red-900 hover:bg-red-800 text-red-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            🗑 Supprimer
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="md:col-span-2 space-y-4">
          <div className="card">
            <h3 className="font-semibold mb-4">Informations</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Adresse", key: "address" },
                { label: "Ville", key: "city" },
                { label: "Code postal", key: "postal_code" },
                { label: "Téléphone", key: "phone" },
                { label: "Email", key: "email" },
                { label: "Site web", key: "website" },
                { label: "Instagram", key: "instagram" },
                { label: "Facebook", key: "facebook" },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label className="block text-xs text-gray-400 mb-1">
                    {label}
                  </label>
                  {editing ? (
                    <input
                      className="input w-full text-sm"
                      value={(form as any)[key] || ""}
                      onChange={(e) =>
                        setForm({ ...form, [key]: e.target.value })
                      }
                    />
                  ) : (
                    <p className="text-sm">
                      {key === "email" && venue.email ? (
                        <a
                          href={`mailto:${venue.email}`}
                          className="text-blue-400 hover:underline"
                        >
                          {venue.email}
                        </a>
                      ) : key === "instagram" && venue.instagram ? (
                        <a
                          href={venue.instagram}
                          target="_blank"
                          rel="noreferrer"
                          className="text-pink-400 hover:underline"
                        >
                          {venue.instagram}
                        </a>
                      ) : key === "website" && venue.website ? (
                        <a
                          href={venue.website}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary-400 hover:underline"
                        >
                          {venue.website}
                        </a>
                      ) : key === "facebook" && venue.facebook ? (
                        <a
                          href={venue.facebook}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-300 hover:underline"
                        >
                          Facebook
                        </a>
                      ) : (
                        <span
                          className={
                            (venue as any)[key]
                              ? "text-gray-200"
                              : "text-gray-600"
                          }
                        >
                          {(venue as any)[key] || "—"}
                        </span>
                      )}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="card">
            <h3 className="font-semibold mb-3">Notes</h3>
            {editing ? (
              <textarea
                className="input w-full h-32 resize-none text-sm"
                value={form.notes || ""}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Ajouter des notes..."
              />
            ) : (
              <p className="text-sm text-gray-300 whitespace-pre-wrap">
                {venue.notes || (
                  <span className="text-gray-600">Aucune note</span>
                )}
              </p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="card">
            <h3 className="font-semibold mb-3">Statut CRM</h3>
            {editing ? (
              <select
                className="input w-full"
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value as VenueStatus })
                }
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            ) : (
              <StatusBadge status={venue.status} />
            )}
          </div>

          <div className="card">
            <h3 className="font-semibold mb-3">Suivi</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Dernier contact
                </label>
                {editing ? (
                  <input
                    type="date"
                    className="input w-full text-sm"
                    value={form.last_contact_date || ""}
                    onChange={(e) =>
                      setForm({ ...form, last_contact_date: e.target.value })
                    }
                  />
                ) : (
                  <p className="text-sm">
                    {venue.last_contact_date ? (
                      new Date(venue.last_contact_date).toLocaleDateString(
                        "fr-FR",
                      )
                    ) : (
                      <span className="text-gray-600">—</span>
                    )}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Prochaine relance
                </label>
                {editing ? (
                  <input
                    type="date"
                    className="input w-full text-sm"
                    value={form.next_followup_date || ""}
                    onChange={(e) =>
                      setForm({ ...form, next_followup_date: e.target.value })
                    }
                  />
                ) : (
                  <p className="text-sm">
                    {venue.next_followup_date ? (
                      new Date(venue.next_followup_date).toLocaleDateString(
                        "fr-FR",
                      )
                    ) : (
                      <span className="text-gray-600">—</span>
                    )}
                  </p>
                )}
              </div>
            </div>
          </div>

          {(venue.rating || venue.google_maps_url) && (
            <div className="card">
              <h3 className="font-semibold mb-3">Google Maps</h3>
              {venue.rating && (
                <p className="text-sm text-yellow-400 mb-2">
                  ★ {venue.rating} ({venue.reviews_count} avis)
                </p>
              )}
              {venue.google_maps_url && (
                <a
                  href={venue.google_maps_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-primary-400 hover:underline"
                >
                  Voir sur Google Maps →
                </a>
              )}
            </div>
          )}

          {/* Contact buttons */}
          <div className="card space-y-2">
            <h3 className="font-semibold mb-3">Actions de contact</h3>
            <button
              onClick={() => setShowMessage(true)}
              className="btn-primary w-full text-sm"
            >
              💬 Générer message
            </button>
            <button
              onClick={handleFindInstagram}
              disabled={actionLoading !== null}
              className="btn-secondary w-full text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {actionLoading === "instagram"
                ? "⏳ Recherche..."
                : "🔎 Chercher Instagram"}
            </button>
            <button
              onClick={handleFindEmail}
              disabled={actionLoading !== null}
              className="btn-secondary w-full text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {actionLoading === "email"
                ? "⏳ Recherche..."
                : "📧 Chercher email"}
            </button>
            {venue.instagram && (
              <a
                href={venue.instagram}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary w-full text-sm block text-center"
              >
                📷 Ouvrir Instagram
              </a>
            )}
            {venue.email && (
              <a
                href={`mailto:${venue.email}`}
                className="btn-secondary w-full text-sm block text-center"
              >
                ✉ Envoyer un email
              </a>
            )}
          </div>
        </div>
      </div>

      {editing && (
        <div className="mt-6 flex gap-3">
          <button onClick={handleSave} className="btn-primary">
            {saved ? "✓ Sauvegardé !" : "Sauvegarder"}
          </button>
          <button onClick={() => setEditing(false)} className="btn-secondary">
            Annuler
          </button>
        </div>
      )}

      {actionMessage && (
        <div className="fixed bottom-6 right-6 bg-gray-900 border border-gray-700 text-sm px-4 py-2 rounded-lg shadow-lg">
          {actionMessage}
        </div>
      )}
      {showMessage && (
        <MessageModal venue={venue} onClose={() => setShowMessage(false)} />
      )}
    </div>
  );
};

# DJ Booking Tools

CRM + Scraper Google Maps + Enrichissement de contacts pour la gestion des bookings DJ.

## Fonctionnalités

- **Scraper Google Maps** : Recherche automatique de venues (guinguettes, bars, péniches...) autour de Nantes
- **Enrichissement** : Extraction automatique d'emails, Instagram et Facebook depuis les sites web
- **CRM complet** : Gestion du pipeline de booking avec statuts personnalisés
- **Import CSV** : Import de venues depuis un fichier CSV
- **Dashboard** : Vue d'ensemble avec statistiques et relances en retard

## Prérequis

- Node.js 18+
- npm 9+

## Installation

### 1. Cloner le projet

```bash
git clone <url-du-repo>
cd DjBookingTools
```

### 2. Installer toutes les dépendances

```bash
# Depuis la racine du projet
npm install

# Backend
cd backend && npm install && cd ..

# Frontend
cd frontend && npm install && cd ..
```

Ou en une seule commande :

```bash
npm run install:all
```

### 3. Configuration (optionnel)

Créer un fichier `.env` dans le dossier `backend/` :

```env
PORT=3001
FRONTEND_URL=http://localhost:5173
```

### 4. Lancer en développement

```bash
# Depuis la racine — lance backend + frontend en parallèle
npm run dev
```

- **Backend** : http://localhost:3001
- **Frontend** : http://localhost:5173

## Utilisation du scraper

### Lancer le scraper Google Maps

```bash
npm run scrape
```

Le script va :
1. Rechercher automatiquement sur 7 requêtes prédéfinies (guinguettes, bars, péniches à Nantes et Loire-Atlantique)
2. Extraire pour chaque venue : nom, adresse, téléphone, site web, note Google
3. Visiter chaque site web pour extraire : email, Instagram, Facebook
4. Sauvegarder dans la base SQLite (sans doublons)

> **Note** : Le scraper utilise Puppeteer (Chromium headless). La première exécution peut télécharger Chromium automatiquement.

### Personnaliser les requêtes

Modifier le tableau `SEARCH_QUERIES` dans `scripts/scrape.js` :

```javascript
const SEARCH_QUERIES = [
  { query: 'guinguette', city: 'Nantes' },
  { query: 'bar terrasse', city: 'Bordeaux' },
  // ...
];
```

## Import CSV

Format attendu (colonnes acceptées) :

| Colonne | Alias acceptés | Description |
|---------|---------------|-------------|
| `name` | `nom`, `venue_name` | Nom du venue (obligatoire) |
| `address` | `adresse` | Adresse complète |
| `city` | `ville` | Ville |
| `postal_code` | `code_postal` | Code postal |
| `phone` | `telephone` | Téléphone |
| `email` | — | Email de contact |
| `website` | `site_web` | URL du site web |
| `instagram` | — | URL Instagram |
| `facebook` | — | URL Facebook |
| `google_maps_url` | `maps_url` | URL Google Maps |
| `rating` | — | Note (0-5) |
| `reviews_count` | — | Nombre d'avis |
| `status` | — | Statut CRM |
| `notes` | — | Notes libres |

## Statuts CRM

| Statut | Couleur | Description |
|--------|---------|-------------|
| `to_contact` | Bleu | À contacter |
| `contacted` | Jaune | Contacté, en attente |
| `discussion` | Orange | En cours de négociation |
| `booked` | Vert | Booking confirmé |
| `no_response` | Gris | Pas de réponse |
| `not_interested` | Rouge | Pas intéressé |

## Structure du projet

```
DjBookingTools/
├── backend/
│   ├── controllers/
│   │   └── venuesController.js   # Logique CRUD + import CSV
│   ├── routes/
│   │   └── venues.js             # Routes Express
│   ├── scrapers/
│   │   └── googleMapsScraper.js  # Scraper Puppeteer
│   ├── services/
│   │   └── enrichmentService.js  # Enrichissement Cheerio
│   ├── db.js                     # Connexion SQLite
│   └── server.js                 # Serveur Express
├── database/
│   └── schema.sql                # Schéma SQLite
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── Navbar.jsx
│       │   └── StatusBadge.jsx
│       ├── pages/
│       │   ├── Dashboard.jsx
│       │   ├── VenueList.jsx
│       │   └── VenueDetail.jsx
│       └── services/
│           └── api.js
└── scripts/
    └── scrape.js                 # Script principal de scraping
```

## API Backend

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/venues` | Liste avec filtres (status, city, search, followup) |
| GET | `/api/venues/:id` | Détail d'un venue |
| POST | `/api/venues` | Créer un venue |
| PUT | `/api/venues/:id` | Modifier un venue |
| DELETE | `/api/venues/:id` | Supprimer un venue |
| POST | `/api/venues/import-csv` | Import CSV (multipart) |
| GET | `/api/health` | Health check |

### Paramètres de filtrage (GET /api/venues)

- `status` : Filtrer par statut
- `city` : Filtrer par ville (recherche partielle)
- `search` : Recherche dans nom, adresse, ville, email
- `followup=true` : Uniquement les relances en retard
- `sortBy` : Colonne de tri (name, city, status, last_contact_date, next_followup_date, rating)
- `sortOrder` : ASC ou DESC
- `page` : Page (défaut: 1)
- `limit` : Résultats par page (défaut: 100)

## Build production

```bash
# Build le frontend
npm run build:frontend

# Lancer le backend (servira aussi le frontend buildé)
npm run start:backend
```

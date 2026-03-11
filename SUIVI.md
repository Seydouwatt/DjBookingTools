# Suivi projet — DjBookingTools

## État général : En cours de développement

---

## Stack technique

| Couche | Technologie |
|--------|------------|
| Frontend | React 18 + TypeScript + Vite |
| UI | TailwindCSS |
| State | Zustand |
| Table | TanStack Table v8 |
| Backend | NestJS + TypeScript |
| Base de données | Supabase (PostgreSQL) |
| Scraping | Puppeteer + Cheerio |
| Auth | Supabase Auth (à connecter) |

---

## Checklist de démarrage

### 1. Supabase
- [ ] Créer un projet sur [supabase.com](https://supabase.com)
- [ ] Exécuter le fichier `supabase/migrations/001_initial.sql` dans l'éditeur SQL
- [ ] Récupérer `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

### 2. Backend
- [ ] Copier `backend/.env.example` → `backend/.env`
- [ ] Remplir les variables Supabase dans `.env`
- [ ] `cd backend && npm install`
- [ ] `npm run start:dev`

### 3. Frontend
- [ ] Copier `frontend/.env.example` → `frontend/.env`
- [ ] Remplir `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`
- [ ] `cd frontend && npm install`
- [ ] `npm run dev`

### 4. Lancement global (depuis la racine)
```bash
npm run install:all
npm run dev
```

---

## Modules implémentés

| Module | Statut | Notes |
|--------|--------|-------|
| Venues CRUD | ✅ Fait | GET/POST/PUT/DELETE + stats |
| Scraper Google Maps | ✅ Fait | Puppeteer, max 100, delays random |
| Enrichissement contacts | ✅ Fait | Cheerio, email/instagram/facebook |
| Génération messages | ✅ Fait | Adaptatif par catégorie |
| Pipeline Kanban | ✅ Fait | Drag & drop natif HTML5 |
| Dashboard | ✅ Fait | Stats + funnel de conversion |
| Table lieux | ✅ Fait | TanStack Table, tri, filtres |
| Fiche venue | ✅ Fait | Edition inline, notes, dates |
| Auth Supabase | ⏳ À faire | Login email + Google |

---

## Pages frontend

| Page | Route | Statut |
|------|-------|--------|
| Dashboard | `/` | ✅ |
| Liste lieux | `/venues` | ✅ |
| Fiche lieu | `/venues/:id` | ✅ |
| Pipeline Kanban | `/pipeline` | ✅ |
| Paramètres | `/settings` | ✅ |

---

## API endpoints

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/venues` | Liste avec filtres |
| GET | `/api/venues/stats` | Statistiques dashboard |
| GET | `/api/venues/:id` | Détail |
| POST | `/api/venues` | Créer |
| PUT | `/api/venues/:id` | Modifier |
| DELETE | `/api/venues/:id` | Supprimer |
| POST | `/api/scraper/start` | Lancer un scraping |
| GET | `/api/scraper/status` | État du scraping |
| GET | `/api/pipeline` | Colonnes Kanban |
| PUT | `/api/pipeline/:id/move` | Déplacer un lieu |
| POST | `/api/messages/generate` | Générer un message |

---

## Statuts CRM

| Statut | Couleur | Description |
|--------|---------|-------------|
| `to_contact` | Bleu | À contacter |
| `contacted` | Jaune | Contacté |
| `discussion` | Orange | En discussion |
| `booked` | Vert | Booking confirmé |
| `no_response` | Gris | Pas de réponse |
| `not_interested` | Rouge | Pas intéressé |

---

## Backlog / Améliorations futures

- [ ] Authentification Supabase (login email + Google OAuth)
- [ ] Import CSV de lieux
- [ ] Export CSV / Excel
- [ ] Notifications relances (email ou browser)
- [ ] Historique des contacts par lieu
- [ ] Recherche multi-ville dans le scraper
- [ ] Mode sombre / clair
- [ ] PWA (Progressive Web App)
- [ ] Déploiement Render (backend) + Vercel (frontend)

---

## Déploiement (quand prêt)

### Backend → Render
1. Créer un Web Service sur Render
2. Build command : `cd backend && npm install && npm run build`
3. Start command : `cd backend && npm run start:prod`
4. Ajouter les variables d'env Supabase dans Render

### Frontend → Vercel ou Render
1. Build command : `cd frontend && npm install && npm run build`
2. Output dir : `frontend/dist`
3. Ajouter `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`

---

## Journal des modifications

| Date | Action |
|------|--------|
| 2026-03-11 | Initialisation complète du projet — stack NestJS + React + Supabase |

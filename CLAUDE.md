# Wellness App — CLAUDE.md

This file is the source of truth for this project. Read it before making any changes.

---

## What This App Is

A wellness business directory — the "Yelp for wellness." Users can discover nearby wellness centers by searching for specific modalities, devices, and compounds. For example, someone can search "Pulse PEMF XL Pro" or "BPC-157" and find every business near them that offers it.

This is a pure discovery tool. No educational content, no medical advice. Just a directory that connects people to businesses.

---

## The Problem It Solves

There is no searchable directory for the biohacking and advanced wellness space. People who want to find a clinic that offers NAD+, peptide therapy, PEMF, red light therapy, or specific devices have no centralized place to search. This app fills that gap.

---

## Target Users

1. **Wellness seekers** — people looking for specific therapies, devices, or compounds near them
2. **Wellness businesses** — clinics, studios, and centers that want to be discovered

---

## V1 Features (Build These First)

- [ ] Search directory by modality (e.g. cryotherapy, red light therapy)
- [ ] Search by specific device (e.g. Pulse PEMF XL Pro, Joovv Solo 3.0)
- [ ] Search by compound or peptide (e.g. NAD+, BPC-157, sermorelin)
- [ ] Map view showing nearby businesses as pins
- [ ] Business profile page with full details
- [ ] Business submission form (3 steps)
- [ ] Admin panel to approve or reject submissions (password protected)

---

## Features For Later (Do NOT Build Yet)

- User accounts and saved favorites
- Reviews and ratings
- Paid featured listings
- Mobile app (iOS/Android)
- Email notifications
- Advanced filtering (price, hours, etc.)

---

## Tech Stack

- **Frontend:** React (with Vite)
- **Styling:** CSS with variables — no Tailwind yet
- **Database:** Supabase (PostgreSQL)
- **Maps:** Mapbox GL
- **Hosting:** Vercel
- **Auth:** Supabase Auth (admin only for now)

---

## Database Structure

### businesses
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | primary key |
| name | text | business name |
| description | text | short description |
| address | text | street address |
| city | text | |
| state | text | |
| zip | text | |
| phone | text | |
| website | text | |
| latitude | float | for map pins |
| longitude | float | for map pins |
| status | text | 'pending' or 'approved' or 'rejected' |
| created_at | timestamp | auto |

### modalities
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | primary key |
| name | text | e.g. "Red Light Therapy" |
| category | text | 'modality', 'device', or 'compound' |

### business_modalities
| Column | Type | Notes |
|--------|------|-------|
| business_id | uuid | foreign key → businesses |
| modality_id | uuid | foreign key → modalities |

---

## Search Logic

Search must query across ALL of the following simultaneously:
- Business name
- Business city and state
- All associated modalities
- All associated devices
- All associated compounds

A single search term like "BPC-157" should return every business that offers it, regardless of city.

---

## Design Direction

- Clean, modern, professional
- Friendly and approachable — not clinical or intimidating
- Mobile-first — must look great on phones
- No dark mode for now — light background
- No gradients — flat, clean colors
- Nunito or similar rounded sans-serif font
- Colors TBD — still being decided

---

## Design Rules (Always Follow These)

- Mobile-first — design for phone screen first, then desktop
- No gradients anywhere
- No educational content or medical claims
- Keep it simple — this is a directory, not a health platform
- Every page must have a "List Your Business" CTA
- Admin panel is password protected (password set in environment variables)

---

## File Structure

```
wellness-app/
├── src/
│   ├── components/
│   │   ├── Nav.jsx
│   │   ├── BusinessCard.jsx
│   │   ├── BusinessModal.jsx
│   │   ├── SearchBar.jsx
│   │   ├── MapView.jsx
│   │   └── FilterPills.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Submit.jsx
│   │   └── Admin.jsx
│   ├── lib/
│   │   └── supabase.js
│   ├── App.jsx
│   └── main.jsx
├── CLAUDE.md
├── .env.local
└── package.json
```

---

## Environment Variables

Never commit these to GitHub. Store in `.env.local`:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_MAPBOX_TOKEN=your_mapbox_token
VITE_ADMIN_PASSWORD=your_admin_password
```

---

## Current Status

- [x] App concept defined
- [x] CLAUDE.md written
- [x] Vite + React project created
- [x] Folder structure set up (components/, pages/, lib/)
- [x] Home page built — search, filter pills, business cards, map placeholder
- [x] 5 seed businesses hardcoded in lib/seedData.js
- [x] Ocean blue + white color scheme, Nunito font
- [x] Business profile modal — full details, address, phone, website, tagged offerings
- [x] 3-step submission form at /submit — saves to localStorage pending Supabase
- [x] Password-protected admin panel at /admin — pending queue, approve/reject, live listings manager
- [ ] Supabase project created
- [ ] Database tables created
- [ ] App connected to Supabase
- [ ] Mapbox map view added
- [ ] Deployed to Vercel

---

## Important Rules For Claude Code

1. Always read this file before making changes
2. Never add features from the "Later" list without being asked
3. Always keep the app as a pure directory — no medical advice
4. Never hardcode API keys — always use environment variables
5. Always test on mobile screen size first
6. Keep components small and focused — one job per component
7. When in doubt, keep it simple
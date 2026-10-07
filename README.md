# EvoChip

Site Next.js 16 / React 19 pentru prezentarea serviciilor, proiectelor și prețurilor EvoChip, cu administrare și fișiere în Supabase.

## Pornire

Instalează dependențele cu `npm ci`. Configurează în `.env.local`:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

Rulează `npm run dev` și deschide `http://localhost:3000`. Adminul este la `/admin` și folosește autentificare Supabase.

## Verificări

- `npm run typecheck` — tipuri și declarații nefolosite.
- `npm run lint` — reguli ESLint.
- `npm test` — validare, normalizarea proiectelor, linkuri, paginare și curățarea fișierelor. Necesită Node.js cu suport nativ pentru importuri TypeScript (Node 22.18+).
- `npm run build`, apoi `npm start` — build de producție și pornire. Buildul descarcă Montserrat din Google Fonts și necesită acces la rețea.

## Date

Tabele: `projects`, `car_models`, `car_brands`, `stage`, `prices`, `contact`. Fișiere: bucketul `car-files`, directoarele `car-photos` și `car-dyno`. Conținutul editorial este în `app/data/continut.json`.

Ștergerea unui obiect direct din Storage nu elimină URL-ul salvat în proiect. Pentru eliminare completă folosește formularul admin și salvează modificarea.

Politicile RLS și Storage sunt administrate în Supabase; schema și politicile nu sunt versionate în acest repository. Auditul și limitele verificate sunt documentate în [DATA-FLOW-AUDIT.md](DATA-FLOW-AUDIT.md).

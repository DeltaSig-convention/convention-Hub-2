# Convention Hub — Deploy Guide (Netlify + Supabase)

This is the full Convention Hub — Schedule, Staff Plan, Budget (including
Expense Tracker), Directory, Hotel Map, FAQ — ready to host on your own web
address. No Terminal required.

If you've deployed an earlier version of this Hub before, **this is a new
deploy of an updated app** — treat it as a fresh project, not an update to
the old one, since a lot has changed under the hood.

Three free services do the work:
- **Supabase** — your database + file storage + the shared team login
- **GitHub** — holds the code online so Netlify can read it
- **Netlify** — builds the site and gives you a live URL

Plan on **45–60 minutes**.

---

## PART A — Supabase (database + storage + shared password) ~20 min

1. **supabase.com** → sign in → **New project** → name it `convention-hub`
   (or reuse an existing one if you already made one for this) → set a
   database password (save it, you won't need it day-to-day) → pick the
   closest region → **Create**. Wait ~2 minutes.
2. **SQL Editor** → **New query**. Open `supabase/schema.sql` from this
   project, copy all of it, paste it in, **Run**. You should see "Success".
   - If you're reusing a Supabase project from a previous version of this
     Hub, running this again is safe — it only creates things that don't
     already exist.
3. Create the shared team login (skip if you already have one from before):
   - **Authentication** → **Users** → **Add user** → **Create new user**.
   - Email: `hub@deltasig.org` (any address works — it's just the login ID).
   - Password: **this is your team password**. Turn **Auto Confirm User** ON.
   - **Create user**.
4. Grab two values for Part C:
   - **Project Settings** (gear) → **API**.
   - Copy the **Project URL** (e.g. `https://abcd1234.supabase.co`).
   - Copy the **anon public** key.

---

## PART B — GitHub (put the code online) ~15 min

1. **github.com** → **New repository** → name it `convention-hub-v2` (use a
   new name if you have an old `convention-hub` repo, to avoid mixing them
   up) → keep it **Private** → leave every "initialize with..." box
   unchecked → **Create repository**.
2. The most reliable way to upload without losing files or folder structure:
   use **GitHub Desktop** (free app) — clone the new empty repo, then copy
   everything from this project's unzipped folder directly into the cloned
   folder on your computer, then Commit + Push in GitHub Desktop.
   - If you'd rather use the website's upload box: upload the loose files
     (`index.html`, `package.json`, `netlify.toml`, `vite.config.js`,
     `.gitignore`, `.env.example`, `README.md`) first, then create `src/`
     and `public/` one file at a time using **Add file → Create new file**
     with the full path typed in (e.g. `src/App.jsx`), pasting in each
     file's contents. **Always double check the filename keeps its
     extension** (`.jsx` / `.js`) — this is the single most common mistake.
3. After uploading, **click into `src` on GitHub's website** and confirm you
   see `App.jsx`, `main.jsx`, `supabase.js` with correct names. Click into
   `public` and confirm `floorplan-seed.png` is there.

---

## PART C — Netlify (host it + connect everything) ~15 min

1. **netlify.com** → **Add new site** → **Import an existing project** →
   **Deploy with GitHub** → pick `convention-hub-v2`.
2. Leave build settings as detected (`npm run build`, publish `dist`).
   **Before deploying**, go to **Site configuration → Environment
   variables** and add:

   | Key | Value |
   |-----|-------|
   | `VITE_SUPABASE_URL` | your Project URL from Part A |
   | `VITE_SUPABASE_ANON_KEY` | your anon public key from Part A |
   | `VITE_SHARED_EMAIL` | `hub@deltasig.org` (from Part A) |

3. **Deploy site**. Wait ~1–2 minutes for a live URL.
4. Open the URL → enter your team password → you're in.

> Added the environment variables *after* deploying? **Deploys → Trigger
> deploy → Deploy site** once to bake them in.

---

## If you already have the OLD version of this Hub live on Netlify

You have two reasonable options:

- **Replace it in place**: point your existing Netlify site at this new
  GitHub repo instead (Site configuration → Build & deploy → Link a
  different repository), keeping the same live URL. Your old Supabase data
  (schedule, budget, etc.) will still be there since the database didn't
  change — only the app code did.
- **Deploy fresh, then swap**: stand this up as a brand-new Netlify site
  first, confirm it works, then either redirect the old URL or just start
  using the new one and retire the old site.

Either way, **re-running `supabase/schema.sql` is safe** — it won't
duplicate or break your existing data.

---

## What's in this version

- Full Budget Hub rolled in as its own section with 5 sub-tabs: Budget,
  Expense Tracker, Income, Foundation, Activity.
- Schedule rebuilt with room/AV-company/AV-items as proper multi-select
  fields, plus the new **Staff Plan** tab for hour-by-hour assignments.
- Directory with corrected HQ staff (pulled live from deltasig.org/team)
  and a new Convention Volunteers section.
- Hotel Map pre-loaded with the JW Marriott floor plan; replacing it
  uploads to Supabase Storage, not the database, so it stays fast.

## Troubleshooting

- **Build failed:** check the deploy log — almost always a missing or
  misspelled environment variable. Fix the name, Trigger deploy again.
- **Password rejected:** confirm the user exists in Supabase →
  Authentication → Users, and `VITE_SHARED_EMAIL` matches it exactly.
- **Blank white page after a successful build:** open the browser console
  (right-click → Inspect → Console tab) and read the red error text — it
  will name the actual problem (usually a missing environment variable).

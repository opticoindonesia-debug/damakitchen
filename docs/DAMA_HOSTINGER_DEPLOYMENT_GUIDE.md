# DAMA KITCHEN — Hostinger Deployment Guide

Deploy the website plus its self-hosted CMS to DAMA's own Hostinger account, **staging first**. Switch the production domain only after the launch checklist passes.

> **Verify in hPanel.** Hostinger renames menus often. Labels below match Hostinger's documentation at the time of writing ("Websites → Add website → Node.js Apps", "Databases → MySQL Databases").
>
> **Not yet tested on Hostinger.** This guide could not be executed from the development sandbox. Acceptance criterion 19 is **NOT TESTED** until the staging run below is done.

---

## 0. What you need

| Item | Notes |
| --- | --- |
| Hostinger plan with **Node.js Web Apps** | Business Web Hosting or any Cloud plan (Startup/Professional/Enterprise). Not available on Single/Premium. |
| MySQL database on the same account | Included in those plans. |
| Access to the private GitHub repo | `opticoindonesia-debug/damakitchen` |
| The old Sanity export | Optional. Only to import edits made in the old Studio (section 7). |

Runtime facts this app relies on:

- Next.js 14 in **server mode**: SSR, API routes, dynamic routes, middleware. Hostinger builds Next.js apps in standalone mode; `next.config.mjs` already sets `output: 'standalone'`.
- **Node.js 20.x or 22.x.** `engines` requires ≥ 20.9.
- **No database at build time.** The database is used at runtime only. Migrations and the initial content import run automatically on the first request.
- **Media in MySQL by default** (`MEDIA_STORAGE=database`). Hostinger overwrites the app folders on every deploy, so uploaded files are not stored on disk.

## 1. Create the database

1. hPanel → **Databases → MySQL Databases** → create:
   - database name, e.g. `u123456789_dama`
   - user, e.g. `u123456789_dama`
   - a **strong password** (save it in a password manager)
2. Note the **host**. Usually `localhost` for apps on the same hosting account. hPanel shows the exact value.
3. Collation **utf8mb4_unicode_ci** (default on Hostinger). The migration also creates every table as utf8mb4.
4. Your `DATABASE_URL`:
   ```
   mysql://u123456789_dama:PASSWORD@localhost:3306/u123456789_dama
   ```
   URL-encode special characters in the password: `@` → `%40`, `#` → `%23`, `/` → `%2F`, `:` → `%3A`.

## 2. Generate secrets (on your computer)

```bash
node -e "console.log(require('crypto').randomBytes(24).toString('base64url'))"   # ADMIN_SETUP_TOKEN
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"   # BACKUP_CRON_TOKEN
```

Never commit these to GitHub. Never paste them in chat.

## 3. Create the Node.js app (staging)

1. hPanel → **Websites → Add website → Node.js Apps** → **Import Git repository**. Connect GitHub and choose `opticoindonesia-debug/damakitchen`.
2. **Branch:** `claude/elegant-hamilton-twBLg`. For production, create and use a dedicated branch such as `production`. See section 10 about `main` and Vercel.
3. **Domain:** use the temporary Hostinger domain or a subdomain such as `staging.damakitchen.id`.
4. **Framework preset:** Next.js. **Node version:** 22.x (or 20.x).
5. **Build settings** (if editable):

   | Setting | Value |
   | --- | --- |
   | Install | `pnpm install --frozen-lockfile` if pnpm is offered, otherwise `npm install` |
   | Build | `npm run build` (or `pnpm build`) |
   | Start | Keep Hostinger's default for Next.js. If a command is required: `npm run start` |
   | Output directory | `.next` |

   On package managers: the repo uses **pnpm** (`pnpm-lock.yaml`). If Hostinger only supports npm, it installs from `package.json` ranges. That works, but versions are not pinned by a lockfile. If you want pinned npm installs, run `npm install --package-lock-only` locally and commit `package-lock.json` (keep only one lockfile).
6. **Environment variables** (Settings → Environment variables). Set them **before the first build**.

   | Variable | Value |
   | --- | --- |
   | `DATABASE_URL` | from step 1 |
   | `NEXT_PUBLIC_SITE_URL` | `https://staging.damakitchen.id` (later the real domain). **Baked in at build time.** Redeploy after changing it. |
   | `ADMIN_SETUP_TOKEN` | from step 2. Remove after creating the owner account. |
   | `MEDIA_STORAGE` | `database` |
   | `DATABASE_POOL_SIZE` | `5` |
   | `BACKUP_DIR` | optional, see section 9, e.g. `/home/u123456789/dama-backups` |
   | `BACKUP_CRON_TOKEN` | optional, from step 2 |
   | `BACKUP_KEEP` | `14` |
   | `NODE_ENV` | `production` (Hostinger normally sets it) |

7. **Deploy.** Watch the build log. It should end with the route table and `postbuild: copied public/ and .next/static…`.

## 4. First start

1. Open the staging URL. The **first request** creates all tables and imports the initial content: 7 pages, products, sub-brands, settings. It can take a few seconds.
   - The runtime log shows `[dama] migrations applied: 0000_init`.
   - Then `[dama] initial content imported: …`.
2. Open `/admin`. You are redirected to `/admin/setup`. Enter `ADMIN_SETUP_TOKEN` plus the owner's name, email and password. Then log in.
3. Remove `ADMIN_SETUP_TOKEN` from the environment variables and restart or redeploy. The dashboard warning disappears.

## 5. Media check (important)

1. Admin → **Media** → upload a photo. Then open its URL (`/media/…webp`).
2. **Redeploy** the app: push a commit or press Redeploy. Open the same URL again. It must still load.
   - With `MEDIA_STORAGE=database` this is guaranteed, because files live in MySQL. Verified locally: identical bytes after a rebuild and restart.
3. MySQL `max_allowed_packet` must be larger than the biggest file (8 MB). Hostinger's default is normally 16 MB or more.
   - If uploads of large photos fail with a server error, reduce the photo size, or ask Hostinger support for the current limit.

## 6. Domain & HTTPS (production)

1. **Point the domain to Hostinger.**
   - If damakitchen.id is registered at Hostinger: hPanel → Domains → attach it to the Node.js app.
   - If it is registered elsewhere: set the nameservers (or A/AAAA records) shown in hPanel.
2. **HTTPS.** hPanel → **Security → SSL** → install the free SSL certificate, then enable **Force HTTPS**.
3. Set `NEXT_PUBLIC_SITE_URL=https://damakitchen.id` and **redeploy**. The value is baked in at build time, so a redeploy is required.
4. Check `https://damakitchen.id/sitemap.xml` and `/robots.txt` show the production domain.
5. Submit the sitemap in Google Search Console.

## 7. Import content from the old Sanity Studio (one time)

Do this on **staging** before launch, so the owner can review.

1. Export the old dataset. Someone with access to the old Sanity project runs:
   ```bash
   npx sanity@3 dataset export production sanity-export.tar.gz --project <PROJECT_ID>
   ```
   (The project ID is in the old Vercel env `NEXT_PUBLIC_SANITY_PROJECT_ID`.)
2. Allow your computer to reach the Hostinger database: hPanel → **Databases → Remote MySQL** → add your IP. Use the remote host shown there.
3. On your computer, in the repo:
   ```bash
   pnpm install
   DATABASE_URL="mysql://USER:PASS@REMOTE_HOST:3306/DB" pnpm import:sanity sanity-export.tar.gz          # dry run, report only
   DATABASE_URL="mysql://USER:PASS@REMOTE_HOST:3306/DB" pnpm import:sanity sanity-export.tar.gz --apply  # write
   ```
   The importer:
   - never deletes anything;
   - writes pages, articles and settings as **drafts** for review;
   - uploads the photos;
   - writes a report: `sanity-export-import-report.md`.
4. In the admin, review each page and article, then click **Terbitkan**.
5. Remove your IP from Remote MySQL afterwards.

## 8. Acceptance on staging

Run `DAMA_PRODUCTION_LAUNCH_CHECKLIST.md` end to end on staging. Switch the production domain only when every item passes.

## 9. Scheduled backups (recommended)

1. Set `BACKUP_DIR` to an **absolute path outside the app folder**, e.g. `/home/u123456789/dama-backups`, and set `BACKUP_CRON_TOKEN`. Redeploy.
2. hPanel → **Advanced → Cron Jobs** → custom command, daily (e.g. 02:00 UTC = 09:00 WIB):
   ```bash
   curl -fsS -X POST -H "x-backup-token: YOUR_BACKUP_CRON_TOKEN" https://damakitchen.id/api/backup/cron
   ```
3. The next day, check that a file `dama-backup-….json.gz` appeared (hPanel → File Manager).
4. **Off-site copy.** Server backups do not protect against losing the account. At least weekly, the owner downloads a backup from **Admin → Cadangan** and stores it in Google Drive or on a laptop.
5. Hostinger's own automatic backups (hPanel → Files → Backups) are an extra layer. They include the database, and therefore the media.

See `DAMA_DATABASE_AND_BACKUP_GUIDE.md` for the tested restore procedure.

## 10. Vercel and the `main` branch

The current live site on Vercel deploys automatically from `main`. Vercel has no MySQL, so **do not merge this work into `main` while the Vercel project is connected**: the Vercel build would succeed but every page would fail at runtime.

Cut-over order:

1. Staging on Hostinger passes the launch checklist.
2. Point the domain to Hostinger (section 6).
3. Disconnect or delete the Vercel project. Remove the domain there.
4. Merge into `main` (or keep deploying from a `production` branch). Hostinger redeploys on push.
5. Remove the old Sanity environment variables everywhere. Optionally delete the Sanity project after the import is confirmed, keeping the export file as an archive.

## 11. Deploying updates & rollback

- **Update.** Push to the deployed branch → Hostinger rebuilds → the first request applies any new migration automatically. Migrations are additive.
- **Before every update:** download a backup (Admin → Cadangan).
- **Rollback (code).** Redeploy the previous commit: hPanel deployment history "Redeploy" on an earlier deployment, or `git revert` and push. Because migrations only add structure, the previous code keeps working with the newer schema.
- **Rollback (content).** Admin → Cadangan → restore the backup made before the change, or use `pnpm restore` (database guide).

## 12. Troubleshooting

| Symptom | Likely cause / fix |
| --- | --- |
| All pages show a 500 error | `DATABASE_URL` wrong or the DB is unreachable. Check the runtime logs for `[dama] … failed`. Check user/password/host and the password URL-encoding. |
| Canonical / sitemap shows the wrong domain | `NEXT_PUBLIC_SITE_URL` was changed without a redeploy. |
| Upload fails "Gagal memproses file" | `sharp` binary missing. Check the build log for sharp install errors and use Node 20/22. If it persists on Managed hosting, use a VPS (below). |
| Can't log in, "Terlalu banyak percobaan" | Wait 15 minutes. If the password is forgotten, use `ADMIN_SETUP_TOKEN` + `/admin/setup`. |
| Logged out immediately on http | Production cookies are `Secure`. Use HTTPS. |
| Request timeout on backup download | The site has a very large media library. Use `pnpm backup` from your computer (Remote MySQL), phpMyAdmin export, or Hostinger backups. |

## Appendix — VPS alternative (if Managed Node.js is insufficient)

Use Hostinger **KVM VPS** (Ubuntu 24.04):

1. **Install the stack:** Node 22, MariaDB 10.11 (or MySQL 8), Nginx and Certbot.
2. **Get the code:** clone the repo, `pnpm install --frozen-lockfile && pnpm build`.
3. **Environment:** set the variables in a `.env` file outside the repo, with `MEDIA_STORAGE=filesystem` and `MEDIA_ROOT=/var/lib/dama-media` (persistent, owned by the app user).
4. **Run:**
   - `node .next/standalone/server.js` via systemd or PM2 (`PORT=3000`);
   - Nginx reverse proxy with `client_max_body_size 20m`;
   - `certbot --nginx` for HTTPS.
5. **Backups:** cron `pnpm backup /var/backups/dama/$(date +%F).json.gz`, plus off-site copies.

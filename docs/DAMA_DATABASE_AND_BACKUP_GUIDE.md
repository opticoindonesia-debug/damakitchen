# DAMA KITCHEN — Database & Backup Guide

## 1. Database

- **Engine:** MySQL 8 or MariaDB 10.6+ (Hostinger "MySQL Databases"). Charset `utf8mb4`.
- **Connection:** `DATABASE_URL=mysql://USER:PASSWORD@HOST:3306/DATABASE`, via a small mysql2 pool (`DATABASE_POOL_SIZE`, default 5).
- **Schema source of truth:** `lib/db/schema.ts` (Drizzle ORM). Overview: `DAMA_CMS_ARCHITECTURE.md` §4.
- **Compatibility:** JSON columns work on both engines. On MariaDB, JSON is LONGTEXT and the app parses it.

### Migrations

| Step | What happens |
| --- | --- |
| Generate (development) | Edit `lib/db/schema.ts`, then run `pnpm db:generate`. This writes `drizzle/NNNN_*.sql` and regenerates `lib/db/migrations.generated.ts`. Commit both. |
| Apply (automatic) | On the first request after a deploy, pending migrations run once, under a MySQL named lock. Applied IDs are stored in `_migrations`. |
| Apply (manual) | `DATABASE_URL=… pnpm db:setup` |
| Initial content | After migrating, empty tables are filled with the original site content (`lib/seed`). Tables that already contain data are never touched. |

**Safe-migration policy:**

1. Migrations only **add** (new tables, nullable columns or columns with defaults, indexes).
2. Renames or drops need a written procedure:
   1. backup;
   2. add the new structure;
   3. deploy code that writes both;
   4. migrate data;
   5. remove the old structure in a later release.
3. MySQL DDL is not transactional. If a migration fails halfway, restore the backup taken before the deploy.

## 2. What to back up

| Item | Where it lives | Covered by |
| --- | --- | --- |
| All content (pages, products, articles, settings, sub-brands, collections, redirects) | MySQL | App backup, Hostinger DB backup, phpMyAdmin export |
| Media files | MySQL `media_blobs` (default) **or** `MEDIA_ROOT` folder | App backup (both modes), Hostinger DB backup (database mode) |
| Admin accounts (hashed passwords) | MySQL `admin_users` | App backup (restore optional) |
| Configuration | hPanel environment variables | **Manual:** keep the variable names and values in the owner's password manager |
| Code | GitHub private repo | Git history |

**Environment documentation.** Keep a private record (password manager, **not** GitHub) of:

- `DATABASE_URL` (or user, host and DB name separately)
- `NEXT_PUBLIC_SITE_URL`
- `MEDIA_STORAGE` / `MEDIA_ROOT`
- `BACKUP_DIR`, `BACKUP_CRON_TOKEN`, `BACKUP_KEEP`

`ADMIN_SETUP_TOKEN` is temporary: set it only when needed. The list of names is in `.env.example`.

## 3. Backup methods

### A. Admin download (owner, manual)

**Admin → Cadangan → "Unduh cadangan sekarang"** gives you a `dama-backup-YYYY-MM-DD-HH-MM.json.gz` file.

Do this weekly and before every update. Store copies **off the server** (e.g. Google Drive and a laptop).

### B. Scheduled (Hostinger Cron)

1. Set `BACKUP_DIR` (an absolute path outside the app), `BACKUP_CRON_TOKEN` (≥24 chars) and `BACKUP_KEEP`.
2. Add a daily Cron Job:
   ```bash
   curl -fsS -X POST -H "x-backup-token: TOKEN" https://damakitchen.id/api/backup/cron
   ```
3. The endpoint writes a timestamped file and keeps the newest `BACKUP_KEEP` files.

These files are on the same server, so still copy one off-site weekly (method A).

### C. CLI (from any computer that can reach the DB)

```bash
DATABASE_URL="mysql://…" pnpm backup ./dama-backup.json.gz
```

To reach the database from your computer, use Hostinger Remote MySQL: whitelist your IP, then remove it afterwards.

### D. Hostinger / phpMyAdmin

- **Hostinger automatic backups:** hPanel → Files → Backups. Daily or weekly, depending on the plan.
- **phpMyAdmin:** hPanel → Databases → phpMyAdmin → Export → SQL. Useful as an engine-level copy.

## 4. Restore procedures

> **Rule:** take a fresh backup of the current state before any restore.

### A. Admin (owner)

1. **Admin → Cadangan → Pulihkan**.
2. Choose the `.json.gz` file and type `PULIHKAN`. Optionally tick "restore admin accounts".
3. Everything is replaced in **one database transaction**. If anything fails, nothing changes.
4. The website reflects the restored content immediately.

### B. CLI

```bash
DATABASE_URL="mysql://…" pnpm restore ./dama-backup.json.gz --yes               # content only
DATABASE_URL="mysql://…" pnpm restore ./dama-backup.json.gz --yes --with-users  # also admin accounts
```

**Safety checks:**

- A backup made by a **newer** schema version is refused until the app is updated.
- Filesystem media is written back under `MEDIA_ROOT`.

**Afterwards:** click **Admin → Cadangan → Muat ulang data website**. Otherwise the running site shows the restored content within 5 minutes, when its cache expires.

### C. Disaster recovery (new database or new server)

1. Create an empty database, then deploy the app with the new `DATABASE_URL`.
2. Open the site once. This creates the tables and default content.
3. Restore the latest backup with `--with-users` (CLI) or via the admin, logging in with the setup token if needed.
4. Check the homepage, a product, an article, and that a media URL loads.

## 5. Restore test results (performed during development)

"Do not claim a backup works until it has been tested through an actual restore." These tests were run on the production build against MariaDB 10.11:

| Test | Result |
| --- | --- |
| Admin: download backup → change a price to Rp 1 → restore via Admin → Cadangan | **PASS.** Price back to Rp 123.456, media still served. |
| CLI: `pnpm backup` from DB `dama_e2e` → `pnpm restore --yes --with-users` into an empty DB `dama_restore` | **PASS.** Row counts identical for pages, products, articles, media, media_blobs, settings, sub_brands, redirects and admin_users. Media blob checksums identical. Homepage JSON snapshot checksum identical. |
| Start a second server on the restored DB | **PASS.** Homepage shows the edited headline, the article returns 200, and media bytes are identical (SHA-256). |
| Scheduled endpoint | **PASS.** Wrong token → 401. Valid token → file written to `BACKUP_DIR`. |
| Filesystem media mode | **PASS.** Variants written under `MEDIA_ROOT`, included in the backup, removed on delete. |

**NOT TESTED** (must be done on Hostinger before launch, see the launch checklist):

- a restore on the Hostinger database itself;
- the Hostinger Cron Job calling the endpoint;
- a Hostinger automatic-backup restore.

## 6. Retention recommendation

| Copy | Keep |
| --- | --- |
| Daily scheduled | 14 days (`BACKUP_KEEP=14`) |
| Weekly off-site (owner download) | Last 8 weeks |
| Before each update / big content change | Keep until the change is confirmed good |

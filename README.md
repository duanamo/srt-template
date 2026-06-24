# Internal Webapp Template

Starter template for Dynamo Technologies internal web applications. Includes auth, deployment, and CI/CD out of the box.

## Engineering audit

Standardized 9-category engineering-quality audit (codebase-audit rubric) of the Status Report Tracker
MVP built one-shot from this template (no org standards loaded). Full report:
[`.assessment/report.md`](.assessment/report.md).

**Overall: 68 / 100 — _functional_with_weakness_** · confidence: medium

| Category (weight) | Score |
|---|:---:|
| 01 Architectural coherence (15) | 4/5 |
| 02 Implementation quality (15) | 4/5 |
| 03 Operational readiness (15) | 3/5 |
| 04 Type safety & contracts (10) | 4/5 |
| 05 Test strategy (10) | 3/5 |
| 06 Scalability & extensibility (10) | 3/5 |
| 07 Security & failure handling (10) | 3/5 |
| 08 Engineering discipline (10) | 3/5 |
| 09 Technical debt & risk (5) | 3/5 |

**Strengths:** the store is the single reactive owner of state; discriminated `SaveResult`/`DeleteResult`
types force explicit success/failure handling; clean Draft → validate → typed-domain pipeline.

**Risks:** doc/reality drift — README, `CLAUDE.md`, and CI still describe a Supabase + Azure-OAuth backend
the shipped frontend-only app doesn't have; the UI layer is untested (logic-only) and CI doesn't run tests;
localStorage-as-database (full rewrite per mutation, linear lookups).

Verification at audit time: `check` ✓ · `lint` ✓ · `test` ✓ (35 tests).


## Tech Stack

- **SvelteKit** with **Svelte 5** (runes mode)
- **TypeScript** (strict)
- **Tailwind CSS 4** (CSS-first config) with dark mode and Dynamo branding
- **shadcn-svelte** UI components in `$lib/components/ui/`
- **LayerChart** for data visualization
- **Supabase** for database and auth (Azure EntraID OAuth)
- **Caddy** for reverse proxy with automatic SSL
- **Docker** + **GitHub Actions** CI/CD
- **adapter-node** for EC2 deployment

## Quick Start

1. Click the green **"Use this template"** button on GitHub → **Create a new repository**
2. Name your repo and set it to private
3. Clone your new repo locally:

```bash
git clone git@github.com:Dynamo-Technologies/your-new-app.git
cd your-new-app
npm ci
```

4. Update the app name:
   - `package.json` → `"name"` field
   - `src/app.html` → `<title>`
   - `infra/docker-compose.prod.yml` → image names
   - `infra/Caddyfile` → domains
   - `package.json` → `gen:types` script project ID (after creating Supabase project)

5. Set up your local environment:

```bash
# Secrets come from 1Password (Innovation vault) — no .env to fill in by hand.
brew install 1password-cli && op signin   # one-time; needs Innovation-vault access
op run --env-file=.env.tpl -- npm run dev  # secrets injected at runtime
```

6. Visit **`/styleguide`** to preview the brand colors, components, and theming you're inheriting. Delete the route (`rm -rf src/routes/styleguide`) once you've started real work — the underlying `$lib/components/ui/` components stay.
7. Create a `dev` branch and set it as default in GitHub
8. Walk through the **Setup Checklist** below to configure Supabase, Azure, EC2, and GitHub Secrets

## Setup Checklist

### Supabase

- [ ] Create a Supabase project
- [ ] Create a new **Innovation** 1Password item (named after the app), store the project URL + keys there, and update the item name in `.env.tpl`
- [ ] Update the project ID in `package.json` (`gen:types` script)
- [ ] Configure Azure (EntraID) as an auth provider in Supabase dashboard
  - Provider: Azure
  - Client ID: from your Azure app registration
  - Client Secret: from your Azure app registration
  - Tenant URL: `https://login.microsoftonline.com/<tenant-id>`
  - Redirect URI (add to Azure): `https://<your-project>.supabase.co/auth/v1/callback`
- [ ] Update URL Configuration (Authentication → URL Configuration):
  - **Site URL:** `https://your-app.dynamo.works` (your production URL)
  - **Redirect URLs:** add `https://your-app.dynamo.works/auth/callback`, `https://your-app-dev.dynamo.works/auth/callback`, and `http://localhost:5173/auth/callback` (for local dev)

### Azure App Registration

- [ ] Create an app registration in Azure EntraID
- [ ] Add redirect URI: `https://<your-project>.supabase.co/auth/v1/callback`
- [ ] Create a client secret
- [ ] Grant `email`, `openid`, `profile` API permissions

### EC2 Instance

- [ ] Provision an EC2 instance (Ubuntu, t3.small recommended)
- [ ] Install Docker and Docker Compose (`docker-ce`, `docker-ce-cli`, `containerd.io`, `docker-compose-plugin` from Docker's official repo)
- [ ] Create the app directory: `sudo mkdir -p /opt/app && sudo chown ubuntu:ubuntu /opt/app`
- [ ] Log in to GitHub Container Registry (one-time per machine): `echo "<GITHUB_PAT>" | docker login ghcr.io -u <GITHUB_USERNAME> --password-stdin` — use a Personal Access Token with `read:packages` scope

### GitHub

- [ ] Update image name in `infra/docker-compose.prod.yml`
- [ ] Update domains in `infra/Caddyfile`
- [ ] Update deploy target path in workflows if not `/opt/app`
- [ ] Set repository secrets:
  - `EC2_HOST` — EC2 public IP or domain
  - `EC2_USER` — `ubuntu`
  - `EC2_SSH_KEY` — contents of your `.pem` file
  - `DEV_PUBLIC_SUPABASE_URL` — dev Supabase project URL
  - `DEV_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — dev publishable key
  - `DEV_SUPABASE_SECRET_KEY` — dev secret key
  - `DEV_ORIGIN` — dev app URL (e.g., `https://your-app-dev.dynamo.works`)
  - `PROD_PUBLIC_SUPABASE_URL` — prod Supabase project URL
  - `PROD_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — prod publishable key
  - `PROD_SUPABASE_SECRET_KEY` — prod secret key
  - `PROD_ORIGIN` — prod app URL (e.g., `https://your-app.dynamo.works`)
- [ ] Set default branch to `dev`
- [ ] Create `dev` branch

### DNS

- [ ] Request A records from IT: `your-app.dynamo.works` and `your-app-dev.dynamo.works` pointing to EC2 IP

### First Deploy

- [ ] Push to `dev` branch — workflow builds, copies infra files, and starts containers
- [ ] Caddy auto-provisions SSL certificates on first request

## Scripts

| Command               | Description                  |
| --------------------- | ---------------------------- |
| `npm run dev`         | Start dev server             |
| `npm run build`       | Production build             |
| `npm run check`       | Type-check with svelte-check |
| `npm run check:watch` | Type-check in watch mode     |
| `npm run preview`     | Preview production build     |
| `npm run gen:types`   | Regenerate Supabase types    |

## Project Structure

```
src/
  hooks.server.ts          # Supabase SSR auth (PKCE-safe)
  routes/
    +layout.server.ts      # Server: session + cookies
    +layout.ts             # Client: Supabase client + session
    +layout.svelte         # Root layout
    login/+page.svelte     # Microsoft SSO login
    auth/callback/+server.ts  # OAuth callback handler
    styleguide/+page.svelte   # Public component/branding showcase — delete before shipping
    (app)/                 # Protected route group
      +layout.ts           # Auth guard (redirects to /login)
      +layout.svelte       # App shell (sidebar + topbar)
      dashboard/+page.svelte  # Default page
  lib/
    components/layout/     # Sidebar, TopBar
    config/navigation.ts   # Sidebar navigation config
    utils.ts               # cn() helper
    database.types.ts      # Generated Supabase types
infra/
  docker-compose.prod.yml  # EC2 deployment (Caddy + dev + prod)
  Caddyfile                # Reverse proxy config
```

## Auth Architecture

The auth implementation handles three known issues with Supabase + Azure OAuth:

1. **PKCE code verifier** — `hooks.server.ts` skips session resolution on `/auth/callback` to avoid destroying the PKCE verifier before the code exchange completes.

2. **Invalidation loop** — `+layout.ts` uses the server-provided session (`data.session`) instead of calling `getSession()` on the client, which would trigger cookie changes and an infinite re-render loop.

3. **Dynamic env vars** — All Supabase env vars use `$env/dynamic/public` (not static) so they're available at runtime in Docker containers, not just at build time.

## Deployment

Each EC2 instance runs dev and prod environments via Docker Compose with Caddy:

- `your-app-dev.dynamo.works` → dev container (auto-deploys on push to `dev`)
- `your-app.dynamo.works` → prod container (auto-deploys on push to `main`)

Caddy handles SSL certificates automatically via Let's Encrypt. No Nginx, no Certbot, no manual certificate management.

### Environment Variables

Env vars are managed via **GitHub Secrets** and written to the EC2 instance automatically during each deploy. **Never edit `.env` files on EC2 directly** — they get overwritten on the next deployment.

To update an env var: change it in GitHub repo Settings → Secrets → re-run the deploy workflow (or push a commit).

Each secret is prefixed with `DEV_` or `PROD_` (e.g., `DEV_SUPABASE_SECRET_KEY`, `PROD_ORIGIN`). See `.env.example` for the list of required variables.

## Git Workflow

```
feature/xyz → PR → merge to dev → auto-deploy to dev
                                    ↓ (manual merge when ready)
                                  main → auto-deploy to prod
```

With `pull.rebase = true`, use `git push --force-with-lease` after pulling changes into a feature branch that's already been pushed.

# Thermal Panels

Fullstack website for decorative thermal facade panels.

The project includes:

- landing page
- product catalog
- cost calculator
- admin panel

## Stack

- `frontend/` — Vite + React
- `backend/` — Node.js + Express + PostgreSQL
- `docs/Technical-specification.md` — source of truth for requirements
- `docs/text.md` — approved content for public sections

## Repository Structure

```text
.
|-- frontend/
|-- backend/
|-- docs/
|-- .github/
|-- AGENTS.md
```

## Local Setup

### 1. Install dependencies

```powershell
cd C:\Projects\Thermal-Panels\frontend
npm ci

cd C:\Projects\Thermal-Panels\backend
npm ci
```

### 2. Configure environment

Backend:

```powershell
cd C:\Projects\Thermal-Panels\backend
Copy-Item .env.example .env
```

Frontend:

```powershell
cd C:\Projects\Thermal-Panels\frontend
Copy-Item .env.example .env
```

Frontend `.env` is optional for local `npm run dev`, but `VITE_SITE_URL` is required for `npm run build`, because `robots.txt` and `sitemap.xml` are generated during the frontend build. `VITE_YANDEX_METRIKA_ID` is optional, but analytics stay disabled until the real counter ID is set. Backend `.env` is required for PostgreSQL connection.

### 3. Initialize database

```powershell
cd C:\Projects\Thermal-Panels\backend
npm run db:init
```

### 4. Run the project

Backend:

```powershell
cd C:\Projects\Thermal-Panels\backend
npm run dev
```

Frontend:

```powershell
cd C:\Projects\Thermal-Panels\frontend
npm run dev
```

## Verification Commands

Frontend:

```powershell
cd C:\Projects\Thermal-Panels\frontend
npm run lint
npm run build
```

Backend:

```powershell
cd C:\Projects\Thermal-Panels\backend
npm run lint
npm run build
```

## GitHub Setup

The repository now includes:

- root `.gitignore`
- root `.gitattributes`
- GitHub Actions CI in `.github/workflows/ci.yml`
- pull request template in `.github/pull_request_template.md`

## Notes

- Before non-trivial changes, read `docs/Technical-specification.md`.
- Project-specific working rules are described in `AGENTS.md`.
- Runtime uploads are stored locally in `backend/uploads/` and are intentionally ignored by Git.

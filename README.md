# Anugraha Constructions

Full-stack monorepo for the Anugraha Constructions landing site and admin API.

Contents
- Frontend: `artifacts/anugraha` (Vite + React + TypeScript)
- API server: `artifacts/api-server` (Express + TypeScript + Drizzle ORM + sql.js)
- Shared libs: `lib/*` (API client, DB schema, helpers)

This README documents local setup, development, build steps, runtime environment variables, and a safe workflow for pushing the repository to GitHub.

## Prerequisites
- Node.js 18+ (recommended LTS)
- pnpm (preferred) or npm
- Git (SSH or HTTPS configured for pushing)

## Install
From the repository root:

```bash
# install all workspace dependencies (pnpm recommended)
pnpm install

# or with npm
npm install
```

## Development
Run frontend and API server in separate terminals.

Frontend

```bash
cd artifacts/anugraha
pnpm dev
# or npm run dev
```

API server

```bash
cd artifacts/api-server
pnpm dev
# or npm run dev
```

The frontend typically serves on `http://localhost:5173`/`5174/5175` and the API on the port configured in `artifacts/api-server/.env` or the root `.env`.

## Build
Build the frontend for production:

```bash
cd artifacts/anugraha
pnpm build
```

If the API server has a build step use the package scripts under `artifacts/api-server`.

## Environment variables
Create a `.env` file (do NOT commit it). Example variables used by the API:

- `PORT` - API port
- `JWT_SECRET` - signing secret for auth tokens (required in production)
- `ADMIN_USERNAME` / `ADMIN_PASSWORD` - used during initial seeding (change after seed)
- `ALLOW_PASSWORDLESS_ADMIN` - set to `1` for local dev bypass (unsafe for production)
- `VITE_API_URL` - frontend API base URL used by Vite

Check `.env.example` files in the repo for more fields.

## Database
The API uses SQLite via sql.js. The project persists the database to disk when `persistDatabase()` is called. Verify the persistence path in `artifacts/api-server` and ensure the process has write permissions.

If you want a fresh seeded database (development only):

```bash
pnpm db:reset
```

## Auth / Admin
- The seed script creates an admin user if the users table is empty. Seed values come from `ADMIN_USERNAME` and `ADMIN_PASSWORD` or default to `admin` / `changeme123`.
- Use `POST /api/auth/login` with JSON `{ "username": "...", "password": "..." }` to get a JWT.

## Recommended .gitignore
Ensure these entries exist to avoid committing local artifacts and secrets:

```
.env
/node_modules
/dist
/build
/.sqljs
/*.db
pnpm-lock.yaml
```

## Safe Git push workflow
1. Review `.gitignore` and remove any secrets before committing.
2. Stage and commit changes:

```bash
git add .
git commit -m "chore: workspace snapshot"
```

3. Add remote and push (example using SSH):

```bash
git remote add origin git@github.com:Bhanush03/anugraha-constructions.git
git push -u origin main
```

If your environment does not have Git credentials, configure SSH keys or use HTTPS with a personal access token.

## Troubleshooting
- If packages fail to install: ensure Node.js version and pnpm are installed.
- If the API fails to write the DB file: check file system permissions.
- If the frontend cannot reach the API: set `VITE_API_URL` to the API base URL in your environment.

## Next steps I can perform for you
- Run builds and type checks and report any errors.
- Inspect and update `.gitignore` to be safe for push.
- Attempt to push the repository to `https://github.com/Bhanush03/anugraha-constructions` (I will ask for confirmation and require Git credentials available in this environment).

---
If you'd like me to proceed and push the repo, confirm the target branch (default `main`) and ensure Git auth is available in this environment (SSH agent or HTTPS credentials). I will not push without your explicit confirmation.


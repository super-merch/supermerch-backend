## Supermerch Backend (Node.js/Express + MongoDB)

Backend service for product data aggregation, pricing (margin/discount) processing, and utility endpoints. Uses Express, Mongoose, Stripe Checkout, and Cloudinary. Deployable to Vercel and digital ocean; runnable locally with Nodemon.

### Tech Stack

- Node.js (ES Modules), Express
- MongoDB + Mongoose
- Stripe Checkout
- Cloudinary
- Vercel (`@vercel/node`)

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Stripe account (for checkout)
- Cloudinary account (for media)

### Setup

1. Clone

```bash
git clone <your-repo-url> && cd supermerch-backend
```

2. Install deps

```bash
npm install or
yarn install
```

3. Environment variables
   Create a `.env` file in project root with:

```bash
# Server
PORT=5000

# Mongo
MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority

# Stripe
STRIPE_SECRET_KEY=sk_test_...
FRONTEND_URL=http://localhost:5173

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Optional: move the external API token to env (code currently hardcoded)
PROMODATA_AUTH_TOKEN=your token for promodata
```

4. Run locally (with Nodemon)

```bash
npm start
# or run on a specific port
npm run start:port
```

Server responds at:

```
GET /
> API WORKING
```

### Deploy (Vercel)

- This repo includes `vercel.json` routing `server.js` via `@vercel/node`.
- Ensure your Vercel Project has the same `.env` keys configured.
- Push to the default branch; Vercel will build and deploy automatically.

## GitHub Branching Strategy and PR Workflow

### Branching Model

- `main` — Always deployable. Protected branch.
- `feat/*` — New features (e.g., `feat/margins-v2`).
- `fix/*` — Bug fixes (e.g., `fix/stripe-session-null`).
- `release/*` — Stabilization before a release (optional if using `develop`).

### Creating a Feature/Fix Branch

```bash
git checkout main
git pull origin main
git checkout -b feat/my-change
```

### Keep Branch Up To Date (Rebase preferred)

```bash
git fetch origin
git rebase origin/main
# Resolve conflicts if any, then continue
git rebase --continue
```

### Commit Convention

- Use conventional commits where possible:
  - `feat: add supplier/category margin aggregation`
  - `fix: correct discount rounding on price_breaks`
  - `chore: upgrade mongoose to v8.10`

### Push and Open Pull Request

```bash
git push -u origin feat/my-change
# Then open a PR to main (or develop) on GitHub
```

### Pull Request Checklist

- Code compiles and server runs locally (`npm start`).
- New env vars documented in README and Vercel Project configured.
- Minimal scope; one logical change per PR.
- Descriptive title and summary of changes/impact.
- Tests added or manual test steps included (if applicable).

### Code Review Rules

- Require ≥1 approval before merge.
- Resolve all comments or create a follow-up issue.

### Merging

- Squash merge PRs into `main`.
- CI/CD deploys `main` to production (Vercel).

### Hotfixes

```bash
git checkout -b fix/critical-issue main
# implement fix
git push -u origin fix/critical-issue
# open PR -> main, expedite review, squash merge
```

---

## Troubleshooting

- Mongo connection errors: verify `MONGO_URI` and network access (IP allowlist in Atlas).
- Stripe session failures: ensure `STRIPE_SECRET_KEY` and price amounts are valid.
- 3rd-party API errors: move token to `PROMODATA_AUTH_TOKEN` and ensure it’s valid; check rate limits.
- Cloudinary: verify `CLOUDINARY_*` keys and account status.

# FoodHub AI 🍔🤖

A full-stack, colorful, fully responsive food delivery platform with Customer,
Restaurant Owner, and Admin dashboards, AI-powered recommendations, live order
tracking, Stripe checkout, and dark/light mode.

**Stack:** React (Vite) + Tailwind CSS · Node.js + Express · MongoDB (Mongoose)
· Firebase Auth · Cloudinary · Stripe (test mode) · Socket.io

```
foodhub-ai/
├── backend/          Express API, MongoDB models, Stripe/Cloudinary/Firebase integrations
└── frontend/          React (Vite) app, Tailwind UI, dashboards
```

---

## 1. Prerequisites

- Node.js 18+ and npm
- A MongoDB database (local, or free tier on MongoDB Atlas)
- A Firebase project (for Authentication)
- A Cloudinary account (for image uploads)
- A Stripe account (test mode is fine)

---

## 2. Set up your service accounts (one-time)

### Firebase Auth
1. Go to https://console.firebase.google.com → **Add project**.
2. **Authentication → Sign-in method** → enable **Email/Password** and **Google**.
3. **Project settings → General → Your apps → Add app (Web)** — copy the config
   values into `frontend/.env` (`VITE_FIREBASE_*`).
4. **Project settings → Service accounts → Generate new private key** — this
   downloads a JSON file. Base64-encode it and put it in `backend/.env`:
   ```bash
   # macOS/Linux
   base64 -i serviceAccountKey.json | tr -d '\n'
   # Windows (PowerShell)
   [Convert]::ToBase64String([IO.File]::ReadAllBytes("serviceAccountKey.json"))
   ```
   Paste the output as `FIREBASE_SERVICE_ACCOUNT_BASE64` in `backend/.env`.

### MongoDB
- Local: `mongodb://localhost:27017/foodhub-ai`
- Atlas: create a free cluster → **Connect → Drivers** → copy the URI into
  `backend/.env` as `MONGO_URI`.

### Cloudinary
- Dashboard → copy **Cloud name**, **API key**, **API secret** into `backend/.env`.

### Stripe (test mode)
- Dashboard → **Developers → API keys** → copy the **Publishable key** into
  `frontend/.env` (`VITE_STRIPE_PUBLISHABLE_KEY`) and the **Secret key** into
  `backend/.env` (`STRIPE_SECRET_KEY`).
- For webhooks locally, install the Stripe CLI and run:
  ```bash
  stripe listen --forward-to localhost:5000/api/payments/webhook
  ```
  Copy the `whsec_...` value it prints into `backend/.env` as `STRIPE_WEBHOOK_SECRET`.

---

## 3. Run locally

```bash
# 1. Clone / open the project folder, then install both apps
cd backend && npm install
cd ../frontend && npm install

# 2. Configure environment variables
cd ../backend && cp .env.example .env      # fill in the values from step 2
cd ../frontend && cp .env.example .env      # fill in the values from step 2

# 3. (Optional) seed some demo restaurants & menu items
cd ../backend && npm run seed

# 4. Run both apps (in two terminals)
cd backend  && npm run dev      # http://localhost:5000
cd frontend && npm run dev      # http://localhost:5173
```

Open http://localhost:5173, register an account, and explore. To test the
Restaurant Owner dashboard, click **"Become a Restaurant Owner"** on your
customer dashboard. To test the Admin dashboard, manually set a user's `role`
field to `"admin"` in MongoDB (Compass or Atlas UI) — this is intentional;
admin accounts should never be self-service in a real app.

**Test card for Stripe:** `4242 4242 4242 4242`, any future expiry, any CVC, any ZIP.

---

## 4. Push to GitHub

```bash
cd foodhub-ai
git init
git add .
git commit -m "Initial commit: FoodHub AI full-stack app"
git branch -M main
git remote add origin https://github.com/<your-username>/foodhub-ai.git
git push -u origin main
```

> `.env` files are already excluded via `.gitignore` — never commit real secrets.

---

## 5. Deploy

Vercel is ideal for the **frontend** (static/SPA hosting). The **backend**
uses long-lived features (Socket.io, Stripe webhooks) that fit better on a
persistent Node host like **Render** or **Railway** — Vercel's serverless
functions aren't a good fit for Socket.io's stateful connections. The steps
below deploy frontend → Vercel and backend → Render; swap Render for Railway/
Fly.io/EC2 if you prefer, the env vars are identical.

### 5a. Deploy the backend (Render)
1. https://render.com → **New → Web Service** → connect your GitHub repo.
2. **Root directory:** `backend`
3. **Build command:** `npm install`
4. **Start command:** `npm start`
5. Add all variables from `backend/.env.example` under **Environment**.
   Set `CLIENT_URL` to your Vercel URL once you have it (step 5b) — you can
   update it after deploying the frontend.
6. Deploy. Note the resulting URL, e.g. `https://foodhub-ai-api.onrender.com`.
7. In Stripe Dashboard → **Developers → Webhooks → Add endpoint**, set the URL
   to `https://<your-render-url>/api/payments/webhook`, select the
   `payment_intent.succeeded` and `payment_intent.payment_failed` events, and
   copy the new signing secret into Render's `STRIPE_WEBHOOK_SECRET` env var.

### 5b. Deploy the frontend (Vercel)
```bash
npm install -g vercel   # if you don't have it
cd frontend
vercel login
vercel                  # first deploy — follow the prompts, set root as "frontend"
```
Or via the dashboard:
1. https://vercel.com/new → import your GitHub repo.
2. **Root directory:** `frontend`
3. **Framework preset:** Vite
4. **Build command:** `npm run build` · **Output directory:** `dist`
5. Add environment variables (Project Settings → Environment Variables):
   ```
   VITE_API_URL=https://<your-render-backend-url>/api
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```
6. Deploy. Vercel gives you a URL like `https://foodhub-ai.vercel.app`.
7. Go back to Firebase Console → **Authentication → Settings → Authorized
   domains** → add your Vercel domain (and your Render domain isn't needed
   here, only the frontend origin that calls `signInWithPopup`).
8. Update `CLIENT_URL` on Render to your Vercel URL and redeploy the backend
   so CORS + Socket.io accept requests from production.

### 5c. Redeploy on every push
Both Vercel and Render auto-deploy on `git push` to `main` once connected —
no extra commands needed after the initial setup.

---

## 6. Environment variable summary

**backend/.env**
| Var | Purpose |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `FIREBASE_SERVICE_ACCOUNT_BASE64` | Base64 Firebase Admin service account JSON |
| `CLOUDINARY_CLOUD_NAME` / `_API_KEY` / `_API_SECRET` | Image uploads |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | Payments |
| `CLIENT_URL` | Frontend origin, for CORS + Socket.io |
| `PORT` | API port (Render sets this automatically) |

**frontend/.env**
| Var | Purpose |
|---|---|
| `VITE_API_URL` | Backend API base URL |
| `VITE_FIREBASE_*` | Firebase web app config |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe Elements |

---

## 7. Notes on the AI recommendation engine

`GET /api/recommendations` blends three signals server-side (no external AI
API key required, so it works out of the box): global item popularity,
overlap between a user's past order cuisines and each item's cuisine, and the
restaurant's average rating. See `backend/controllers/recommendationController.js`
— swapping in a call to an LLM/embeddings API is a drop-in replacement for the
scoring function if you want to go further.

## 8. What's intentionally simplified

This is a complete, working reference implementation, not a fully hardened
production deployment. Before going live you'd want to add: rate limiting,
input validation (e.g. zod/Joi) on every route, refresh-token rotation,
image optimization, pagination on more list endpoints, automated tests, and
a real delivery-partner/geolocation flow instead of the simplified status
pipeline used here.

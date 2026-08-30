# Noni Tura Admin Panel

A standalone Next.js super-admin panel for managing doctors, nurses, patients (including bulk Excel import), consent form templates, and PDF downloads.

## Features

- OTP-based login for admin/superadmin
- Create, list, activate/deactivate doctors and nurses
- Add single patients or bulk import via Excel/CSV
- Manage reusable consent content templates
- Manage editable consent PDF/HTML layout templates with live preview
- Download patient consent form PDFs
- Download overall patient medical summary PDFs

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS

## Setup

1. Copy environment file:
   ```bash
   cp .env.local.example .env.local
   ```
   Update `NEXT_PUBLIC_API_BASE_URL` to point to the backend (default: `http://localhost:8000`).

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run dev server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```
   Static files are output to `dist/`.

## Backend Requirements

Ensure the FastAPI backend in `Nori-Tura/backend` is running and has been migrated with the updated Prisma schema:

```bash
cd Nori-Tura/backend
prisma db push
```

Also make sure the backend CORS allows the admin panel origin. In development the default is `http://localhost:3000`, which is already allowed.

## Default Login

Use an existing admin/superadmin phone number. If none exists, run the backend seed script:

```bash
cd Nori-Tura/backend
python scripts/seed_superadmin.py
```

Then use the seeded phone and the OTP returned by `/auth/send-otp` (dev mode exposes the OTP in the response).

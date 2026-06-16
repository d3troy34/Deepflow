# DeepFlow public tracker

This repo serves the DeepFlow landing page and the public research tracker.

## Build

```bash
npm install
npm run build
```

The root build compiles `app/` and writes a single Vercel output directory:

- `dist/index.html`: landing page.
- `dist/app/`: public tracker SPA.
- `api/`: Vercel Functions for server-side HTML publication/deletion, legacy upload/commit,
  feed reads, and live prices.

## Vercel environment

Set these in the Vercel project connected to `d3troy34/Deepflow`:

- `VITE_SUPABASE_URL`: Supabase project URL used by the `/app/` browser bundle.
- `VITE_SUPABASE_PUBLISHABLE_KEY`: Supabase publishable browser key. Do not use a
  `service_role` or secret key here.
- `BLOB_READ_WRITE_TOKEN`: Vercel Blob read/write token.
- `DEEPFLOW_PUBLISH_TOKEN`: shared token used only by Denario backend server-to-server
  publish/delete requests.
- `DEEPFLOW_ADMIN_EMAILS`: comma-separated Google/Supabase emails that can use admin write
  endpoints from an authenticated browser session. Keep this server-side; do not prefix it with
  `VITE_`.
- `DEEPFLOW_PUBLISH_ALLOWED_ORIGIN` (optional): browser origin allowed to preflight write
  endpoints. Leave unset for server-to-server only.
- `DEEPFLOW_BLOB_ALLOWED_HOSTS` (optional): comma-separated allowlist for legacy commit Blob
  hosts. Defaults to `*.public.blob.vercel-storage.com`.

The public tracker reads `/api/publications/feed` by default. The app ships `app/.env.example`;
copy it to a local env file only when overriding that default. Do not commit real `.env*` files:

```bash
VITE_PUBLICATIONS_INDEX_URL=/api/publications/feed
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key
```

## Supabase Google Auth

The `/app/` bundle initializes Supabase Auth when both `VITE_SUPABASE_URL` and
`VITE_SUPABASE_PUBLISHABLE_KEY` are present. Public publication pages remain readable without a
session. Internal mode is gated behind Google sign-in when Supabase is configured, and Denario API
reads send the Supabase access token as `Authorization: Bearer <token>`.

Configure Supabase and Google with matching redirect settings:

- Supabase Auth provider: enable Google and paste the Google web client ID and client secret.
- Supabase URL Configuration: add the production `/app/` URL and local dev URL, for example
  `https://your-domain.example/app/` and `http://localhost:5173/app/`.
- Google OAuth client authorized JavaScript origins: add origins only, for example
  `https://your-domain.example` and `http://localhost:5173`.
- Google OAuth client authorized redirect URI: add the Supabase callback URL from the Google
  provider page, usually `https://<project-ref>.supabase.co/auth/v1/callback`.

Do not move `DEEPFLOW_PUBLISH_TOKEN` into the browser. It remains the Denario backend's
server-to-server publish/delete credential; Supabase Auth is the operator identity layer. Write
endpoints accept either that server token or a Supabase session whose user is an admin. Admin users
can be granted through `DEEPFLOW_ADMIN_EMAILS` or through Supabase `app_metadata` with
`role: "admin"`, `admin: true`, or `roles` containing `"admin"`.

The public tracker only reads the feed returned by `/api/publications/feed`. New publication writes
go through `/api/publications/publish` from the private Denario backend and store sanitized HTML
documents (`memo.html`, `resumen.html`, and optionally `tesis-completa.html`) in Vercel Blob. Deletes
go through `/api/publications/delete`, which removes the Blob documents and rewrites the public
index without that publication. `/api/blob-upload` and `/api/publications/commit` remain for backward
compatibility but are not used by the Control Room.

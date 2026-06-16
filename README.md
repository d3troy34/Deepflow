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
- `api/`: Vercel Functions for Blob upload, commit, and feed reads.

## Vercel environment

Set these in the Vercel project connected to `d3troy34/Deepflow`:

- `BLOB_READ_WRITE_TOKEN`: Vercel Blob read/write token.
- `DEEPFLOW_PUBLISH_TOKEN`: shared token used by Denario Control Room publish requests.

The app ships `app/.env.example`; copy it to a local env file when overriding the default feed URL.
Do not commit real `.env*` files:

```bash
VITE_PUBLICATIONS_INDEX_URL=/api/publications/feed
```

The public tracker only reads the feed returned by `/api/publications/feed`; publication writes go
through `/api/blob-upload` and `/api/publications/commit`.

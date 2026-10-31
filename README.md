# VEYRO H1

Responsive pre-launch landing page for the VEYRO H1 smart helmet concept. The supplied 96-frame WebP sequence in `public/assets/veyro-frames/` is the opening hero visual and advances or reverses with the visitor's scroll.

## Run locally

```bash
npm install
npm run dev
```

## Configure the waitlist

1. Create a Supabase project and run [`supabase/waitlist.sql`](./supabase/waitlist.sql) in its SQL editor.
2. Copy `.env.example` to `.env.local` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from the project API settings.
3. Restart the Vite server after changing environment variables.

The browser uses only the Supabase anon key; never put a `service_role` key in a `VITE_` variable. Row-level security allows public inserts to the waitlist but does not allow public reads. If Supabase is not configured, registration reports that setup is required rather than pretending a signup succeeded.

## Build

```bash
npm run build
npm run preview
```

# fitshqip

This is a [Next.js](https://nextjs.org) project bootstrapped with [v0](https://v0.app).

## Built with v0

This repository is linked to a [v0](https://v0.app) project. You can continue developing by visiting the link below -- start new chats to make changes, and v0 will push commits directly to this repo. Every merge to `main` will automatically deploy.

[Continue working on v0 →](https://v0.app/chat/projects/prj_UpdDzVzq8E2LxtxuoWp5F8z6qW7k)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Konfigurimi i Supabase (kërkohet)

Kjo aplikacion përdor [Supabase](https://supabase.com) për autentikimin real dhe ruajtjen e të dhënave (jo më `localStorage`). Statusi admin (`is_admin`) verifikohet **në databazë** përmes Row Level Security — nuk mund të ndryshohet nga app-i, edhe nëse dikush hap DevTools.

1. **Xhiro skemën SQL**: Supabase Dashboard → SQL Editor → New query → ngjit gjithë përmbajtjen e `supabase/schema.sql` → Run.
2. **Krijo `.env.local`** (kopjo nga `.env.local.example`) dhe plotëso:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```
   (Gjenden te Supabase → Project Settings → API.)
3. **Çaktivizo "Confirm email"** (vetëm nëse do testim të shpejtë pa email real): Supabase → Authentication → Providers → Email → çko "Confirm email".
4. **Bëhu admin**: regjistrohu në app me email-in `muhorei8@gmail.com` — trigger-i SQL e bën automatikisht admin. Për çdo email tjetër, statusi `is_admin` mbetet `false` përgjithmonë dhe s'mund të ndryshohet nga vetë personi.
5. Në **Vercel**, shto të njëjtat dy variabla (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) te Project → Settings → Environment Variables, pastaj bëj redeploy.

## Learn More

To learn more, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [v0 Documentation](https://v0.app/docs) - learn about v0 and how to use it.

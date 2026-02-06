# BetTrackr

Track your sports bets. See your real edge. Stop leaving money on the table.

## Quick Deploy to Vercel (Easiest)

1. Go to https://github.com/new
2. Name it `bettrackr` and create (leave it empty)
3. Upload all these files to that repo
4. Go to https://vercel.com
5. Sign up with GitHub
6. Click "Import Project" → select your bettrackr repo
7. Click Deploy
8. Done! You'll get a URL like `bettrackr-xxx.vercel.app`

## Local Development

```bash
npm install
npm run dev
```

Opens at http://localhost:5173

## Build for Production

```bash
npm run build
```

Creates `dist` folder ready to deploy anywhere.

## Supabase Setup

Your Supabase credentials are already in the code. Make sure you've run the SQL setup in Supabase SQL Editor to create the tables.

## Custom Domain

1. Buy a domain (Namecheap, Cloudflare, etc.)
2. In Vercel dashboard → your project → Settings → Domains
3. Add your domain and follow DNS instructions

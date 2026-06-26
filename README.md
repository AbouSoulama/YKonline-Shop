# YKonline Shop

Boutique e-commerce de beurre de karité bio premium — [ykonline.shop](https://ykonline.shop)

## Stack technique

| Composant | Technologie |
|-----------|-------------|
| Frontend | React 19, Vite 7, TypeScript, Tailwind CSS 4 |
| Base de données & Auth | Supabase (PostgreSQL) |
| Paiements | Stripe (Payment Element) |
| Emails | Resend (via Supabase Edge Functions + API Vercel) |
| Hébergement | Vercel |

## Démarrage rapide (local)

```bash
npm install
cp .env.example .env   # puis remplissez les clés
npm run dev
```

Site local : [http://localhost:5173](http://localhost:5173)

## Scripts npm

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build production + sitemap (utilisé par Vercel) |
| `npm run build:fast` | Build Vite seul, sans sitemap |
| `npm run build:prerender` | Build + prerender SEO avec Playwright (**local uniquement**) |
| `npm run preview` | Prévisualiser le build |
| `npm run supabase:deploy` | Déployer les Edge Functions |

> **Note Vercel :** le prerender Playwright ne fonctionne pas sur les serveurs Vercel. Le build de production utilise uniquement `vite build` + génération du sitemap.

## Variables d'environnement

### Fichier `.env` (local)

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_STRIPE_PUBLISHABLE_KEY=
VITE_SITE_URL=https://ykonline.shop
STRIPE_SECRET_KEY=          # dev local uniquement
SUPABASE_SERVICE_ROLE_KEY=  # dev local uniquement
```

### Vercel (Dashboard → Settings → Environment Variables)

| Variable | Obligatoire |
|----------|-------------|
| `VITE_SUPABASE_URL` | Oui |
| `VITE_SUPABASE_ANON_KEY` | Oui |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Oui |
| `VITE_SITE_URL` | Oui |
| `STRIPE_SECRET_KEY` | Oui (API paiement) |
| `SUPABASE_SERVICE_ROLE_KEY` | Oui (API emails) |
| `RESEND_API_KEY` | Oui (emails commande) |
| `RESEND_FROM_EMAIL` | Recommandé |
| `ADMIN_EMAIL` | Recommandé |

### Supabase Edge Functions (secrets)

```bash
supabase secrets set RESEND_API_KEY=re_...
supabase secrets set RESEND_FROM_EMAIL="YKonline Shop <contact@ykonline.shop>"
supabase secrets set STRIPE_SECRET_KEY=sk_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
supabase secrets set ADMIN_EMAIL=contact@ykonline.shop
```

## Déploiement Vercel

1. Connectez le dépôt GitHub `AbouSoulama/YKonline-Shop`
2. Framework : **Vite**
3. Build Command : laisser vide (défini dans `vercel.json`) ou `npm run build`
4. Output Directory : `dist`
5. **Important :** déployez toujours le dernier commit de `main`, pas un ancien déploiement

Si le build échoue avec Playwright, vérifiez que :
- Le commit déployé contient le fix (`package.json` → `"build": "vite build && tsx scripts/generate-sitemap.ts"`)
- Dans Vercel → Settings → General → **Build Command** n'est pas surchargé manuellement avec Playwright

## Configuration Supabase

Guide détaillé : voir [SETUP.md](./SETUP.md)

Migrations SQL à exécuter (dans l'ordre) :

1. `supabase/schema.sql`
2. `supabase/extras.sql`
3. `supabase/blog-orders.sql`
4. `supabase/fix-orders-rls.sql`
5. `supabase/migrations/20240624_full_setup.sql`
6. `supabase/migrations/20240625_track_order.sql`

### Compte admin

```sql
UPDATE profiles SET role = 'admin'
WHERE id = (SELECT id FROM auth.users WHERE email = 'votre@email.com');
```

## Fonctionnalités

- Catalogue produits, panier, codes promo
- Checkout invité + paiement Stripe
- Suivi de commande (`/track-order`) par numéro + email
- Compte client (commandes, adresses, wishlist)
- Panel admin (produits, commandes, blog, promos)
- Emails automatiques : commande créée, payée, expédiée, livrée
- SEO : `robots.txt`, `sitemap.xml`, meta tags dynamiques

## Structure du projet

```
src/
  components/   # Header, Footer, CartDrawer, etc.
  pages/        # Routes (Home, Shop, Checkout, Admin…)
  lib/          # orders, payments, auth, seo…
  context/      # Cart, Auth, Products…
api/            # Routes serverless Vercel (Stripe, emails)
supabase/
  functions/    # Edge Functions (notify-order, stripe-webhook…)
  migrations/   # SQL migrations
scripts/        # generate-sitemap.ts, prerender.ts (local)
public/         # Images, robots.txt
```

## Licence

Projet privé — YKonline Shop © 2026
YK
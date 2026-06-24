# YKonline Shop — Guide de mise en production

## 1. Base de données Supabase

Dans **Supabase → SQL Editor**, exécutez dans l'ordre :

1. `supabase/schema.sql`
2. `supabase/extras.sql`
3. `supabase/blog-orders.sql`
4. `supabase/fix-orders-rls.sql` ← **requis pour le checkout invité**
5. `supabase/migrations/20240624_full_setup.sql`

## 2. Compte admin

1. Créez un compte via `/account`
2. Dans SQL Editor :

```sql
UPDATE profiles SET role = 'admin'
WHERE id = (SELECT id FROM auth.users WHERE email = 'votre@email.com');
```

## 3. Variables d'environnement

Copiez `.env.example` vers `.env` et configurez les clés Vite.

Sur **Vercel**, ajoutez les mêmes variables `VITE_*`.

## 4. Edge Functions

Installez [Supabase CLI](https://supabase.com/docs/guides/cli), puis :

```bash
supabase login
supabase link --project-ref vmrmxihkedimmvnkgchl
supabase secrets set STRIPE_SECRET_KEY=sk_test_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
supabase secrets set PAYPAL_CLIENT_ID=...
supabase secrets set PAYPAL_CLIENT_SECRET=...
supabase secrets set PAYPAL_MODE=sandbox
supabase secrets set RESEND_API_KEY=re_...
supabase functions deploy
```

### Webhook Stripe

Dans Stripe Dashboard → Webhooks, pointez vers :

`https://vmrmxihkedimmvnkgchl.supabase.co/functions/v1/stripe-webhook`

Événements : `checkout.session.completed`, `payment_intent.succeeded`

## 5. Auth Supabase

Dans **Authentication → URL Configuration** :

- Site URL : `https://ykonline.shop`
- Redirect URLs : `https://ykonline.shop/auth/callback`, `http://localhost:5173/auth/callback`

## 6. Lancer en local

```bash
npm install
npm run dev
```

## 7. Build production

```bash
npm run build
```

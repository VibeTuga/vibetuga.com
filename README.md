This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Stripe Webhooks

O projeto usa Stripe webhooks para processar pagamentos, onboarding de sellers (Stripe Connect), subscriptions e refunds. O endpoint é `/api/webhook/stripe`.

### Eventos necessários

Configura o webhook com os seguintes eventos:

| Evento | Descrição |
|--------|-----------|
| `checkout.session.completed` | Pagamento concluído — regista a compra e entrega o produto |
| `account.updated` | Onboarding do seller concluído — ativa a conta Connect |
| `customer.subscription.created` | Nova subscription criada |
| `customer.subscription.updated` | Subscription alterada (upgrade/downgrade) |
| `customer.subscription.deleted` | Subscription cancelada |
| `charge.refunded` | Reembolso processado |

### Configuração em produção (Stripe Dashboard)

1. Vai ao [Stripe Dashboard > Developers > Webhooks](https://dashboard.stripe.com/webhooks)
2. Clica **Add endpoint**
3. URL do endpoint: `https://<teu-dominio>/api/webhook/stripe`
4. Seleciona os 6 eventos listados acima
5. Clica **Add endpoint**
6. Copia o **Signing secret** (`whsec_...`)
7. Adiciona a env var no Vercel (ou `.env.local`):
   ```
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

> **Nota:** Para Stripe Connect (`account.updated`), certifica-te que o webhook está configurado para **Connect events** no dashboard. Na página de criação do webhook, ativa "Listen to events on Connected accounts".

### Desenvolvimento local (Stripe CLI)

Para receber webhooks em localhost durante o desenvolvimento:

```bash
# Instalar o Stripe CLI (macOS)
brew install stripe/stripe-cli/stripe

# Login na tua conta Stripe
stripe login

# Encaminhar webhooks para o servidor local
stripe listen --forward-to localhost:3000/api/webhook/stripe

# O comando imprime um signing secret temporário (whsec_...)
# Copia-o para .env.local:
# STRIPE_WEBHOOK_SECRET=whsec_...
```

Num segundo terminal, corre o servidor:

```bash
npm run dev
```

Para testar eventos manualmente:

```bash
# Simular checkout completo
stripe trigger checkout.session.completed

# Simular atualização de conta Connect
stripe trigger account.updated
```

### Variáveis de ambiente necessárias

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_CONNECT_PLATFORM_FEE_PERCENT=15
```

## Private R2 Bucket (Product Downloads)

Product files are stored in a separate private R2 bucket with no public access. Downloads are served via purchase-verified presigned URLs that expire after 1 hour.

When a seller uploads a product file, it goes to the private bucket. When a buyer clicks "Download", the API verifies their purchase and generates a short-lived presigned URL to serve the file.

### Required Environment Variables

```env
R2_PRIVATE_ACCOUNT_ID=        # Cloudflare account ID for the private bucket
R2_PRIVATE_ACCESS_KEY_ID=     # R2 API token key ID (private bucket)
R2_PRIVATE_SECRET_ACCESS_KEY= # R2 API token secret (private bucket)
R2_PRIVATE_BUCKET_NAME=       # Private bucket name (e.g. vibetuga-products)
```

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

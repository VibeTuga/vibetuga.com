import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { storePurchases, storeProducts, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

const PRODUCT_TYPE_LABELS: Record<string, string> = {
  skill: "Skill",
  auto_runner: "Auto Runner",
  agent_kit: "Agent Kit",
  prompt_pack: "Prompt Pack",
  template: "Template",
  course: "Curso",
  guide: "Guia",
  other: "Outro",
};

function formatEur(cents: number): string {
  return `\u20AC${(cents / 100).toFixed(2).replace(".", ",")}`;
}

function formatDatePT(date: Date): string {
  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session?.user) {
    return new Response("Autenticação necessária", { status: 401 });
  }

  const { id } = await params;

  const sellers = alias(users, "seller");

  const [purchase] = await db
    .select({
      id: storePurchases.id,
      pricePaidCents: storePurchases.pricePaidCents,
      stripePaymentId: storePurchases.stripePaymentId,
      createdAt: storePurchases.createdAt,
      buyerId: storePurchases.buyerId,
      productTitle: storeProducts.title,
      productType: storeProducts.productType,
      productPriceCents: storeProducts.priceCents,
      buyerName: users.displayName,
      buyerDiscordName: users.discordUsername,
      buyerEmail: users.email,
      sellerName: sellers.displayName,
      sellerDiscordName: sellers.discordUsername,
    })
    .from(storePurchases)
    .innerJoin(storeProducts, eq(storePurchases.productId, storeProducts.id))
    .innerJoin(users, eq(storePurchases.buyerId, users.id))
    .innerJoin(sellers, eq(storeProducts.sellerId, sellers.id))
    .where(and(eq(storePurchases.id, id)))
    .limit(1);

  if (!purchase) {
    return new Response("Compra não encontrada", { status: 404 });
  }

  if (purchase.buyerId !== session.user.id) {
    return new Response("Acesso negado", { status: 403 });
  }

  const buyerDisplay = escapeHtml(purchase.buyerName ?? purchase.buyerDiscordName ?? "—");
  const sellerDisplay = escapeHtml(purchase.sellerName ?? purchase.sellerDiscordName ?? "—");
  const typeLabel = PRODUCT_TYPE_LABELS[purchase.productType] ?? purchase.productType;

  const html = `<!DOCTYPE html>
<html lang="pt-PT">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Fatura — ${escapeHtml(purchase.productTitle)} | VibeTuga</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif;
      background: #0a0a0a;
      color: #ffffff;
      padding: 40px 20px;
    }
    .invoice {
      max-width: 700px;
      margin: 0 auto;
      background: #111111;
      border: 1px solid rgba(255,255,255,0.05);
    }
    .header {
      padding: 40px 48px 32px;
      border-bottom: 2px solid #a1ffc2;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .brand {
      font-family: monospace;
      font-size: 11px;
      color: #a1ffc2;
      text-transform: uppercase;
      letter-spacing: 3px;
    }
    .invoice-title {
      font-size: 28px;
      font-weight: 900;
      margin-top: 8px;
      letter-spacing: -0.02em;
    }
    .invoice-number {
      font-family: monospace;
      font-size: 11px;
      color: rgba(255,255,255,0.3);
      text-align: right;
    }
    .body { padding: 32px 48px; }
    .parties {
      display: flex;
      gap: 40px;
      margin-bottom: 32px;
    }
    .party { flex: 1; }
    .party-label {
      font-family: monospace;
      font-size: 10px;
      color: rgba(255,255,255,0.3);
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 8px;
    }
    .party-name {
      font-size: 15px;
      font-weight: 700;
      color: #ffffff;
    }
    .party-email {
      font-size: 12px;
      color: rgba(255,255,255,0.4);
      margin-top: 4px;
    }
    .line-items {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
    }
    .line-items th {
      font-family: monospace;
      font-size: 10px;
      color: rgba(255,255,255,0.3);
      text-transform: uppercase;
      letter-spacing: 2px;
      text-align: left;
      padding: 12px 0;
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    .line-items th:last-child { text-align: right; }
    .line-items td {
      padding: 16px 0;
      border-bottom: 1px solid rgba(255,255,255,0.05);
      font-size: 14px;
    }
    .line-items td:last-child {
      text-align: right;
      font-family: monospace;
    }
    .product-name { font-weight: 700; }
    .product-type {
      display: inline-block;
      font-family: monospace;
      font-size: 10px;
      background: rgba(255,255,255,0.05);
      color: rgba(255,255,255,0.4);
      padding: 2px 8px;
      margin-left: 8px;
    }
    .totals {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 32px;
    }
    .totals-table { width: 240px; }
    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 13px;
      color: rgba(255,255,255,0.5);
    }
    .totals-row.total {
      border-top: 2px solid #a1ffc2;
      padding-top: 12px;
      margin-top: 4px;
      font-size: 18px;
      font-weight: 900;
      color: #a1ffc2;
    }
    .totals-row.total span:last-child { font-family: monospace; }
    .meta {
      font-size: 12px;
      color: rgba(255,255,255,0.3);
      font-family: monospace;
    }
    .meta span { margin-right: 24px; }
    .footer {
      padding: 24px 48px;
      border-top: 1px solid rgba(255,255,255,0.05);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .footer-text {
      font-size: 11px;
      color: rgba(255,255,255,0.2);
      font-family: monospace;
    }
    .print-btn {
      display: inline-block;
      background: #a1ffc2;
      color: #0a0a0a;
      font-weight: 900;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 2px;
      padding: 10px 24px;
      border: none;
      cursor: pointer;
    }
    .print-btn:hover { opacity: 0.9; }

    @media print {
      body { background: #fff; color: #000; padding: 0; }
      .invoice { border: none; background: #fff; }
      .header { border-bottom-color: #000; }
      .brand { color: #000; }
      .invoice-title { color: #000; }
      .invoice-number { color: #666; }
      .party-label { color: #666; }
      .party-name { color: #000; }
      .party-email { color: #666; }
      .line-items th { color: #666; border-bottom-color: #ddd; }
      .line-items td { border-bottom-color: #eee; color: #000; }
      .product-type { background: #f0f0f0; color: #666; }
      .totals-row { color: #666; }
      .totals-row.total { border-top-color: #000; color: #000; }
      .meta { color: #666; }
      .footer { border-top-color: #eee; }
      .footer-text { color: #999; }
      .print-btn { display: none; }
    }
  </style>
</head>
<body>
  <div class="invoice">
    <div class="header">
      <div>
        <p class="brand">VibeTuga</p>
        <h1 class="invoice-title">Fatura</h1>
      </div>
      <div class="invoice-number">
        <p>#${escapeHtml(purchase.id.slice(0, 8).toUpperCase())}</p>
        <p style="margin-top:4px;">${escapeHtml(formatDatePT(purchase.createdAt))}</p>
      </div>
    </div>
    <div class="body">
      <div class="parties">
        <div class="party">
          <p class="party-label">Comprador</p>
          <p class="party-name">${buyerDisplay}</p>
          ${purchase.buyerEmail ? `<p class="party-email">${escapeHtml(purchase.buyerEmail)}</p>` : ""}
        </div>
        <div class="party">
          <p class="party-label">Vendedor</p>
          <p class="party-name">${sellerDisplay}</p>
        </div>
      </div>
      <table class="line-items">
        <thead>
          <tr>
            <th>Produto</th>
            <th>Valor</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <span class="product-name">${escapeHtml(purchase.productTitle)}</span>
              <span class="product-type">${escapeHtml(typeLabel)}</span>
            </td>
            <td>${formatEur(purchase.pricePaidCents)}</td>
          </tr>
        </tbody>
      </table>
      <div class="totals">
        <div class="totals-table">
          <div class="totals-row total">
            <span>Total</span>
            <span>${formatEur(purchase.pricePaidCents)}</span>
          </div>
        </div>
      </div>
      <div class="meta">
        ${purchase.stripePaymentId ? `<span>Ref: ${escapeHtml(purchase.stripePaymentId)}</span>` : ""}
      </div>
    </div>
    <div class="footer">
      <span class="footer-text">vibetuga.com</span>
      <button class="print-btn" onclick="window.print()">Imprimir</button>
    </div>
  </div>
</body>
</html>`;

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

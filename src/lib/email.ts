import { Resend } from "resend";
import { db } from "@/lib/db";
import { newsletterCampaigns, newsletterSubscribers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const apiKey = process.env.RESEND_API_KEY;

if (!apiKey && process.env.NODE_ENV === "production") {
  throw new Error("RESEND_API_KEY is required in production");
}

const resend = new Resend(apiKey ?? "re_placeholder");

const FROM_ADDRESS = process.env.EMAIL_FROM || "VibeTuga <noreply@vibetuga.com>";

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string | string[];
  subject: string;
  html: string;
}) {
  return resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject,
    html,
  });
}

export async function sendWelcomeEmail(email: string) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Inter,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#111111;max-width:600px;width:100%;">
          <tr>
            <td style="padding:40px 48px 32px;border-bottom:2px solid #a1ffc2;">
              <p style="margin:0;font-size:11px;font-family:monospace;color:#a1ffc2;text-transform:uppercase;letter-spacing:3px;">VibeTuga</p>
              <h1 style="margin:16px 0 0;font-size:28px;font-weight:900;color:#ffffff;line-height:1.2;">
                Bem-vindo à newsletter! 🎉
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 48px;">
              <p style="margin:0 0 20px;font-size:15px;color:#ffffff99;line-height:1.6;">
                A tua subscrição à newsletter VibeTuga foi confirmada com sucesso.
              </p>
              <p style="margin:0 0 20px;font-size:15px;color:#ffffff99;line-height:1.6;">
                Vais receber as últimas novidades sobre <strong style="color:#a1ffc2;">vibe coding</strong>, ferramentas de IA, tutoriais, e muito mais da comunidade portuguesa de desenvolvimento.
              </p>
              <p style="margin:0 0 32px;font-size:15px;color:#ffffff99;line-height:1.6;">
                Até breve! 🚀
              </p>
              <a href="https://vibetuga.com" style="display:inline-block;background:#a1ffc2;color:#0a0a0a;font-weight:900;font-size:12px;text-transform:uppercase;letter-spacing:2px;padding:14px 32px;text-decoration:none;">
                Visitar VibeTuga
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 48px;border-top:1px solid #ffffff10;">
              <p style="margin:0;font-size:11px;color:#ffffff33;font-family:monospace;">
                Recebeste este email porque te subscreveste em vibetuga.com.
                <br />Não queres receber mais emails? <a href="https://vibetuga.com/newsletter/unsubscribe" style="color:#a1ffc220;text-decoration:none;">Cancelar subscrição</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  return sendEmail({
    to: email,
    subject: "Bem-vindo à newsletter VibeTuga!",
    html,
  });
}

// ─── Digest Email ────────────────────────────────────────────

type DigestPost = {
  title: string;
  slug: string;
  categoryName: string | null;
  readingTimeMinutes: number;
};

type DigestProject = {
  title: string;
  slug: string;
  techStack: string[] | null;
};

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildDigestHtml(posts: DigestPost[], projects: DigestProject[]): string {
  const postsRows = posts
    .map(
      (post) =>
        `<tr>
          <td style="padding:14px 0;border-bottom:1px solid #ffffff0d;">
            <a href="https://vibetuga.com/blog/${escapeHtml(post.slug)}" style="color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;display:block;margin-bottom:4px;line-height:1.3;">${escapeHtml(post.title)}</a>
            <span style="font-size:11px;color:#a1ffc2;font-family:monospace;text-transform:uppercase;letter-spacing:1px;">${escapeHtml(post.categoryName ?? "Blog")}</span>
            <span style="font-size:11px;color:#ffffff44;margin-left:10px;">${post.readingTimeMinutes} min de leitura</span>
          </td>
        </tr>`,
    )
    .join("");

  const projectRows = projects
    .map((project) => {
      const techTags = (project.techStack ?? [])
        .slice(0, 5)
        .map(
          (t) =>
            `<span style="display:inline-block;background:#1a1a1a;color:#a1ffc2;border:1px solid #a1ffc220;font-size:10px;font-family:monospace;padding:2px 8px;margin-right:4px;margin-bottom:4px;">${escapeHtml(t)}</span>`,
        )
        .join("");
      return `<tr>
          <td style="padding:14px 0;border-bottom:1px solid #ffffff0d;">
            <a href="https://vibetuga.com/showcase/${escapeHtml(project.slug)}" style="color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;display:block;margin-bottom:8px;line-height:1.3;">${escapeHtml(project.title)}</a>
            <div>${techTags}</div>
          </td>
        </tr>`;
    })
    .join("");

  const postsSection =
    posts.length > 0
      ? `<tr>
          <td style="padding:32px 48px 0;">
            <p style="margin:0 0 16px;font-size:11px;font-family:monospace;color:#a1ffc2;text-transform:uppercase;letter-spacing:2px;">Posts da Semana</p>
            <table width="100%" cellpadding="0" cellspacing="0">${postsRows}</table>
          </td>
        </tr>`
      : "";

  const projectsSection =
    projects.length > 0
      ? `<tr>
          <td style="padding:32px 48px 0;">
            <p style="margin:0 0 16px;font-size:11px;font-family:monospace;color:#a1ffc2;text-transform:uppercase;letter-spacing:2px;">Projetos em Destaque</p>
            <table width="100%" cellpadding="0" cellspacing="0">${projectRows}</table>
          </td>
        </tr>`
      : "";

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Inter,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#111111;max-width:600px;width:100%;">
          <tr>
            <td style="padding:40px 48px 32px;border-bottom:2px solid #a1ffc2;">
              <p style="margin:0;font-size:11px;font-family:monospace;color:#a1ffc2;text-transform:uppercase;letter-spacing:3px;">VibeTuga</p>
              <h1 style="margin:16px 0 0;font-size:28px;font-weight:900;color:#ffffff;line-height:1.2;">Resumo Semanal VibeTuga</h1>
            </td>
          </tr>
          ${postsSection}
          ${projectsSection}
          <tr>
            <td style="padding:32px 48px;">
              <a href="https://vibetuga.com" style="display:inline-block;background:#a1ffc2;color:#0a0a0a;font-weight:900;font-size:12px;text-transform:uppercase;letter-spacing:2px;padding:14px 32px;text-decoration:none;">Ver Mais em VibeTuga</a>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 48px;border-top:1px solid #ffffff10;">
              <p style="margin:0;font-size:11px;color:#ffffff33;font-family:monospace;">
                Recebeste este email porque te subscreveste em vibetuga.com.<br />Não queres receber mais emails? <a href="https://vibetuga.com/newsletter/unsubscribe" style="color:#a1ffc220;text-decoration:none;">Cancelar subscrição</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendDigestEmail(email: string, html: string) {
  return sendEmail({
    to: email,
    subject: "Resumo Semanal — VibeTuga",
    html,
  });
}

// ─── Purchase Receipt Email ───────────────────────────────────

type PurchaseReceiptData = {
  productTitle: string;
  productType: string;
  sellerName: string;
  priceCents: number;
  purchaseDate: Date;
  downloadKey?: string | null;
};

const PRODUCT_TYPE_LABELS_PT: Record<string, string> = {
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
  return `€${(cents / 100).toFixed(2).replace(".", ",")}`;
}

function formatDatePT(date: Date): string {
  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export async function sendPurchaseReceiptEmail(email: string, data: PurchaseReceiptData) {
  const typeLabel = PRODUCT_TYPE_LABELS_PT[data.productType] ?? data.productType;
  const downloadSection = data.downloadKey
    ? `<tr>
        <td style="padding:24px 0 0;">
          <a href="https://vibetuga.com/api/upload/${escapeHtml(data.downloadKey)}" style="display:inline-block;background:#a1ffc2;color:#0a0a0a;font-weight:900;font-size:12px;text-transform:uppercase;letter-spacing:2px;padding:14px 32px;text-decoration:none;">
            Descarregar Produto
          </a>
        </td>
      </tr>`
    : "";

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Inter,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#111111;max-width:600px;width:100%;">
          <tr>
            <td style="padding:40px 48px 32px;border-bottom:2px solid #a1ffc2;">
              <p style="margin:0;font-size:11px;font-family:monospace;color:#a1ffc2;text-transform:uppercase;letter-spacing:3px;">VibeTuga</p>
              <h1 style="margin:16px 0 0;font-size:28px;font-weight:900;color:#ffffff;line-height:1.2;">
                Recibo de Compra
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 48px;">
              <p style="margin:0 0 20px;font-size:15px;color:#ffffff99;line-height:1.6;">
                A tua compra foi processada com sucesso. Aqui estão os detalhes:
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid #ffffff0d;">
                    <span style="font-size:11px;font-family:monospace;color:#ffffff44;text-transform:uppercase;letter-spacing:1px;">Produto</span>
                    <p style="margin:6px 0 0;font-size:16px;font-weight:700;color:#ffffff;">${escapeHtml(data.productTitle)}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid #ffffff0d;">
                    <span style="font-size:11px;font-family:monospace;color:#ffffff44;text-transform:uppercase;letter-spacing:1px;">Tipo</span>
                    <p style="margin:6px 0 0;font-size:14px;color:#a1ffc2;">${escapeHtml(typeLabel)}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid #ffffff0d;">
                    <span style="font-size:11px;font-family:monospace;color:#ffffff44;text-transform:uppercase;letter-spacing:1px;">Vendedor</span>
                    <p style="margin:6px 0 0;font-size:14px;color:#ffffff99;">${escapeHtml(data.sellerName)}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid #ffffff0d;">
                    <span style="font-size:11px;font-family:monospace;color:#ffffff44;text-transform:uppercase;letter-spacing:1px;">Preço</span>
                    <p style="margin:6px 0 0;font-size:20px;font-weight:900;color:#a1ffc2;">${formatEur(data.priceCents)}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 0;">
                    <span style="font-size:11px;font-family:monospace;color:#ffffff44;text-transform:uppercase;letter-spacing:1px;">Data</span>
                    <p style="margin:6px 0 0;font-size:14px;color:#ffffff99;">${escapeHtml(formatDatePT(data.purchaseDate))}</p>
                  </td>
                </tr>
              </table>
              ${downloadSection}
            </td>
          </tr>
          <tr>
            <td style="padding:24px 48px;border-top:1px solid #ffffff10;">
              <p style="margin:0;font-size:11px;color:#ffffff33;font-family:monospace;">
                Este email serve como recibo da tua compra em vibetuga.com.
                <br />Questões? Contacta-nos no <a href="https://discord.vibetuga.com" style="color:#a1ffc220;text-decoration:none;">Discord</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return sendEmail({
    to: email,
    subject: `VibeTuga — Recibo de Compra: ${data.productTitle}`,
    html,
  });
}

// ─── Campaign Send ────────────────────────────────────────────

export async function sendCampaign(campaignId: string) {
  // Fetch campaign and verify it exists + is in a sendable state
  const [campaign] = await db
    .select()
    .from(newsletterCampaigns)
    .where(eq(newsletterCampaigns.id, campaignId))
    .limit(1);

  if (!campaign) {
    throw new Error(`Campaign ${campaignId} not found`);
  }

  if (campaign.status !== "draft" && campaign.status !== "scheduled") {
    throw new Error(
      `Campaign ${campaignId} has status '${campaign.status}' — only draft or scheduled can be sent`,
    );
  }

  // Mark as sending
  await db
    .update(newsletterCampaigns)
    .set({ status: "sending" })
    .where(eq(newsletterCampaigns.id, campaignId));

  // Fetch all active subscribers
  const subscribers = await db
    .select({ email: newsletterSubscribers.email })
    .from(newsletterSubscribers)
    .where(eq(newsletterSubscribers.status, "active"));

  if (subscribers.length === 0) {
    await db
      .update(newsletterCampaigns)
      .set({ status: "sent", sentAt: new Date(), sentCount: 0 })
      .where(eq(newsletterCampaigns.id, campaignId));
    return { sent: 0 };
  }

  // Send in chunks of 50 using Resend batch API
  const CHUNK_SIZE = 50;
  let sentCount = 0;

  for (let i = 0; i < subscribers.length; i += CHUNK_SIZE) {
    const chunk = subscribers.slice(i, i + CHUNK_SIZE);
    const emails = chunk.map((s) => ({
      from: FROM_ADDRESS,
      to: s.email,
      subject: campaign.subject,
      html: campaign.content,
    }));

    try {
      await resend.batch.send(emails);
      sentCount += chunk.length;
    } catch (err) {
      console.error(`Error sending batch ${i / CHUNK_SIZE + 1}:`, err);
    }
  }

  // Update campaign as sent
  await db
    .update(newsletterCampaigns)
    .set({ status: "sent", sentAt: new Date(), sentCount })
    .where(eq(newsletterCampaigns.id, campaignId));

  return { sent: sentCount };
}

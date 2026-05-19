import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const ADMIN_EMAIL =
  process.env.ADMIN_NOTIFICATION_EMAIL || "admin@rongta.ma";

export async function sendResellerNotification(data: {
  companyName: string;
  phone: string;
  email: string | null;
  notes: string | null;
}) {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not set, skipping notification");
    return;
  }

  try {
    const { data: result, error } = await resend.emails.send({
      from: "Rongta Admin <onboarding@resend.dev>",
      to: [ADMIN_EMAIL],
      subject: `🤝 Nouvelle demande revendeur : ${data.companyName}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto;">
          <div style="background: #FF6400; padding: 24px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; font-size: 20px; margin: 0;">
              Nouvelle demande de partenariat
            </h1>
          </div>
          
          <div style="background: #ffffff; border: 1px solid #e5e7eb; border-top: none; padding: 24px; border-radius: 0 0 12px 12px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; color: #6b7280; font-size: 14px; width: 120px; vertical-align: top;">Société</td>
                <td style="padding: 10px 0; font-size: 14px; font-weight: 600;">${data.companyName}</td>
              </tr>
              <tr style="border-top: 1px solid #f3f4f6;">
                <td style="padding: 10px 0; color: #6b7280; font-size: 14px; vertical-align: top;">Téléphone</td>
                <td style="padding: 10px 0; font-size: 14px;">
                  <a href="tel:${data.phone}" style="color: #FF6400; text-decoration: none;">${data.phone}</a>
                </td>
              </tr>
              ${data.email ? `
              <tr style="border-top: 1px solid #f3f4f6;">
                <td style="padding: 10px 0; color: #6b7280; font-size: 14px; vertical-align: top;">Email</td>
                <td style="padding: 10px 0; font-size: 14px;">
                  <a href="mailto:${data.email}" style="color: #FF6400; text-decoration: none;">${data.email}</a>
                </td>
              </tr>` : ""}
              ${data.notes ? `
              <tr style="border-top: 1px solid #f3f4f6;">
                <td style="padding: 10px 0; color: #6b7280; font-size: 14px; vertical-align: top;">Message</td>
                <td style="padding: 10px 0; font-size: 14px; color: #374151;">${data.notes}</td>
              </tr>` : ""}
            </table>

            <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #f3f4f6; text-align: center;">
              <a href="${process.env.AUTH_URL || "https://admin-rongtama.netlify.app"}/resellers"
                 style="display: inline-block; background: #FF6400; color: white; padding: 10px 24px; border-radius: 8px; font-size: 14px; font-weight: 600; text-decoration: none;">
                Voir dans le dashboard
              </a>
            </div>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("[email] Resend error:", error);
      return;
    }

    console.log(`[email] Notification sent: ${result?.id}`);
  } catch (error) {
    console.error("[email] Failed to send:", error);
  }
}
import nodemailer from "nodemailer";

/**
 * Email delivery service for Togather.
 * Supports Gmail SMTP (nodemailer) and Resend API, with automatic graceful local fallback for development.
 */

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export type EmailTemplateType = "EMAIL_VERIFICATION" | "PASSWORD_RESET" | "LOGIN_OTP";

export interface SendVerificationCodeEmailOptions {
  to: string;
  code: string;
  type: EmailTemplateType;
  expiresInMinutes?: number;
}

let cachedTransporter: nodemailer.Transporter | null = null;

function getSmtpTransporter() {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD || process.env.SMTP_PASS;

  if (!user || !pass) return null;

  if (!cachedTransporter) {
    const host = process.env.SMTP_HOST || "smtp.gmail.com";
    const port = Number(process.env.SMTP_PORT) || 465;
    const secure = port === 465;

    cachedTransporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
    });
  }

  return cachedTransporter;
}

/**
 * Send an email using configured provider or fallback simulator.
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
}: SendEmailOptions): Promise<{ success: boolean; simulated: boolean; error?: string }> {
  // 1. Prioritas 1: Gmail / SMTP (Nodemailer)
  const transporter = getSmtpTransporter();
  if (transporter) {
    try {
      const fromEmail = process.env.EMAIL_FROM || `Togather <${process.env.SMTP_USER}>`;
      await transporter.sendMail({
        from: fromEmail,
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, ""),
      });

      return { success: true, simulated: false };
    } catch (err) {
      console.error("[Email SMTP Error]:", err);
      return { success: false, simulated: false, error: String(err) };
    }
  }

  // 2. Prioritas 2: Resend API
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    const fromEmail = process.env.EMAIL_FROM || "Togather <onboarding@resend.dev>";
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [to],
          subject,
          html,
          text: text || html.replace(/<[^>]*>/g, ""),
        }),
      });

      if (!response.ok) {
        const errData = await response.text();
        console.error("[Email] Resend API error:", errData);
        return { success: false, simulated: false, error: errData };
      }

      return { success: true, simulated: false };
    } catch (err) {
      console.error("[Email] Network or sending error:", err);
      return { success: false, simulated: false, error: String(err) };
    }
  }

  // 3. Fallback: Development Simulation (Logs to console)
  console.log("=================================================");
  console.log(`[EMAIL DISPATCH - DEV SIMULATION]`);
  console.log(`To:      ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body:\n${text || html.replace(/<[^>]*>/g, " ").trim()}`);
  console.log("=================================================");

  return { success: true, simulated: true };
}

/**
 * Formats and sends a secure 6-digit verification code email.
 */
export async function sendVerificationCodeEmail({
  to,
  code,
  type,
  expiresInMinutes = 10,
}: SendVerificationCodeEmailOptions) {
  let subject = "Kode Verifikasi Togather";
  let title = "Verifikasi Akun Anda";
  let explanation = "Gunakan kode verifikasi berikut untuk mengonfirmasi alamat email Anda.";

  if (type === "PASSWORD_RESET") {
    subject = "Reset Kata Sandi Akun Togather";
    title = "Permintaan Reset Kata Sandi";
    explanation = "Kami menerima permintaan untuk mereset kata sandi akun Togather Anda. Masukkan kode berikut:";
  } else if (type === "LOGIN_OTP") {
    subject = "Kode Otentikasi Masuk Togather";
    title = "Kode Verifikasi Masuk (OTP)";
    explanation = "Masukkan kode keamanan berikut untuk menyelesaikan proses masuk ke akun Anda:";
  }

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #E5E7EB; border-radius: 12px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #7960D7; margin: 0; font-size: 26px; font-weight: 700;">Togather</h1>
      </div>
      <div style="color: #1F2937; font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
        <h2 style="font-size: 20px; font-weight: 600; margin-bottom: 12px; color: #111827;">${title}</h2>
        <p style="margin: 0 0 16px 0; color: #4B5563;">${explanation}</p>
        <div style="text-align: center; margin: 32px 0;">
          <span style="display: inline-block; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #7960D7; background-color: #F3F0FC; padding: 14px 28px; border-radius: 10px; border: 1px dashed #7960D7;">
            ${code}
          </span>
        </div>
        <p style="font-size: 14px; color: #6B7280; margin: 0 0 8px 0;">
          * Kode ini berlaku selama <strong>${expiresInMinutes} menit</strong>.
        </p>
        <p style="font-size: 14px; color: #6B7280; margin: 0;">
          Jika Anda tidak merasa melakukan permintaan ini, silakan abaikan email ini atau amankan akun Anda.
        </p>
      </div>
      <div style="border-top: 1px solid #E5E7EB; padding-top: 16px; text-align: center; font-size: 12px; color: #9CA3AF;">
        &copy; ${new Date().getFullYear()} Togather. Komunitas & Event Terpercaya.
      </div>
    </div>
  `;

  const text = `
Togather - ${title}

${explanation}

KODE ANDA: ${code}

Kode ini berlaku selama ${expiresInMinutes} menit.
Jika Anda tidak meminta kode ini, abaikan pesan ini.
  `.trim();

  return await sendEmail({ to, subject, html, text });
}

/**
 * Sends a security notification email when a user's password has been successfully changed.
 */
export async function sendPasswordChangedNotificationEmail({
  to,
  changedAt = new Date(),
}: {
  to: string;
  changedAt?: Date;
}) {
  const formattedTime = new Intl.DateTimeFormat("id-ID", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(changedAt);

  const subject = "Keamanan Togather: Kata Sandi Anda Berhasil Diubah";
  const title = "Pemberitahuan Perubahan Kata Sandi";

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #E5E7EB; border-radius: 12px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #7960D7; margin: 0; font-size: 26px; font-weight: 700;">Togather</h1>
      </div>
      <div style="color: #1F2937; font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
        <h2 style="font-size: 20px; font-weight: 600; margin-bottom: 12px; color: #111827;">${title}</h2>
        <p style="margin: 0 0 16px 0; color: #4B5563;">
          Kata sandi untuk akun Togather Anda (<strong>${to}</strong>) baru saja berhasil diubah pada:
        </p>
        <div style="background-color: #F9FAFB; padding: 12px 16px; border-radius: 8px; border-left: 4px solid #7960D7; margin: 16px 0; font-size: 14px; color: #374151;">
          <strong>Waktu:</strong> ${formattedTime} WIB
        </div>
        <p style="font-size: 14px; color: #6B7280; margin: 16px 0 8px 0;">
          Semua sesi login aktif lainnya telah dinonaktifkan demi menjaga keamanan akun Anda.
        </p>
        <div style="background-color: #FEF2F2; border: 1px solid #FEE2E2; border-radius: 8px; padding: 12px 16px; margin: 20px 0;">
          <p style="font-size: 13px; color: #991B1B; margin: 0;">
            <strong>Bukan Anda yang melakukan perubahan ini?</strong><br />
            Segera hubungi tim dukungan kami atau lakukan reset kata sandi menggunakan fitur <em>Lupa Kata Sandi</em>.
          </p>
        </div>
      </div>
      <div style="border-top: 1px solid #E5E7EB; padding-top: 16px; text-align: center; font-size: 12px; color: #9CA3AF;">
        &copy; ${new Date().getFullYear()} Togather. Komunitas & Event Terpercaya.
      </div>
    </div>
  `;

  const text = `
Togather - ${title}

Kata sandi akun Togather Anda (${to}) telah berhasil diubah pada: ${formattedTime} WIB.
Semua sesi aktif lainnya telah dinonaktifkan secara otomatis.

Jika ini bukan Anda, segera ambil tindakan pemulihan akun di web Togather.
  `.trim();

  return await sendEmail({ to, subject, html, text });
}

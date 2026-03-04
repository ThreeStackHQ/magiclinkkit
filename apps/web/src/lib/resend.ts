import { Resend } from "resend";

let _resend: Resend | null = null;

function getResend(): Resend {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error("RESEND_API_KEY environment variable is not set");
    _resend = new Resend(key);
  }
  return _resend;
}

export async function sendMagicLinkEmail(
  to: string,
  verifyUrl: string,
  workspaceName: string
): Promise<void> {
  const resend = getResend();
  await resend.emails.send({
    from: "MagicLinkKit <noreply@magiclinkkit.com>",
    to,
    subject: `Sign in to ${workspaceName}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #7c3aed; font-size: 24px; margin: 0;">MagicLinkKit</h1>
        </div>
        <p style="color: #374151; font-size: 16px; line-height: 1.5;">
          Click the button below to sign in to <strong>${workspaceName}</strong>.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${verifyUrl}" style="background-color: #7c3aed; color: #ffffff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">
            Sign In
          </a>
        </div>
        <p style="color: #6b7280; font-size: 14px; line-height: 1.5;">
          This link expires in 15 minutes. If you didn't request this, ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />
        <p style="color: #9ca3af; font-size: 12px; text-align: center;">
          Powered by MagicLinkKit
        </p>
      </div>
    `,
  });
}

export async function sendOtpEmail(
  to: string,
  code: string,
  workspaceName: string
): Promise<void> {
  const resend = getResend();
  await resend.emails.send({
    from: "MagicLinkKit <noreply@magiclinkkit.com>",
    to,
    subject: `Your code for ${workspaceName}: ${code}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #7c3aed; font-size: 24px; margin: 0;">MagicLinkKit</h1>
        </div>
        <p style="color: #374151; font-size: 16px; line-height: 1.5;">
          Your verification code for <strong>${workspaceName}</strong>:
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <span style="background-color: #f3f0ff; color: #7c3aed; padding: 16px 32px; border-radius: 8px; font-size: 32px; font-weight: 700; letter-spacing: 8px; display: inline-block;">
            ${code}
          </span>
        </div>
        <p style="color: #6b7280; font-size: 14px; line-height: 1.5;">
          This code expires in 10 minutes. If you didn't request this, ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />
        <p style="color: #9ca3af; font-size: 12px; text-align: center;">
          Powered by MagicLinkKit
        </p>
      </div>
    `,
  });
}

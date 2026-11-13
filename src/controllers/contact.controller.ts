import { Request, Response } from 'express';
import nodemailer from 'nodemailer';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export interface ContactMailInput {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

export interface ContactMailOptions {
  from: string;
  replyTo: string;
  to: string;
  subject: string;
  text: string;
  html: string;
}

/**
 * Build the outgoing contact email. Kept pure so the From/Reply-To contract can
 * be verified without opening an SMTP connection.
 */
export function buildContactMailOptions(
  input: ContactMailInput,
  env: Record<string, string | undefined> = process.env
): ContactMailOptions {
  // Prevent SMTP header injection via newlines in name/subject.
  const safeName = input.name.replace(/[\r\n]+/g, ' ').trim();
  const safeSubject = (input.subject || '').replace(/[\r\n]+/g, ' ').slice(0, 200);
  const senderAddress = env.EMAIL_USER || 'no-reply@localhost';

  return {
    // Gmail (and most SMTP providers) reject a From address that does not
    // belong to the authenticated mailbox. Send from the configured account
    // and put the visitor in Reply-To instead.
    from: `"SiteScanner Pro" <${senderAddress}>`,
    replyTo: `"${safeName}" <${input.email}>`,
    to: env.CONTACT_RECEIVER_EMAIL || 'bynrnworld@gmail.com',
    subject: `SiteScanner Pro Kontakt: ${safeSubject || 'Nytt meddelande'}`,
    text: `Namn: ${input.name}\nE-post: ${input.email}\n\nMeddelande:\n${input.message}`,
    html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee;">
            <h2 style="color: #0A0A0A; border-bottom: 2px solid #FF4E00; padding-bottom: 10px;">Nytt meddelande från SiteScanner Pro</h2>
            <p><strong style="color: #0A0A0A;">Namn:</strong> ${escapeHtml(input.name)}</p>
            <p><strong style="color: #0A0A0A;">E-post:</strong> <a href="mailto:${escapeHtml(input.email)}">${escapeHtml(input.email)}</a></p>
            <p><strong style="color: #0A0A0A;">Ämne:</strong> ${escapeHtml(safeSubject) || 'Ej angivet'}</p>
            <div style="margin-top: 20px; padding: 15px; background-color: #f9f9f9; border-left: 4px solid #0A0A0A;">
              <p style="white-space: pre-wrap; margin: 0;">${escapeHtml(input.message)}</p>
            </div>
          </div>
        `
  };
}

export class ContactController {
  public async sendEmail(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, subject, message } = req.body;

      if (!name || !email || !message || typeof name !== 'string' || typeof email !== 'string' || typeof message !== 'string') {
        res.status(400).json({ error: "Alla fält måste fyllas i." });
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        res.status(400).json({ error: "Ogiltig e-postadress." });
        return;
      }

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER || "din-email@gmail.com",
          pass: process.env.EMAIL_PASS || "ditt-app-lösenord",
        },
      });

      const mailOptions = buildContactMailOptions({
        name,
        email,
        subject: typeof subject === 'string' ? subject : undefined,
        message
      });

      await transporter.sendMail(mailOptions);
      res.status(200).json({ success: true, message: "Ditt meddelande har skickats!" });
    } catch (error: any) {
      console.error("Contact form error:", error);
      res.status(500).json({ error: "Kunde inte skicka meddelandet. Kontrollera e-postinställningarna på servern." });
    }
  }
}

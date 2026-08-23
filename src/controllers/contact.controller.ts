import { Request, Response } from 'express';
import nodemailer from 'nodemailer';

export class ContactController {
  public async sendEmail(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, subject, message } = req.body;

      if (!name || !email || !message) {
        res.status(400).json({ error: "Alla fält måste fyllas i." });
        return;
      }

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER || "din-email@gmail.com",
          pass: process.env.EMAIL_PASS || "ditt-app-lösenord",
        },
      });

      const mailOptions = {
        from: `"${name}" <${email}>`,
        to: process.env.CONTACT_RECEIVER_EMAIL || "bynrnworld@gmail.com",
        subject: `SiteScanner Pro Kontakt: ${subject || "Nytt meddelande"}`,
        text: `Namn: ${name}\nE-post: ${email}\n\nMeddelande:\n${message}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee;">
            <h2 style="color: #0A0A0A; border-bottom: 2px solid #FF4E00; padding-bottom: 10px;">Nytt meddelande från SiteScanner Pro</h2>
            <p><strong style="color: #0A0A0A;">Namn:</strong> ${name}</p>
            <p><strong style="color: #0A0A0A;">E-post:</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong style="color: #0A0A0A;">Ämne:</strong> ${subject || "Ej angivet"}</p>
            <div style="margin-top: 20px; padding: 15px; background-color: #f9f9f9; border-left: 4px solid #0A0A0A;">
              <p style="white-space: pre-wrap; margin: 0;">${message}</p>
            </div>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      res.status(200).json({ success: true, message: "Ditt meddelande har skickats!" });
    } catch (error: any) {
      console.error("Contact form error:", error);
      res.status(500).json({ error: "Kunde inte skicka meddelandet. Kontrollera e-postinställningarna på servern." });
    }
  }
}
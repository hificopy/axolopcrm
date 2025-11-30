import nodemailer from "nodemailer";
import { supabaseServer } from "../config/supabase-auth.js";

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: process.env.EMAIL_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendEmail({ to, subject, html, text }) {
    try {
      const mailOptions = {
        from: `"Axolop CRM" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
        text,
      };

      await this.transporter.sendMail(mailOptions);
      console.log("Email sent successfully to:", to);
      return { success: true };
    } catch (error) {
      console.error("Error sending email:", error);
      throw error;
    }
  }
}

export default new EmailService();

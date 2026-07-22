import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class SupportService {
  private transporter: nodemailer.Transporter | null = null;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('SMTP_HOST') || 'smtp.gmail.com';
    const port = Number(this.configService.get<string | number>('SMTP_PORT') || 587);
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');

    if (user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
    } else {
      console.warn('⚠️ SMTP credentials not found. Support emails will be printed to console instead.');
    }
  }

  async sendSupportEmail(userEmail: string, subject: string, message: string): Promise<void> {
    const destination = 'concilia.facil.ass@gmail.com';
    const mailOptions = {
      from: `"Soporte ConciliaFácil" <${this.configService.get<string>('SMTP_USER') || destination}>`,
      to: destination,
      replyTo: userEmail,
      subject: `[SOPORTE] ${subject}`,
      text: `Mensaje de soporte enviado por: ${userEmail}\n\nAsunto: ${subject}\n\nMensaje:\n${message}`,
      html: `
        <h3>Mensaje de Soporte Recibido</h3>
        <p><strong>De:</strong> ${userEmail}</p>
        <p><strong>Asunto:</strong> ${subject}</p>
        <p><strong>Mensaje:</strong></p>
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; font-family: sans-serif; white-space: pre-wrap;">${message}</div>
      `,
    };

    if (this.transporter) {
      try {
        await this.transporter.sendMail(mailOptions);
      } catch (error) {
        console.error('❌ Error sending support email:', error);
        throw new InternalServerErrorException('No se pudo enviar el correo de soporte. Inténtalo más tarde.');
      }
    } else {
      console.log('✉️ [MOCK SUPPORT MAIL SENT]');
      console.log('To:', destination);
      console.log('Reply-To:', userEmail);
      console.log('Subject:', mailOptions.subject);
      console.log('Body:', message);
    }
  }
}

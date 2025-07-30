interface EmailData {
  email: string;
  name?: string;
  language: 'es' | 'en';
}

export class EmailService {
  private async sendEmail(to: string, subject: string, htmlContent: string) {
    // For now, we'll use a simple console log
    // TODO: Integrate with SendGrid, Resend, or other email service
    console.log('📧 Email would be sent:', {
      to,
      subject,
      htmlContent: htmlContent.substring(0, 100) + '...'
    });
    
    // Example integration with SendGrid:
    // const sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    // await sgMail.send({
    //   to,
    //   from: 'noreply@uaylabs.com',
    //   subject,
    //   html: htmlContent,
    // });
  }

  async sendWelcomeEmail(data: EmailData) {
    const { email, name, language } = data;
    
    const isEnglish = language === 'en';
    
    const subject = isEnglish 
      ? 'Welcome to Ignium Waitlist! 🚀' 
      : '¡Bienvenido al Waitlist de Ignium! 🚀';
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ff6b35, #8a2be2); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; }
            .footer { background: #333; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: linear-gradient(135deg, #ff6b35, #8a2be2); color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .highlight { background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${isEnglish ? 'Welcome to Ignium!' : '¡Bienvenido a Ignium!'}</h1>
              <p>${isEnglish ? 'Your tactical copilot for solopreneurs' : 'Tu copiloto táctico para solopreneurs'}</p>
            </div>
            
            <div class="content">
              <p>${isEnglish ? 'Hi' : 'Hola'} ${name || 'there'},</p>
              
              <p>${isEnglish 
                ? 'Thank you for joining the Ignium waitlist! You\'re now part of an exclusive group of solopreneurs who will be the first to experience the power of a real tactical copilot.'
                : '¡Gracias por unirte al waitlist de Ignium! Ahora eres parte de un grupo exclusivo de solopreneurs que serán los primeros en experimentar el poder de un copiloto táctico real.'
              }</p>
              
              <div class="highlight">
                <h3>${isEnglish ? 'What happens next?' : '¿Qué sigue?'}</h3>
                <ul>
                  <li>${isEnglish ? 'We\'ll notify you when Ignium launches' : 'Te notificaremos cuando Ignium lance'}</li>
                  <li>${isEnglish ? 'Early access to new features' : 'Acceso temprano a nuevas funciones'}</li>
                  <li>${isEnglish ? 'Exclusive updates and insights' : 'Actualizaciones e insights exclusivos'}</li>
                </ul>
              </div>
              
              <p>${isEnglish 
                ? 'While you wait, follow us on social media to stay updated with our progress and get exclusive insights about building products from scratch.'
                : 'Mientras esperas, síguenos en redes sociales para mantenerte actualizado con nuestro progreso y obtener insights exclusivos sobre construir productos desde cero.'
              }</p>
              
              <div style="text-align: center;">
                <a href="https://uaylabs.web.app/ignium" class="button">
                  ${isEnglish ? 'Visit Ignium' : 'Visitar Ignium'}
                </a>
              </div>
            </div>
            
            <div class="footer">
              <p>© 2024 Ignium. Built by UayLabs.</p>
              <p>${isEnglish ? 'Questions? Reply to this email.' : '¿Preguntas? Responde a este email.'}</p>
            </div>
          </div>
        </body>
      </html>
    `;
    
    await this.sendEmail(email, subject, htmlContent);
  }

  async sendAdminNotification(data: EmailData) {
    const { email, name, language } = data;
    
    const subject = `🎉 New Ignium Waitlist Signup: ${email}`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>New Waitlist Signup</title>
        </head>
        <body>
          <h2>New Ignium Waitlist Signup</h2>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Name:</strong> ${name || 'Not provided'}</p>
          <p><strong>Language:</strong> ${language}</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <p><strong>Source:</strong> ignium-landing</p>
        </body>
      </html>
    `;
    
    // Send to admin email (configure this)
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@uaylabs.com';
    await this.sendEmail(adminEmail, subject, htmlContent);
  }
} 
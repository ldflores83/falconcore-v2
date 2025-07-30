import type { NextApiRequest, NextApiResponse } from 'next';
import { waitlistCollection } from '../../lib/firebase-admin';
import { EmailService } from '../../lib/email-service';

type Data = {
  success: boolean;
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { email, name, language = 'es' } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }

    // Check if email already exists
    try {
      const existingUser = await waitlistCollection
        .where('email', '==', email)
        .limit(1)
        .get();

      if (!existingUser.empty) {
        return res.status(200).json({ 
          success: true, 
          message: language === 'en' 
            ? 'You\'re already on the waitlist! We\'ll notify you when Ignium is ready.' 
            : '¡Ya estás en el waitlist! Te notificaremos cuando Ignium esté listo.'
        });
      }
    } catch (firebaseError) {
      console.error('❌ Firebase connection error:', firebaseError);
      return res.status(500).json({ 
        success: false, 
        message: language === 'en' 
          ? 'Database connection error. Please try again later.' 
          : 'Error de conexión con la base de datos. Inténtalo más tarde.'
      });
    }

    // Prepare waitlist data
    const waitlistData = {
      email,
      name: name || '',
      language,
      timestamp: new Date().toISOString(),
      source: 'ignium-landing',
      status: 'pending',
      ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Save to Firebase
    try {
      const docRef = await waitlistCollection.add(waitlistData);
      console.log('✅ Waitlist signup saved to Firebase:', { id: docRef.id, email });
    } catch (firebaseError) {
      console.error('❌ Error saving to Firebase:', firebaseError);
      return res.status(500).json({ 
        success: false, 
        message: language === 'en' 
          ? 'Error saving data. Please try again.' 
          : 'Error al guardar los datos. Inténtalo de nuevo.'
      });
    }

    // Send welcome email
    const emailService = new EmailService();
    try {
      await emailService.sendWelcomeEmail({ email, name, language });
      console.log('✅ Welcome email sent to:', email);
    } catch (emailError) {
      console.error('❌ Error sending welcome email:', emailError);
      // Don't fail the request if email fails
    }

    // Send admin notification
    try {
      await emailService.sendAdminNotification({ email, name, language });
      console.log('✅ Admin notification sent');
    } catch (adminEmailError) {
      console.error('❌ Error sending admin notification:', adminEmailError);
      // Don't fail the request if admin email fails
    }

    return res.status(200).json({ 
      success: true, 
      message: language === 'en' 
        ? 'Successfully joined the waitlist! Check your email for confirmation.' 
        : '¡Te has unido exitosamente al waitlist! Revisa tu email para confirmación.'
    });

  } catch (error) {
    console.error('❌ Waitlist error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error. Please try again.' 
    });
  }
} 
import { onRequest } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();

// Simple in-memory rate limiting
// Resets on function cold start (acceptable for MVP)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT = {
  maxRequests: 5,
  windowMs: 60 * 60 * 1000, // 1 hour
};

function checkRateLimit(ip: string): { allowed: boolean; resetIn?: number } {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT.windowMs,
    });
    return { allowed: true };
  }

  if (record.count >= RATE_LIMIT.maxRequests) {
    const resetIn = Math.ceil((record.resetTime - now) / 1000 / 60);
    return { allowed: false, resetIn };
  }

  record.count++;
  return { allowed: true };
}

export const addToWaitlist = onRequest(
  {
    cors: [
      'https://pulzio.web.app',
      'http://localhost:3000',
    ],
    maxInstances: 10,
    region: 'us-central1',
  },
  async (req, res) => {
    try {
      // Get IP
      const ip = req.headers['x-forwarded-for'] || 
                 req.headers['x-real-ip'] || 
                 req.ip || 
                 'unknown';

      // Rate limit check
      const rateLimitCheck = checkRateLimit(ip as string);
      if (!rateLimitCheck.allowed) {
        res.status(429).json({
          success: false,
          message: `Too many requests. Please try again in ${rateLimitCheck.resetIn} minutes.`,
        });
        return;
      }

      const { email, source = 'landing-cta', honeypot } = req.body as { email?: string; source?: string; honeypot?: string };

      // Honeypot check (bot detection)
      if (honeypot) {
        console.log('Bot detected via honeypot:', ip);
        // Return success to not alert the bot
        res.json({ success: true, message: 'Thank you for joining!' });
        return;
      }

      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        res.status(400).json({
          success: false,
          message: 'Please enter a valid email address.',
        });
        return;
      }

      // Check for duplicate
      const waitlistRef = db.collection('waitlist');
      const existingQuery = await waitlistRef
        .where('email', '==', email.toLowerCase())
        .limit(1)
        .get();

      if (!existingQuery.empty) {
        res.json({
          success: false,
          message: "You're already on the waitlist! We'll notify you when we launch.",
        });
        return;
      }

      // Add to waitlist
      await waitlistRef.add({
        email: email.toLowerCase(),
        source,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        metadata: {
          userAgent: req.headers['user-agent'] || undefined,
          referer: req.headers['referer'] || undefined,
          ip: ip !== 'unknown' ? ip : undefined,
        },
      });

      res.json({
        success: true,
        message: "Thank you for joining the Beta waitlist! We'll notify you in Q1 2026.",
      });

    } catch (error) {
      console.error('Waitlist error:', error);
      res.status(500).json({
        success: false,
        message: 'Something went wrong. Please try again later.',
      });
    }
  }
);



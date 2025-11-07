// Waitlist service for saving emails to Firestore
import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { db } from "./firebase";

export interface WaitlistEntry {
  email: string;
  source: string;
  createdAt: Date;
  metadata?: {
    userAgent?: string;
    referrer?: string;
  };
}

/**
 * Add an email to the waitlist
 * @param email - User's email address
 * @param source - Source of the signup (e.g., "landing-cta", "footer", etc.)
 * @returns Success status and message
 */
export async function addToWaitlist(
  email: string,
  source: string = "landing-cta"
): Promise<{ success: boolean; message: string }> {
  try {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        success: false,
        message: "Please enter a valid email address",
      };
    }

    // Check if email already exists
    const waitlistRef = collection(db, "waitlist");
    const q = query(waitlistRef, where("email", "==", email.toLowerCase()));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      return {
        success: false,
        message: "You're already on the waitlist! We'll notify you when we launch.",
      };
    }

    // Add to waitlist
    const metadata = {
      userAgent: typeof window !== "undefined" ? window.navigator.userAgent : undefined,
      referrer: typeof document !== "undefined" ? document.referrer : undefined,
    };

    await addDoc(waitlistRef, {
      email: email.toLowerCase(),
      source,
      createdAt: serverTimestamp(),
      metadata,
    });

    return {
      success: true,
      message: "Thank you for joining the Beta waitlist! We'll notify you in Q1 2026.",
    };
  } catch (error) {
    console.error("Error adding to waitlist:", error);
    return {
      success: false,
      message: "Something went wrong. Please try again later.",
    };
  }
}

/**
 * Get total waitlist count (for admin use)
 */
export async function getWaitlistCount(): Promise<number> {
  try {
    const waitlistRef = collection(db, "waitlist");
    const querySnapshot = await getDocs(waitlistRef);
    return querySnapshot.size;
  } catch (error) {
    console.error("Error getting waitlist count:", error);
    return 0;
  }
}



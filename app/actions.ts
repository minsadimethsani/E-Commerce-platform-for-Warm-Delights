"use server";

import { doc, getDoc, setDoc, collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function subscribeToNewsletter(email: string) {
  try {
    if (!email || !email.trim()) {
      return { error: "Email address is required." };
    }

    const trimmedEmail = email.trim().toLowerCase();

    // 1. Check the 'subscribers' collection for duplicates
    const subscriberRef = doc(db, "subscribers", trimmedEmail);
    const subscriberSnap = await getDoc(subscriberRef);

    if (subscriberSnap.exists()) {
      return { error: "Already subscribed." };
    }

    // 2. Append the subscriber record to 'subscribers' collection
    await setDoc(subscriberRef, {
      email: trimmedEmail,
      subscribedAt: new Date(),
      active: true,
    });

    // 3. Write to the 'mail' collection to trigger the email extension
    const mailRef = collection(db, "mail");
    await addDoc(mailRef, {
      to: trimmedEmail,
      message: {
        subject: "Welcome to Warm Delights! 🎂 Your Sweet Rewards Inside",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #2A1E17; font-family: serif;">Welcome to Warm Delights!</h1>
            <p style="color: #3A2E2B;">Thank you for subscribing to our newsletter. You are now on the list to receive real-time updates on seasonal cake creations, fresh morning pastry collections, and exclusive insider rewards.</p>
            <div style="background-color: #EFEFEA; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px; text-transform: uppercase; color: #3A2E2B;">Your Exclusive Welcome Gift</p>
              <h2 style="margin: 5px 0 0 0; color: #C5A880; letter-spacing: 2px;">WELCOME10</h2>
              <p style="margin: 5px 0 0 0; font-size: 12px; color: #3A2E2B/80;">Use this code at checkout for 10% off your first cake order!</p>
            </div>
          </div>
        `
      }
    });

    return { success: true };
  } catch (error: any) {
    console.error("subscribeToNewsletter error:", error);
    return { error: "An unexpected error occurred. Please try again." };
  }
}

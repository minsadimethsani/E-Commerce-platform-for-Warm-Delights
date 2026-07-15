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

export async function sendWelcomeEmail(email: string, displayName: string) {
  try {
    const trimmedEmail = email.trim().toLowerCase();
    const mailRef = collection(db, "mail");
    await addDoc(mailRef, {
      to: trimmedEmail,
      message: {
        subject: "Welcome to Warm Delights! 🎂 Your Account is Created",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #FDF9F0; border: 1px solid #A47251; border-radius: 16px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #2A1E17; font-family: serif; margin: 0;">Warm Delights</h1>
              <p style="color: #DD9E59; text-transform: uppercase; font-size: 10px; font-weight: bold; letter-spacing: 2px; margin: 5px 0 0 0;">Artisanal Cakes & Savory Treats</p>
            </div>
            <hr style="border: 0; border-top: 1px solid #A47251; opacity: 0.15; margin-bottom: 20px;"/>
            <h2 style="color: #2A1E17; font-family: serif; font-size: 20px; margin-top: 0;">Welcome, ${displayName}!</h2>
            <p style="color: #2A1E17; font-size: 14px; line-height: 1.6; opacity: 0.85;">Your account at Warm Delights has been successfully created. We are thrilled to have you join our community of sweet and savory enthusiasts!</p>
            <p style="color: #2A1E17; font-size: 14px; line-height: 1.6; opacity: 0.85;">With your account, you can now:</p>
            <ul style="color: #2A1E17; font-size: 14px; line-height: 1.6; opacity: 0.85; padding-left: 20px;">
              <li>Customize and place orders for cakes, pastries, and savory treats.</li>
              <li>Manage your shipping destinations for faster checkouts.</li>
              <li>Keep track of your complete order receipts and fulfillment history.</li>
            </ul>
            <div style="background-color: #F0D8A1; padding: 15px; border-radius: 12px; margin: 25px 0; border: 1px solid #A47251; opacity: 0.9; text-align: center;">
              <p style="margin: 0; font-size: 14px; color: #2A1E17; font-weight: bold;">Need something sweet today?</p>
              <a href="https://warm-delights.web.app/menu" style="display: inline-block; margin-top: 10px; background-color: #A47251; color: white; padding: 10px 20px; text-decoration: none; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; border-radius: 8px;">Explore Our Menu</a>
            </div>
            <hr style="border: 0; border-top: 1px solid #A47251; opacity: 0.15; margin-top: 25px; margin-bottom: 15px;"/>
            <p style="color: #2A1E17; font-size: 11px; text-align: center; opacity: 0.6;">This email was sent to ${trimmedEmail} to confirm your registration with Warm Delights.</p>
          </div>
        `
      }
    });
    return { success: true };
  } catch (error: any) {
    console.error("Error sending welcome email:", error);
    return { error: error.message };
  }
}

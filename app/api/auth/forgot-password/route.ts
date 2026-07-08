import { NextRequest, NextResponse } from "next/server";
import { collection, query, where, getDocs, doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email address is required." }, { status: 400 });
    }

    // 1. Verify that the user profile exists in Firestore /users
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email.trim().toLowerCase()));
    const userSnapshot = await getDocs(q);

    if (userSnapshot.empty) {
      // Return 200/success to prevent email enumeration attacks
      console.log(`Reset requested for unregistered email: ${email}. Skipping dispatch.`);
      return NextResponse.json({ success: true });
    }

    // 2. Generate a secure random token
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiration

    // 3. Save the reset token in Firestore
    const resetRef = doc(db, "password_resets", token);
    await setDoc(resetRef, {
      email: email.trim().toLowerCase(),
      token,
      expiresAt,
      used: false,
      createdAt: new Date(),
    });

    const resetLink = `${req.nextUrl.origin}/reset-password?token=${token}`;

    // 4. Send email using Resend
    const resendApiKey = process.env.RESEND_API_KEY;

    if (resendApiKey) {
      try {
        const resend = new Resend(resendApiKey);
        await resend.emails.send({
          from: "Warm Delights <onboarding@resend.dev>", // Resend default testing sender
          to: email.trim().toLowerCase(),
          subject: "Reset your Password - Warm Delights",
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #2a1e17/10; rounded: 8px;">
              <h2 style="font-family: serif; color: #2a1e17; text-align: center;">Warm Delights Bakery</h2>
              <p style="font-size: 14px; color: #3a2e2b; line-height: 1.6;">Hello,</p>
              <p style="font-size: 14px; color: #3a2e2b; line-height: 1.6;">
                We received a request to reset the password for your account at Warm Delights. 
                Please click the button below to choose a new password. This link is valid for 1 hour.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetLink}" style="background-color: #2a1e17; color: white; padding: 12px 24px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">
                  Reset Password
                </a>
              </div>
              <p style="font-size: 12px; color: #3a2e2b/60; line-height: 1.6;">
                If you did not make this request, you can safely ignore this email.
              </p>
              <hr style="border: 0; border-top: 1px solid #eef0f2; margin: 20px 0;" />
              <p style="font-size: 11px; text-align: center; color: #3a2e2b/40;">
                Warm Delights Bakery, Inc.
              </p>
            </div>
          `,
        });
        console.log(`Resend: Password reset email successfully dispatched to ${email}`);
      } catch (emailError) {
        console.error("Resend API failed to dispatch email:", emailError);
        console.warn(`[DEV FAILSAFE] Access the reset link here: ${resetLink}`);
      }
    } else {
      console.warn("====================================================================");
      console.warn("RESEND_API_KEY env key is missing.");
      console.warn(`[DEV FALLBACK] Copy and paste this link to test your reset:`);
      console.warn(resetLink);
      console.warn("====================================================================");
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Forgot password API route error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

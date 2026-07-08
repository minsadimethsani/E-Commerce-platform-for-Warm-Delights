import { NextRequest, NextResponse } from "next/server";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getFirebaseAdminApp } from "@/lib/firebase-admin";
import { getAuth } from "firebase-admin/auth";

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: "Token and password are required." }, { status: 400 });
    }

    // 1. Retrieve and validate the reset token from Firestore
    const resetDocRef = doc(db, "password_resets", token);
    const resetDocSnap = await getDoc(resetDocRef);

    if (!resetDocSnap.exists()) {
      return NextResponse.json({ error: "Invalid or expired reset token." }, { status: 400 });
    }

    const resetData = resetDocSnap.data();

    // Check if token is already used
    if (resetData.used) {
      return NextResponse.json({ error: "This reset link has already been used." }, { status: 400 });
    }

    // Check if token has expired
    const expiresAt = resetData.expiresAt.toDate();
    if (expiresAt < new Date()) {
      return NextResponse.json({ error: "This reset link has expired. Please request a new one." }, { status: 400 });
    }

    const email = resetData.email;

    // 2. Initialize Firebase Admin SDK and update password in Auth
    const adminApp = getFirebaseAdminApp();
    const hasAdminCredentials = process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY;

    if (hasAdminCredentials && adminApp) {
      try {
        const authAdmin = getAuth(adminApp);
        const userRecord = await authAdmin.getUserByEmail(email);
        await authAdmin.updateUser(userRecord.uid, {
          password: password,
        });
        console.log(`Firebase Auth password updated successfully for user ${email}`);
      } catch (authError: any) {
        console.error("Firebase Admin Auth password update failed:", authError);
        return NextResponse.json(
          { error: `Auth server error: ${authError.message || "Failed to update password."}` },
          { status: 500 }
        );
      }
    } else {
      console.warn("====================================================================");
      console.warn("FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY env vars are missing.");
      console.warn(`[DEV SIMULATOR] Password reset successfully simulated for: ${email}`);
      console.warn("To enable live Firebase Auth password updates, please configure service accounts in env.");
      console.warn("====================================================================");
    }

    // 3. Mark the token as used in Firestore
    await updateDoc(resetDocRef, {
      used: true,
      usedAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Reset password API route error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

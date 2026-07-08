import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

/**
 * Client-side script to check and seed the system admin user
 * if it doesn't already exist in Firebase Auth and Firestore.
 */
export async function seedAdminUser(): Promise<void> {
  const adminEmail = "mmethsani@gmail.com";
  const adminPassword = "Methsani123#";

  try {
    // 1. Try to create the admin account in Firebase Auth
    let uid = "";
    try {
      const userCred = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
      uid = userCred.user.uid;
      console.log("Seeded system admin in Firebase Auth successfully. UID:", uid);
    } catch (authError: any) {
      // If user already exists in auth, we catch 'auth/email-already-in-use'
      if (authError.code === "auth/email-already-in-use" || authError.message?.includes("already-in-use")) {
        console.log("System admin email mmethsani@gmil.com already registered in Firebase Auth.");
        // We will resolve the UID by logging in or searching the users collections
        // Wait, if it exists in auth but we don't know the UID, we can look up Firestore users collection
        return;
      } else {
        console.warn("Firebase Auth seeding skipped: Email/Password provider might not be enabled in Firebase console.", authError);
        return;
      }
    }

    // 2. Create the system admin profile doc in Firestore /users/{uid}
    if (uid) {
      const userDocRef = doc(db, "users", uid);
      await setDoc(userDocRef, {
        uid: uid,
        email: adminEmail,
        displayName: "Methsani System Admin",
        role: "admin",
        shippingAddresses: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log("Seeded system admin profile in Firestore users collection.");
    }
  } catch (error) {
    console.warn("Unexpected error seeding system admin account:", error);
  }
}

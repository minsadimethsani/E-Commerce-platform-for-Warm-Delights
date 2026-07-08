import { initializeApp, getApps, cert } from "firebase-admin/app";

/**
 * Initializes and returns the Firebase Admin App instance.
 * Automatically checks if an app already exists.
 */
export function getFirebaseAdminApp() {
  const apps = getApps();
  if (apps.length > 0) {
    return apps[0];
  }

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "warm-delights";
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (clientEmail && privateKey) {
    try {
      return initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
    } catch (error) {
      console.error("Error initializing Firebase Admin SDK with service account cert:", error);
    }
  }

  try {
    return initializeApp({
      projectId,
    });
  } catch (error) {
    console.warn(
      "Firebase Admin SDK could not be fully initialized due to missing credentials. Running in local fail-safe mode."
    );
  }
  
  return null;
}

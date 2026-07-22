"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { UserProfile } from "@/types/database";
import { usePathname } from "next/navigation";

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
  isMutating: boolean;
  setIsMutating: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  logout: async () => {},
  isMutating: false,
  setIsMutating: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const pathname = usePathname();

  const [storefrontAdminActive, setStorefrontAdminActive] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setStorefrontAdminActive(localStorage.getItem("storefront-admin-active") === "true");
    }
  }, [pathname]);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      if (firebaseUser) {
        // Use realtime listener for user profile changes
        const profileRef = doc(db, "users", firebaseUser.uid);
        unsubscribeProfile = onSnapshot(profileRef, (docSnap) => {
          if (docSnap.exists()) {
            setUserProfile(docSnap.data() as UserProfile);
          } else {
            // Default placeholder profile if not created yet (e.g. immediately after signup before setDoc finishes)
            setUserProfile({
              uid: firebaseUser.uid,
              email: firebaseUser.email || "",
              displayName: firebaseUser.displayName || "",
              role: "customer",
              shippingAddresses: [],
              createdAt: docSnap.metadata.hasPendingWrites ? null : (new Date() as any),
              updatedAt: docSnap.metadata.hasPendingWrites ? null : (new Date() as any),
            } as any);
          }
          setLoading(false);
        }, (error) => {
          console.error("Error listening to user profile:", error);
          setLoading(false);
        });
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) {
        unsubscribeProfile();
      }
    };
  }, []);

  const logout = async () => {
    if (isMutating) {
      console.warn("Sign out blocked: Database mutation in progress.");
      return;
    }
    setLoading(true);
    if (typeof document !== "undefined") {
      document.cookie = "session-active=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "session-role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "session-storefront-active=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem("storefront-admin-active");
    }
    setStorefrontAdminActive(false);
    await signOut(auth);
    setUser(null);
    setUserProfile(null);
    setLoading(false);
  };

  const isStorefront = !pathname?.startsWith("/admin");
  const activeUser = (isStorefront && userProfile?.role === "admin" && !storefrontAdminActive) ? null : user;
  const activeUserProfile = (isStorefront && userProfile?.role === "admin" && !storefrontAdminActive) ? null : userProfile;

  return (
    <AuthContext.Provider value={{ user: activeUser, userProfile: activeUserProfile, loading, logout, isMutating, setIsMutating }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

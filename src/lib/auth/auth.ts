import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { adminAuth, adminDb } from "../firebase/adminApp";

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          // Verify with custom server-side logic by checking user doc. Wait, normally NextAuth
          // uses standard DB lookup. However, since the password verification relies on Firebase Auth,
          // checking passwords manually without firebase-client auth is tricky. 
          // An alternative is using Firebase REST API for sign-in to get idToken, then verify it.
          // Since it's server-only, we hit the Identity Toolkit API.
          
          const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
              returnSecureToken: true,
            }),
          });
          
          if (!res.ok) return null;
          
          const data = await res.json();
          const decodedToken = await adminAuth.verifyIdToken(data.idToken);
          
          const userDoc = await adminDb.collection("users").doc(decodedToken.uid).get();
          if (!userDoc.exists) return null;
          
          const userData = userDoc.data();
          
          return {
            id: decodedToken.uid,
            email: userData?.email,
            name: userData?.name,
            role: userData?.role || "user",
            phone: userData?.phone,
          };
        } catch (error) {
          console.error("Failed to authorize", error);
          return null;
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
});

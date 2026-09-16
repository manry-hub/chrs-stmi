import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { adminDb } from "@/lib/firebase/admin";
import { loginSchema } from "@/lib/validations/auth";
import { authConfig } from "./auth.config";
import { checkRateLimit, resetRateLimit } from "@/lib/rateLimitStore";

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        try {
          const { email, password } = loginSchema.parse(credentials);

          // Tahan percobaan tebak-password. Dikunci per email, bukan per IP:
          // middleware sudah membatasi per IP, dan credential stuffing menyasar
          // akun tertentu. Hitungannya di Firestore agar berlaku lintas instance.
          const attempt = await checkRateLimit("login", email.toLowerCase(), 10, 15 * 60 * 1000);
          if (!attempt.success) {
            console.warn(`Login rate limit exceeded for ${email}`);
            return null;
          }

          // Verify password against Firebase Auth via Identity Toolkit REST
          const res = await fetch(
            `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email, password, returnSecureToken: true }),
            }
          );

          if (!res.ok) return null;

          // Return user object with role from Firestore users collection
          const userSnap = await adminDb
            .collection("users")
            .where("email", "==", email)
            .limit(1)
            .get();

          if (userSnap.empty) return null;

          const userData = userSnap.docs[0].data();

          // Login berhasil: bebaskan kuncinya agar percobaan gagal sebelumnya
          // tidak menghukum pemilik akun yang sah.
          await resetRateLimit("login", email.toLowerCase());

          return {
            id: userSnap.docs[0].id,
            name: userData.name,
            email: userData.email,
            role: userData.role,
          };
        } catch (error) {
          console.error("Authorization error:", error);
          return null;
        }
      },
    }),
  ],
});

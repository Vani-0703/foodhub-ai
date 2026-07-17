import admin from "firebase-admin";

// The service account JSON is stored as a base64 string in env vars
// so it can be safely set as a single-line value on hosts like Vercel/Render.
const decoded = Buffer.from(
  process.env.FIREBASE_SERVICE_ACCOUNT_BASE64 || "",
  "base64"
).toString("utf-8");

if (decoded) {
  const serviceAccount = JSON.parse(decoded);
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
} else {
  console.warn(
    "FIREBASE_SERVICE_ACCOUNT_BASE64 not set — Firebase Admin auth will fail."
  );
}

export default admin;

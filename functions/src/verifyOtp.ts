import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import type { CallableRequest } from "firebase-functions/https";

const db = admin.firestore();

interface VerifyOTPRequest {
  email: string;
  otp: string;
}

export const verifyEmailOtp = functions.https.onCall(
  async (request: CallableRequest<VerifyOTPRequest>) => {
    const { email, otp } = request.data;

    if (!email || !otp) {
      throw new functions.https.HttpsError("invalid-argument", "Email and OTP are required.");
    }

    const docRef = db.collection("otps").doc(email);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      throw new functions.https.HttpsError("not-found", "OTP not found.");
    }

    const { otp: storedOtp, expiresAt } = docSnap.data() as {
      otp: string;
      expiresAt: FirebaseFirestore.Timestamp;
    };

    if (otp !== storedOtp) {
      throw new functions.https.HttpsError("permission-denied", "Incorrect OTP.");
    }

    if (expiresAt.toMillis() < Date.now()) {
      throw new functions.https.HttpsError("deadline-exceeded", "OTP expired.");
    }

    // If valid, delete the OTP doc (optional for security)
    await docRef.delete();

    return { success: true };
  }
);

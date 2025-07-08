import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

export const verifyPhoneOtp = functions.https.onCall(async (request, context) => {
  const { phone, otp } = request.data;

  if (!phone || !otp) {
    throw new functions.https.HttpsError("invalid-argument", "Phone and OTP are required");
  }

  const docSnap = await admin.firestore().collection("otp_verification").doc(phone).get();
  if (!docSnap.exists) {
    throw new functions.https.HttpsError("not-found", "No OTP request found");
  }

  const { sessionId, expiresAt } = docSnap.data() as {
    sessionId: string;
    expiresAt: number;
  };

  if (Date.now() > expiresAt) {
    throw new functions.https.HttpsError("deadline-exceeded", "OTP has expired");
  }

  const url = `https://2factor.in/API/V1/${process.env.TWOFACTOR_API_KEY}/SMS/VERIFY/${sessionId}/${otp}`;
  const res = await fetch(url);
  const json = await res.json();

  if (json.Status === "Success" && json.Details === "OTP Matched") {
    return { success: true };
  } else {
    console.error("OTP mismatch:", json);
    throw new functions.https.HttpsError("unauthenticated", "Invalid OTP");
  }
});

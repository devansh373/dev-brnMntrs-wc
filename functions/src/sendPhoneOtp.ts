// functions/src/sendOtp.ts
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import fetch from "node-fetch";
import * as dotenv from "dotenv";
// import * as cors from "cors";


dotenv.config();

// const corsHandler = cors({ origin: true }); // allows all origins, you can restrict if needed

// admin.initializeApp();

export const sendPhoneOtp = functions.https.onCall(async (request, context) => {
  const phone = request.data.phone;
  if (!phone)
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Phone number required"
    );

//   const otp = Math.floor(100000 + Math.random() * 900000).toString();

//   // Store OTP in Firestore
//   await admin
//     .firestore()
//     .collection("otp_verification")
//     .doc(phone)
//     .set({
//       otp,
//       createdAt: admin.firestore.FieldValue.serverTimestamp(),
//       expiresAt: Date.now() + 5 * 60 * 1000,
//     });

//   const url = `https://2factor.in/API/V1/${process.env.TWOFACTOR_API_KEY}/SMS/+91${phone}/${otp}/OTP1`;
  const url = `https://2factor.in/API/V1/${process.env.TWOFACTOR_API_KEY}/SMS/+91${phone}/AUTOGEN2/OTP1`;
//   const url = `https://2factor.in/API/V1/${process.env.TWOFACTOR_API_KEY}/SMS/91${phone}/${otp}/OTP1`;

  

  const res = await fetch(url);
  const json = await res.json();

  if (json.Status !== "Success") {
    console.error(json);
    throw new functions.https.HttpsError("internal", "Failed to send OTP");
  }


   await admin
    .firestore()
    .collection("otp_verification")
    .doc(phone)
    .set({
      sessionId: json.Details,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

  return { success: true };
});

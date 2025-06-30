import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as nodemailer from "nodemailer";
import * as dotenv from "dotenv";
import { CallableRequest } from "firebase-functions/https";

dotenv.config();

admin.initializeApp();
const db = admin.firestore();

// setup transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// utility to generate 6-digit OTP
const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

interface OTPRequestData {
  email: string;
}

export const sendEmailOtp = functions.https.onCall(
  async (request: CallableRequest<OTPRequestData>, context) => {
    const email = request.data.email;

    if (!email) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Email is required."
      );
    }

    const otp = generateOtp();
    const expiresAt = admin.firestore.Timestamp.fromDate(
      new Date(Date.now() + 5 * 60 * 1000)
    ); // 5 minutes

    // Save OTP in Firestore (collection: otps)
    await db.collection("otps").doc(email).set({
      otp,
      expiresAt,
    });

    // Send email
    const mailOptions = {
      from: `"Workshop Team" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is ${otp}. It is valid for 5 minutes.`,
    };

    try {
      await transporter.sendMail(mailOptions);
      return { success: true };
    } catch (err) {
      console.error("Email sending failed", err);
      throw new functions.https.HttpsError("internal", "Failed to send OTP.");
    }
  }
);

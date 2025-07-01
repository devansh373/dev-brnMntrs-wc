import { onDocumentCreated } from "firebase-functions/v2/firestore";
// import { initializeApp } from "firebase-admin/app";
// import { getFirestore } from "firebase-admin/firestore";
import nodemailer from "nodemailer";
import { logger } from "firebase-functions";

// initializeApp();

const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: emailUser,
    pass: emailPass,
  },
});

export const sendCertificateEmail = onDocumentCreated(
  "submissions/{docId}",
  async (event) => {
    const data = event.data?.data();

    if (!data?.email || !data?.certificateURL) {
      logger.warn("Missing email or certificateURL");
      return;
    }

    const mailOptions = {
      from: `"Workshop Team" <${emailUser}>`,
      to: data.email,
      subject: `Your Certificate for ${data.workshopName || "the Workshop"}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
    <div style="text-align: center; margin-bottom: 20px;">
      <img src="https://yourdomain.com/logo.png" alt="Logo" style="max-width: 150px;" />
    </div>
    <h2 style="color: #2d6cdf;">🎓 Certificate of Participation</h2>
    <p>Hi <strong>${data.name}</strong>,</p>
    <p>Thank you for attending <strong>${data.workshopName}</strong> at <strong>${data.college}</strong> on ${data.date}.</p>
    <p>Your certificate is ready! Click below to download:</p>

    <div style="text-align: center; margin: 20px 0;">
      <a href="${data.certificateURL}" target="_blank"
        style="background-color: #2d6cdf; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none;">
        🎉 Download Certificate
      </a>
    </div>

    <p>If the button above doesn't work, you can also use this link:</p>
    <p><a href="${data.certificateURL}" target="_blank">${data.certificateURL}</a></p>

    <hr style="margin-top: 30px;" />
    <p style="font-size: 12px; color: #888;">This email was sent by Tech Workshop Team.<br/>
    Please do not reply directly to this email.</p>
  </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      logger.info(`✅ Certificate email sent to ${data.email}`);
    } catch (error) {
      logger.error("❌ Failed to send certificate email:", error);
    }
  }
);

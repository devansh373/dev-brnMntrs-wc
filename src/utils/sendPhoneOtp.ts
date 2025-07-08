import { functions } from "../utils/firebase"; // or wherever your firebase config is
import { httpsCallable } from "firebase/functions";

type PhoneOtpResponse = {
  success: boolean;
  message?: string;
};

export async function sendPhoneOtp(phone: string):Promise<PhoneOtpResponse> {
  try {
    const sendPhoneOtp = httpsCallable(functions, "sendPhoneOtp");
    const result = await sendPhoneOtp({ phone }); // pass phone number
    console.log("OTP sent response:", result.data);
    return result.data as PhoneOtpResponse;
  } catch (err) {
    console.error("Error sending OTP:", err);
    throw err;
  }
}

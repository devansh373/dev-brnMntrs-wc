import { httpsCallable } from "firebase/functions";
import { functions } from "./firebase";

type OtpResponse = {
  success: boolean;
};

export const sendEmailOtp = async (email: string) => {
  const sendOtpFunction = httpsCallable<{ email: string }, OtpResponse>(
    functions,
    "sendEmailOtp"
  );

  try {
    const result = await sendOtpFunction({ email });
    return result.data; // Now properly typed as OtpResponse
  } catch (error: any) {
    console.error("OTP Error:", error.message);
    throw error;
  }
};

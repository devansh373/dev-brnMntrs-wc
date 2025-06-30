import { httpsCallable } from "firebase/functions";
import { functions } from "./firebase";

export const verifyEmailOtp = async (email: string, otp: string) => {
  const verifyFn = httpsCallable(functions, "verifyEmailOtp");

  try {
    const result = await verifyFn({ email, otp });
    return result.data as { success: boolean };
  } catch (err: any) {
    console.error("Verification error:", err.message);
    throw err;
  }
};

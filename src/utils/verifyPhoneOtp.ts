import { functions } from "../utils/firebase";
import { httpsCallable } from "firebase/functions";

export async function verifyPhoneOtp(phone: string, otp: string): Promise<boolean> {
  try {
    const verifyFn = httpsCallable(functions, "verifyPhoneOtp");
    const result = await verifyFn({ phone, otp });
    return (result.data as any).success === true;
  } catch (err) {
    console.error("Phone OTP verification failed", err);
    return false;
  }
}

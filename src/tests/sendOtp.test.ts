// import { describe, it, expect, vi, type Mock } from "vitest";
// import { sendEmailOtp } from "../../src/utils/sendOtp";

// // Mock firebase/functions
// vi.mock("firebase/functions", async () => {
//   return {
//     getFunctions: vi.fn(() => ({})), // ✅ mock getFunctions
//     httpsCallable: vi.fn(() => vi.fn().mockResolvedValue({
//       data: { success: true }
//     })), // ✅ mock httpsCallable that resolves to success
//   };
// });

// // Mock your own firebase.ts module
// vi.mock("../../src/utils/firebase", () => ({
//   functions: {}, // ✅ export a dummy `functions` object
// }));

// describe("sendEmailOtp", () => {
//   it("should return success when Firebase function works", async () => {
//     const result = await sendEmailOtp("test@example.com");
//     expect(result.success).toBe(true);
//   });

//   it("should throw error if Firebase function fails", async () => {
//     const errorFn = vi.fn().mockRejectedValue(new Error("Function Error"));

//     const { httpsCallable } = await import("firebase/functions");
//     (httpsCallable as unknown as Mock).mockReturnValueOnce(errorFn);

//     await expect(sendEmailOtp("test@example.com")).rejects.toThrow("Function Error");
//   });
// });

import { describe, it, expect, vi, type Mock } from "vitest";
import { sendEmailOtp } from "../../src/utils/sendOtp";

// ✅ Mock firebase/functions
vi.mock("firebase/functions", async () => {
  return {
    getFunctions: vi.fn(() => ({})),
    httpsCallable: vi.fn(() =>
      vi.fn().mockResolvedValue({ data: { success: true } })
    ),
  };
});

// ✅ Mock your local Firebase config
vi.mock("../../src/utils/firebase", () => ({
  functions: {}, // dummy mock to satisfy the import
}));

describe("sendEmailOtp", () => {
  it("should return success when Firebase callable resolves", async () => {
    const result = await sendEmailOtp("test@example.com");
    expect(result.success).toBe(true);
  });

  it("should throw error if Firebase callable rejects", async () => {
    const errorFn = vi.fn().mockRejectedValue(new Error("OTP failed"));

    // manually override mock for this test
    const { httpsCallable } = await import("firebase/functions");
    (httpsCallable as unknown as Mock).mockReturnValueOnce(errorFn);

    await expect(sendEmailOtp("fail@example.com")).rejects.toThrow("OTP failed");
  });
});

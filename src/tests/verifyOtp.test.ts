import { describe, it, expect, vi, type Mock } from "vitest";
import { verifyEmailOtp } from "../../src/utils/verifyOtp";

// ✅ Mock firebase/functions
vi.mock("firebase/functions", async () => {
  return {
    getFunctions: vi.fn(() => ({})),
    httpsCallable: vi.fn(() =>
      vi.fn().mockResolvedValue({ data: { success: true } })
    ),
  };
});

// ✅ Mock your local Firebase instance
vi.mock("../../src/utils/firebase", () => ({
  functions: {}, // dummy functions object
}));

describe("verifyEmailOtp", () => {
  it("should return success when verification is successful", async () => {
    const result = await verifyEmailOtp("test@example.com", "123456");
    expect(result.success).toBe(true);
  });

  it("should throw error when verification fails", async () => {
    const errorFn = vi.fn().mockRejectedValue(new Error("Invalid OTP"));

    const { httpsCallable } = await import("firebase/functions");
    (httpsCallable as unknown as Mock).mockReturnValueOnce(errorFn);

    await expect(verifyEmailOtp("fail@example.com", "000000")).rejects.toThrow("Invalid OTP");
  });
});

// At the top before imports
declare global {
  interface Window {
    recaptchaVerifier: import("firebase/auth").RecaptchaVerifier;
    confirmationResult: import("firebase/auth").ConfirmationResult;
  }
}

import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  serverTimestamp,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { auth, db, storage } from "../utils/firebase";
import { useForm } from "react-hook-form";
import { sendEmailOtp } from "../utils/sendOtp";
import { verifyEmailOtp } from "../utils/verifyOtp";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { generateCertificate } from "../utils/generateCertificate";

const regex = {
  name: /^[A-Za-z\s.'-]{2,50}$/,
  email: /^\S+@\S+\.\S+$/,
  phone: /^[6-9]\d{9}$/,
  course: /^[A-Za-z0-9\s().,-]{2,50}$/,
  otp: /^\d{6}$/,
};

type FeedbackFormFields = {
  name: string;
  email: string;
  phone: string;
  course: string;
  rating: number;
  comments: string;
};

export default function FeedbackForm() {
  const { id } = useParams();
  const [formData, setFormData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [invalid, setInvalid] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailCooldown, setEmailCooldown] = useState(0);
  const [emailOtpInput, setEmailOtpInput] = useState("");
  const [emailOtpVerified, setEmailOtpVerified] = useState(false);

  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [phoneCooldown, setPhoneCooldown] = useState(0);
  const [phoneOtpInput, setPhoneOtpInput] = useState("");
  const [phoneOtpVerified, setPhoneOtpVerified] = useState(false);

  const [loadingOtp, setLoadingOtp] = useState(false);
  const [loadingOtpVerification, setLoadingOtpVerification] = useState(false);
  const [loadingPhoneOtp, setLoadingPhoneOtp] = useState(false);
  const [loadingPhoneVerification, setLoadingPhoneVerification] =
    useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const savedDraft = localStorage.getItem(`feedback_draft_${id}`);
  const parsedDraft = savedDraft ? JSON.parse(savedDraft) : {};

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FeedbackFormFields>({
    defaultValues: {
      rating: 5,
      ...parsedDraft, // merge saved data with default
    },
  });

  const watchedFields = watch();

  useEffect(() => {
    const subscription = watch((values) => {
      localStorage.setItem(`feedback_draft_${id}`, JSON.stringify(values));
    });

    return () => subscription.unsubscribe(); // Cleanup
  }, [watch, id]);

  useEffect(() => {
    const fetchForm = async () => {
      if (!id) return;
      const docRef = doc(db, "workshops", id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists() || !docSnap.data()?.isActive) setInvalid(true);
      else setFormData(docSnap.data());
      setLoading(false);
    };
    fetchForm();
  }, [id]);

  useEffect(() => {
    const totalFields = 5;
    let filled = 0;

    if (watchedFields.name?.match(regex.name)) filled++;
    if (watchedFields.email?.match(regex.email)) filled++;
    // if (emailOtpVerified) filled++;
    if (watchedFields.phone?.match(regex.phone)) filled++;
    // if (phoneOtpVerified) filled++;
    if (watchedFields.course?.match(regex.course)) filled++;
    if (watchedFields.rating) filled++;
    // if (typeof watchedFields.comments === "string" && watchedFields.comments.trim()) filled++;

    setProgress(Math.round((filled / totalFields) * 100));
  }, [watchedFields]);

  useEffect(() => {
    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
      }
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setEmailCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      setPhoneCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const setupRecaptcha = async () => {
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
    }

    window.recaptchaVerifier = new RecaptchaVerifier(
      auth,
      "recaptcha-container",
      {
        size: "invisible",
        callback: () => console.log("Recaptcha Resolved"),
      }
    );

    return window.recaptchaVerifier.render();
  };

  // const handleSendOtp = async () => {
  //   try {
  //     if(!watchedFields.email) setError("Please provide the email.")
  //     setLoadingOtp(true);
  //     const result = await sendEmailOtp(watchedFields.email);
  //     if (result.success) {
  //       setEmailOtpSent(true);
  //       alert("OTP sent to your email");
  //     }
  //   } catch {
  //     alert("Failed to send email OTP");
  //   } finally {
  //     setLoadingOtp(false);
  //   }
  // };
  const handleSendOtp = async () => {
    try {
      if (!watchedFields.email) {
        setError("Please provide the email.");
        return;
      }

      setLoadingOtp(true);
      const result = await sendEmailOtp(watchedFields.email);
      if (result.success) {
        setEmailOtpSent(true);
        setEmailCooldown(60); // ⏳ 60s cooldown starts here
        alert("OTP sent to your email");
      }
    } catch {
      alert("Failed to send email OTP");
    } finally {
      setLoadingOtp(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    try {
      if (!regex.otp.test(emailOtpInput)) {
        alert("Enter a valid 6-digit email OTP");
        return;
      }

      setLoadingOtpVerification(true);
      const result = await verifyEmailOtp(watchedFields.email, emailOtpInput);
      if (result.success) {
        setEmailOtpVerified(true);
        alert("Email verified!");
      }
    } catch {
      alert("Invalid or expired email OTP.");
    } finally {
      setLoadingOtpVerification(false);
    }
  };

  // const handleSendPhoneOtp = async () => {
  //   try {
  //     setLoadingPhoneOtp(true);
  //     await setupRecaptcha();
  //     const confirmationResult = await signInWithPhoneNumber(
  //       auth,
  //       `+91${watchedFields.phone}`,
  //       window.recaptchaVerifier
  //     );
  //     window.confirmationResult = confirmationResult;
  //     setPhoneOtpSent(true);
  //     alert("OTP sent to phone");
  //   } catch (error) {
  //     console.error(error);
  //     alert("Failed to send phone OTP");
  //   } finally {
  //     setLoadingPhoneOtp(false);
  //   }
  // };

  const handleSendPhoneOtp = async () => {
    try {
      setLoadingPhoneOtp(true);
      await setupRecaptcha();
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        `+91${watchedFields.phone}`,
        window.recaptchaVerifier
      );
      window.confirmationResult = confirmationResult;
      setPhoneOtpSent(true);
      setPhoneCooldown(60); // Start 60s cooldown
      alert("OTP sent to phone");
    } catch (error) {
      console.error(error);
      alert("Failed to send phone OTP");
    } finally {
      setLoadingPhoneOtp(false);
    }
  };

  const handleVerifyPhoneOtp = async () => {
    try {
      if (!regex.otp.test(phoneOtpInput)) {
        alert("Enter a valid 6-digit phone OTP");
        return;
      }

      setLoadingPhoneVerification(true);
      const result = await window.confirmationResult.confirm(phoneOtpInput);
      if (result.user) {
        setPhoneOtpVerified(true);
        alert("Phone number verified!");
      }
    } catch {
      alert("Invalid or expired phone OTP.");
    } finally {
      setLoadingPhoneVerification(false);
    }
  };

  const onSubmit = async (data: FeedbackFormFields) => {
    setError("");
    setSubmitting(true);

    if (!emailOtpVerified) {
      setError("Please verify your email before submitting.");
      setSubmitting(false);
      return;
    }

    if (!phoneOtpVerified) {
      setError("Please verify your phone before submitting.");
      setSubmitting(false);
      return;
    }

    try {
      const feedbackRef = collection(db, "submissions");
      const q = query(
        feedbackRef,
        where("formId", "==", id),
        where("email", "==", data.email)
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        setError("You have already submitted this form.");
        return;
      }

      const templateSnap = await getDocs(
        query(
          collection(db, "certificateTemplates"),
          where("workshopId", "==", id)
        )
      );
      if (templateSnap.empty) return;

      const templateData = templateSnap.docs[0].data();
      const pdfBytes = await generateCertificate(
        templateData.downloadURL,
        templateData.fieldPositions || [],
        {
          name: data.name,
          college: formData.college,
          date: formData.date,
          workshopName: formData.workshopName,
        }
      );

      const certRef = ref(storage, `certificates/${id}_${data.email}.pdf`);
      await uploadBytes(
        certRef,
        new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" })
      );
      const url = await getDownloadURL(certRef);

      await setDoc(doc(db, "submissions", `${id}_${data.email}`), {
        formId: id,
        submittedAt: serverTimestamp(),
        emailVerified: true,
        phoneVerified: true,
        certificateURL: url,
        workshopName: formData.workshopName,
        college: formData.college,
        date: formData.date,
        time: formData.time,
        ...data,
      });
      localStorage.removeItem(`feedback_draft_${id}`);

      setSubmitted(true);
    } catch (err) {
      console.error("Submission failed", err);
      setError("Submission failed. Try again later.");
    } finally {
      setSubmitting(false);
    }
  };
  if (loading) return <div className="text-center mt-10">Loading...</div>;
  if (invalid)
    return (
      <div className="text-center text-red-600 mt-10">
        Invalid or Inactive Form
      </div>
    );
  if (submitted)
    return (
      <div className="text-center text-green-600 mt-10">
        Thank you for your feedback!
        <p className="text-gray-700 mt-2">
          Your certificate will be sent to your registered email and WhatsApp
          number shortly.
        </p>
        {/* <button
          onClick={() => {
            window.open(url);
            }}
            >
            Preview
            </button> */}
      </div>
    );

  return (
  <div className="w-full px-4 sm:px-6 md:px-8 max-w-2xl mx-auto pt-4">
    {/* Progress Bar */}
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Form Progress: {progress}%
      </label>
      <div className="w-full h-3 bg-gray-200 rounded">
        <div
          className="h-full bg-blue-500 rounded"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>

    <h1 className="text-2xl font-bold mb-2">{formData?.workshopName}</h1>
    <p className="text-gray-600">{formData?.college}</p>
    <p className="mb-4 text-gray-600">
      {formData?.date} at {formData?.time}
    </p>

    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Name */}
      <div>
        <label className="block mb-1">
          Full Name <span className="text-red-600">*</span>
        </label>
        <input
          className="w-full p-2 border rounded"
          {...register("name", {
            required: "Name is required",
            pattern: {
              value: regex.name,
              message: "Enter a valid name",
            },
          })}
        />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
      </div>

      {/* Email + OTP */}
      <div>
        <label className="block mb-1">
          Email <span className="text-red-600">*</span>
        </label>
        <input
          type="email"
          className="w-full p-2 border rounded"
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: regex.email,
              message: "Invalid email format",
            },
          })}
        />
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}

        {!emailOtpVerified && (
          <>
            {!emailOtpSent || emailCooldown === 0 ? (
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={loadingOtp || !watchedFields.email}
                className="mt-2 text-sm underline text-blue-600"
              >
                {loadingOtp ? "Sending..." : emailOtpSent ? "Resend OTP" : "Send OTP"}
              </button>
            ) : (
              <p className="text-sm text-gray-600 mt-2">
                Resend OTP in <span className="font-semibold">{emailCooldown}s</span>
              </p>
            )}
          </>
        )}

        {emailOtpSent && !emailOtpVerified && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
            <input
              className="w-full p-2 border rounded"
              placeholder="Enter Email OTP"
              value={emailOtpInput}
              onChange={(e) => setEmailOtpInput(e.target.value)}
            />
            <button
              type="button"
              className="text-sm text-green-600 underline"
              onClick={handleVerifyEmailOtp}
            >
              {loadingOtpVerification ? "Verifying..." : "Verify OTP"}
            </button>
          </div>
        )}

        {emailOtpVerified && (
          <p className="text-green-600 text-sm mt-1">Email verified ✅</p>
        )}
      </div>

      {/* Phone + OTP */}
      <div>
        <label className="block mb-1">
          Phone <span className="text-red-600">*</span>
        </label>
        <input
          type="tel"
          className="w-full p-2 border rounded"
          {...register("phone", {
            required: "Phone number is required",
            pattern: {
              value: regex.phone,
              message: "Enter valid 10-digit number",
            },
          })}
        />
        {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}

        {!phoneOtpVerified && (
          <>
            {!phoneOtpSent || phoneCooldown === 0 ? (
              <button
                type="button"
                onClick={handleSendPhoneOtp}
                disabled={loadingPhoneOtp || !watchedFields.phone}
                className="mt-2 text-sm underline text-blue-600"
              >
                {loadingPhoneOtp ? "Sending..." : phoneOtpSent ? "Resend OTP" : "Send OTP"}
              </button>
            ) : (
              <p className="text-sm text-gray-600 mt-2">
                Resend OTP in <span className="font-semibold">{phoneCooldown}s</span>
              </p>
            )}
          </>
        )}

        {phoneOtpSent && !phoneOtpVerified && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
            <input
              className="w-full p-2 border rounded"
              placeholder="Enter Phone OTP"
              value={phoneOtpInput}
              onChange={(e) => setPhoneOtpInput(e.target.value)}
            />
            <button
              type="button"
              className="text-sm text-green-600 underline"
              onClick={handleVerifyPhoneOtp}
            >
              {loadingPhoneVerification ? "Verifying..." : "Verify OTP"}
            </button>
          </div>
        )}

        {phoneOtpVerified && (
          <p className="text-green-600 text-sm mt-1">Phone verified ✅</p>
        )}
      </div>

      {/* Course */}
      <div>
        <label className="block mb-1">
          Course <span className="text-red-600">*</span>
        </label>
        <input
          className="w-full p-2 border rounded"
          {...register("course", {
            required: "Course is required",
            pattern: {
              value: regex.course,
              message: "Enter valid course name",
            },
          })}
        />
        {errors.course && (
          <p className="text-red-500 text-sm mt-1">{errors.course.message}</p>
        )}
      </div>

      {/* Rating */}
      <div>
        <label className="block mb-1">
          Rating <span className="text-red-600">*</span>
        </label>
        <select
          className="w-full p-2 border rounded"
          defaultValue="5"
          {...register("rating", { required: "Rating is required" })}
        >
          <option value="5">Excellent</option>
          <option value="4">Very Good</option>
          <option value="3">Good</option>
          <option value="2">Fair</option>
          <option value="1">Poor</option>
        </select>
      </div>

      {/* Comments */}
      <div>
        <label className="block mb-1">Comments</label>
        <textarea
          className="w-full p-2 border rounded"
          {...register("comments", {
            maxLength: {
              value: 200,
              message: "Comment should not exceed 200 characters",
            },
          })}
        />
      </div>

      {/* Error Message */}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {/* Submit Button */}
      <button
        type="submit"
        className={`bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center justify-center gap-2 w-full sm:w-auto ${
          (!emailOtpVerified || !phoneOtpVerified || submitting) &&
          "opacity-50 cursor-not-allowed"
        }`}
      >
        {submitting ? (
          <>
            <svg
              className="animate-spin h-5 w-5 text-white"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
            Submitting...
          </>
        ) : (
          "Submit Feedback"
        )}
      </button>
    </form>

    {/* Recaptcha */}
    <div id="recaptcha-container" className="mt-4" />
  </div>
);

}

// At the top before imports (or in a separate file)
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

export default function FeedbackForm() {
  const { id } = useParams();
  const [formData, setFormData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [invalid, setInvalid] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtpInput, setEmailOtpInput] = useState("");
  const [emailOtpVerified, setEmailOtpVerified] = useState(false);

  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [phoneOtpInput, setPhoneOtpInput] = useState("");
  const [phoneOtpVerified, setPhoneOtpVerified] = useState(false);

  const [loadingOtp, setLoadingOtp] = useState(false);
  const [loadingOtpVerification, setLoadingOtpVerification] = useState(false);
  const [loadingPhoneOtp, setLoadingPhoneOtp] = useState(false);
  const [loadingPhoneVerification, setLoadingPhoneVerification] =
    useState(false);
  const [url, setUrl] = useState("");

  const auth2 = getAuth();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const email = watch("email");
  const phone = watch("phone");

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

  const handleSendOtp = async () => {
    try {
      setLoadingOtp(true);
      const result = await sendEmailOtp(email);
      if (result.success) {
        setEmailOtpSent(true);
        alert("OTP sent to your email");
      }
    } catch (err) {
      alert("Failed to send email OTP");
    } finally {
      setLoadingOtp(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    try {
      setLoadingOtpVerification(true);
      const result = await verifyEmailOtp(email, emailOtpInput);
      if (result.success) {
        setEmailOtpVerified(true);
        alert("Email verified!");
      }
    } catch (err) {
      alert("Invalid or expired email OTP.");
    } finally {
      setLoadingOtpVerification(false);
    }
  };

  // const setupRecaptcha = () => {
  //   if (!window.recaptchaVerifier) {
  //     window.recaptchaVerifier = new RecaptchaVerifier(
  //       auth,
  //       "recaptcha-container",
  //       {
  //         size: "invisible",
  //         callback: (response: any) => {
  //           console.log("Recaptcha Resolved");
  //         },
  //       }
  //     );
  //   }
  // };

  const setupRecaptcha = async() => {
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
    }

    window.recaptchaVerifier = new RecaptchaVerifier(
      auth,
      "recaptcha-container", // 👈 container ID
      {
        size: "invisible",
        callback: (response: any) => {
          console.log("Recaptcha Resolved");
        },
      }
    );

    return window.recaptchaVerifier.render();
  };

  const handleSendPhoneOtp = async () => {
    setLoadingPhoneOtp(true);
    await setupRecaptcha();
    const appVerifier = window.recaptchaVerifier;
    signInWithPhoneNumber(auth, `+91${phone}`, appVerifier)
      .then((confirmationResult) => {
        console.log(confirmationResult);
        window.confirmationResult = confirmationResult;
        setPhoneOtpSent(true);
        alert("OTP sent to phone");
      })
      .catch((error) => {
        console.error(error);
        alert("Failed to send phone OTP");
        
      })
      .finally(() => {
        setLoadingPhoneOtp(false);
      });
  };

  const handleVerifyPhoneOtp = async () => {
    try {
      setLoadingPhoneVerification(true);
      const result = await window.confirmationResult.confirm(phoneOtpInput);
      if (result.user) {
        setPhoneOtpVerified(true);
        alert("Phone number verified!");
      }
    } catch (err) {
      alert("Invalid or expired phone OTP.");
    } finally {
      setLoadingPhoneVerification(false);
    }
  };

  const onSubmit = async (data: any) => {
    setError("");

    // if (!emailOtpVerified) {
    //   setError("Please verify your email before submitting.");
    //   return;
    // }

    // if (!phoneOtpVerified) {
    //   setError("Please verify your phone before submitting.");
    //   return;
    // }

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
      console.log(formData);
      console.log("🔥 data to be saved:", {
        formId: id,
        submittedAt: "timestamp",
        emailVerified: true,
        phoneVerified: true,
        certificateURL: "blob_url",
        workshopName: formData.workshopName,
        college: formData.college,
        date: formData.date,
        time: formData.time,
        ...data,
      });

      try {
        const templateSnap = await getDocs(
          query(
            collection(db, "certificateTemplates"),
            where("workshopId", "==", id)
          )
        );
        if (templateSnap.empty) {
          console.warn("No template found for this workshop");
          return;
        }

        const templateDoc = templateSnap.docs[0];
        const templateData = templateDoc.data();

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
        const blob = new Blob([new Uint8Array(pdfBytes)], {
          type: "application/pdf",
        });
        // const url = URL.createObjectURL(blob);
        // setUrl(url);

        const certRef = ref(storage, `certificates/${id}_${data.email}.pdf`);
        await uploadBytes(
          certRef,
          new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" })
        );
        // ✅ Get download URL
        const url = await getDownloadURL(certRef);

        // ✅ Save full submission data along with certificateURL
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
        setSubmitted(true);
        console.log("Certificate uploaded for:", data.email);
      } catch (genErr) {
        console.error("Certificate generation failed", genErr);
      }
    } catch (err) {
      console.error("Submission error:", err);
      setError("Submission failed. Try again later.");
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
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-2">{formData.workshopName}</h1>
      <p className="text-gray-600">{formData.college}</p>
      <p className="mb-4 text-gray-600">
        {formData.date} at {formData.time}
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label>Full Name</label>
          <input
            className="w-full p-2 border rounded"
            {...register("name", { required: "Name is required" })}
          />
          {errors.name && (
            <p className="text-red-500">{errors.name.message as string}</p>
          )}
        </div>

        {/* Email field + OTP */}
        <div>
          <label>Email</label>
          <input
            type="email"
            className="w-full p-2 border rounded"
            {...register("email", {
              required: "Email is required",
              pattern: { value: /^\S+@\S+$/, message: "Invalid email format" },
            })}
          />
          {errors.email && (
            <p className="text-red-500">{errors.email.message as string}</p>
          )}

          {!emailOtpSent && (
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={loadingOtp || !email}
              className="mt-2 text-sm underline text-blue-600"
            >
              {loadingOtp ? "Sending..." : "Send OTP"}
            </button>
          )}

          {emailOtpSent && !emailOtpVerified && (
            <>
              <input
                className="w-full mt-2 p-2 border rounded"
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
            </>
          )}

          {emailOtpVerified && (
            <p className="text-green-600 text-sm mt-1">Email verified ✅</p>
          )}
        </div>

        {/* Phone field + OTP */}
        <div>
          <label>Phone</label>
          <input
            type="tel"
            className="w-full p-2 border rounded"
            {...register("phone", {
              required: "Phone number is required",
              pattern: {
                value: /^[0-9]{10}$/,
                message: "Enter valid 10-digit number",
              },
            })}
          />
          {errors.phone && (
            <p className="text-red-500">{errors.phone.message as string}</p>
          )}

          {!phoneOtpSent && (
            <button
              type="button"
              onClick={handleSendPhoneOtp}
              disabled={loadingPhoneOtp || !phone}
              className="mt-2 text-sm underline text-blue-600"
            >
              {loadingPhoneOtp ? "Sending..." : "Send OTP"}
            </button>
          )}

          {phoneOtpSent && !phoneOtpVerified && (
            <>
              <input
                className="w-full mt-2 p-2 border rounded"
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
            </>
          )}

          {phoneOtpVerified && (
            <p className="text-green-600 text-sm mt-1">Phone verified ✅</p>
          )}
        </div>

        <div>
          <label>Course</label>
          <input
            className="w-full p-2 border rounded"
            {...register("course", { required: "Course is required" })}
          />
          {errors.course && (
            <p className="text-red-500">{errors.course.message as string}</p>
          )}
        </div>

        <div>
          <label>Rating</label>
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

        <div>
          <label>Comments</label>
          <textarea
            className="w-full p-2 border rounded"
            {...register("comments")}
          />
        </div>

        {error && <p className="text-red-500">{error}</p>}

        <button
          type="submit"
          className={`bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 ${
            (!emailOtpVerified || !phoneOtpVerified) && "cursor-not-allowed"
          }`}
        >
          Submit Feedback
        </button>
      </form>

      {/* Recaptcha Container */}
      <div id="recaptcha-container" />
    </div>
  );
}

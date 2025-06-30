// src/pages/FeedbackForm.tsx
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../utils/firebase";
import { useForm } from "react-hook-form";
import { sendEmailOtp } from "../utils/sendOtp"; 
import { verifyEmailOtp } from "../utils/verifyOtp";

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
const [loadingOtp, setLoadingOtp] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const email = watch("email"); // This will reactively give you the email entered

  useEffect(() => {
    const fetchForm = async () => {
      if (!id) return;
      const docRef = doc(db, "workshops", id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists() || !docSnap.data()?.isActive) {
        setInvalid(true);
      } else {
        setFormData(docSnap.data());
      }
      setLoading(false);
    };

    fetchForm();
  }, [id]);

  const handleSendOtp = async () => {
  try {
    setLoadingOtp(true);
    const result = await sendEmailOtp(email); // email is your state
    if (result.success) {
      setEmailOtpSent(true);
      alert("OTP sent to your email");
    }
  } catch (err) {
    alert("Failed to send OTP");
  } finally {
    setLoadingOtp(false);
  }
};


const handleVerifyEmailOtp = async () => {
  try {
    const result = await verifyEmailOtp(email, emailOtpInput);
    if (result.success) {
      setEmailOtpVerified(true);
      alert("Email verified!");
    }
  } catch (err) {
    alert("Invalid or expired OTP.");
  }
};


  const onSubmit = async (data: any) => {
    setError("");

    try {
      const feedbackRef = collection(db, "feedbacks");

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

      await addDoc(feedbackRef, {
        ...data,
        formId: id,
        submittedAt: serverTimestamp(),
      });

      setSubmitted(true);
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
         {errors.name && typeof errors.name.message === "string" && (
  <p className="text-red-500">{errors.name.message}</p>
)}

        </div>

        {/* <div>
          <label>Email</label>
          <input
            type="email"
            className="w-full p-2 border rounded"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^\S+@\S+$/i,
                message: "Invalid email format",
              },
            })}
          />
          {errors.email && typeof errors.email.message === "string" && (
  <p className="text-red-500">{errors.email.message}</p>
)}

        </div> */}
        <div>
  <label>Email</label>
  <input
    type="email"
    className="w-full p-2 border rounded"
    {...register("email", {
      required: "Email is required",
      pattern: {
        value: /^\S+@\S+$/i,
        message: "Invalid email format",
      },
    })}
  />
  {errors.email && (
    <p className="text-red-500">{errors.email.message as string}</p>
  )}

  {!emailOtpSent && (
    <button
      type="button"
      className="mt-2 text-sm text-blue-600 underline cursor-pointer"
      onClick={handleSendOtp}
      disabled={loadingOtp || !email}
    >
      {loadingOtp ? "Sending..." : "Send OTP"}
    </button>
  )}

  {emailOtpSent && !emailOtpVerified && (
  <>
    <input
      type="text"
      placeholder="Enter OTP"
      className="w-full mt-2 p-2 border rounded"
      value={emailOtpInput}
      onChange={(e) => setEmailOtpInput(e.target.value)}
    />
    <button
      type="button"
      className="mt-2 text-sm text-green-600 underline cursor-pointer"
      onClick={handleVerifyEmailOtp}
      disabled={!emailOtpInput}
    >
      Verify OTP
    </button>
  </>
)}
{emailOtpVerified && (
  <p className="text-green-600 text-sm mt-1">Email verified ✅</p>
)}

</div>


        <div>
          <label>Phone</label>
          <input
            type="tel"
            className="w-full p-2 border rounded"
            {...register("phone", {
              required: "Phone number is required",
              pattern: {
                value: /^[0-9]{10}$/,
                message: "Enter a valid 10-digit phone number",
              },
            })}
          />
          {errors.phone && typeof errors.phone.message === "string" && (
  <p className="text-red-500">{errors.phone.message}</p>
)}

        </div>

        <div>
          <label>Course</label>
          <input
            className="w-full p-2 border rounded"
            {...register("course", { required: "Course is required" })}
          />
          {errors.course && typeof errors.course.message === "string" && (
  <p className="text-red-500">{errors.course.message}</p>
)}

        </div>

        <div>
          <label>Rating</label>
          <select
            className="w-full p-2 border rounded"
            defaultValue="5"
            {...register("rating", { required: "Rating is required" })}
          >
            <option value="5">Excellent (5)</option>
            <option value="4">Very Good (4)</option>
            <option value="3">Good (3)</option>
            <option value="2">Fair (2)</option>
            <option value="1">Poor (1)</option>
          </select>
        </div>

        <div>
          <label>Comments (Optional)</label>
          <textarea
            className="w-full p-2 border rounded"
            {...register("comments")}
          />
        </div>
        {/* <div>
  <label>Email</label>
  <input
    type="email"
    required
    className="w-full p-2 border rounded"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
  />
  {!emailOtpSent && (
    <button
      type="button"
      className="mt-2 text-sm text-blue-600 underline"
      onClick={handleSendOtp}
      disabled={loadingOtp || !email}
    >
      {loadingOtp ? "Sending..." : "Send OTP"}
    </button>
  )}
</div> */}


        {error && <p className="text-red-500">{error}</p>}

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Submit Feedback
        </button>
      </form>
    </div>
  );
}

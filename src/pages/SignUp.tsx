import { useForm } from "react-hook-form";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Signup() {
  const { register, handleSubmit } = useForm();
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const onSubmit = async (data: any) => {
    try {
      // 1. Create user with email/password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      const user = userCredential.user;

      // 2. Optionally update profile
      await updateProfile(user, {
        displayName: data.name,
        photoURL: "https://avatars.githubusercontent.com/u/104457146?v=4", // optional
      });

      // 3. Save role in Firestore
      await setDoc(doc(db, "users", user.uid), {
        email: data.email,
        displayName: data.name,
        role: "admin", // default role
      });

      // 4. Redirect to admin dashboard
      navigate("/admin");
    } catch (err: any) {
      setErrorMessage("Signup failed: " + err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-md mx-auto mt-20">
      <h2 className="text-xl font-bold mb-4">Admin Sign Up</h2>

      <input
        {...register("name")}
        placeholder="Full Name"
        className="mb-2 w-full p-2 border"
      />

      <input
        {...register("email")}
        placeholder="Email"
        className="mb-2 w-full p-2 border"
      />

      <input
        {...register("password")}
        type="password"
        placeholder="Password"
        className="mb-2 w-full p-2 border"
      />

      <p className="text-red-500">{errorMessage}</p>

      <button
        type="submit"
        className="bg-green-600 hover:bg-green-700 cursor-pointer text-white px-4 py-2"
      >
        Sign Up
      </button>
    </form>
  );
}

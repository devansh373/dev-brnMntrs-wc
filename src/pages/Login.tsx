// src/pages/Login.tsx
import { onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";

export default function Login() {
  const { register, handleSubmit } = useForm();
  const [errorMessage, setErrorMessage] = useState("")
  const navigate = useNavigate();

 //  const { user, role, loading } = useAuth();

  // if (loading) return <div>Loading...</div>;
  // if (!user || role !== "admin") 

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (user) => {
//       if (user) {
//         // const { uid, email, displayName } = user;
//         console.log(user);
//         // User is signed in, redirect to the home page
        
//         navigate("/admin");
//       } else {
//         // User is signed out, redirect to the login page
//         console.log("User is signed out");
        
//         navigate("/");
//       }
//     });

//     return () => unsubscribe(); // Cleanup subscription on unmount
//   }, []);
  const onSubmit = async (data: any) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      const user = userCredential.user;

      // Check role in Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists() && userDoc.data().role === "admin") {
        navigate("/admin");
      } else {
        alert("You are not authorized");
      }
    } catch (err: any) {
      setErrorMessage("Login failed: " + err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-md mx-auto mt-20">
      <h2 className="text-xl font-bold mb-4">Admin Login</h2>
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
      <button type="submit" className="bg-blue-600 hover:bg-blue-700 cursor-pointer text-white px-4 py-2">
        Login
      </button>
    </form>
  );
}

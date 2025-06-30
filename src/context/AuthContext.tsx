// src/context/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged} from "firebase/auth";
import type { User} from "firebase/auth";
import { auth, db } from "../utils/firebase";
import { doc, getDoc } from "firebase/firestore";

// Define the context shape
interface AuthContextType {
  user: User | null;
  role: string | null;
  loading: boolean;
}

// Create the context
const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: true,
});

// Context Provider
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        const docRef = doc(db, "users", firebaseUser.uid);
        const userSnap = await getDoc(docRef);
        if (userSnap.exists()) {
          setRole(userSnap.data().role || null);
        } else {
          setRole(null);
        }
      } else {
        setRole(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to access auth context
export const useAuth = () => useContext(AuthContext);

import { signOut } from "firebase/auth";
import { auth } from "../utils/firebase";
import { useNavigate } from "react-router-dom";

type Props = {};

const AdminDashboard = (props: Props) => {
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      await signOut(auth); // ✅ clears Firebase session
      navigate("/login"); // ⏩ go to login page
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  return (
    <div>
      <nav>
        <button onClick={handleLogout}>Log Out</button>
      </nav>
    </div>
  );
};

export default AdminDashboard;

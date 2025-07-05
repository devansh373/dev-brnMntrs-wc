import { Outlet, NavLink } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../utils/firebase"; // adjust the path if needed
import { useNavigate } from "react-router-dom";

export default function AdminLayout() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login"); // or your admin login route
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Failed to logout");
    }
  };
  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white p-4">
        <h2 className="text-xl font-bold mb-6">Admin Panel</h2>
        <nav className="flex flex-col gap-2">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              `px-2 py-1 rounded transition-colors ${
                isActive
                  ? "text-blue-400 font-bold"
                  : "text-white hover:text-blue-300 hover:bg-gray-800"
              }`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/admin/create"
            className={({ isActive }) =>
              `px-2 py-1 rounded transition-colors ${
                isActive
                  ? "text-blue-400 font-bold"
                  : "text-white hover:text-blue-300 hover:bg-gray-800"
              }`
            }
          >
            Create New Form
          </NavLink>
          <NavLink
            to="/admin/certificate-template"
            className={({ isActive }) =>
              `px-2 py-1 rounded transition-colors ${
                isActive
                  ? "text-blue-400 font-bold"
                  : "text-white hover:text-blue-300 hover:bg-gray-800"
              }`
            }
          >
            Certificate Template
          </NavLink>
          </nav>

          <button
            onClick={handleLogout}
            className="mt-6 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm cursor-pointer"
          >
            Logout
          </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 bg-gray-100">
        <Outlet />
      </main>
    </div>
  );
}

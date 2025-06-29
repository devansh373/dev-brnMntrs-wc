import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { useState } from "react";

const App = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth(); // optional: hide login button when logged in

  return (
    <div>
      <header className="p-4 flex justify-between items-center bg-gray-800 text-white">
        <h1 className="text-xl font-bold">Workshop System</h1>

        {!user && location.pathname === "/" && (
          <button
            onClick={() => navigate("/login")}
            className="bg-blue-600 px-4 py-2 rounded cursor-pointer hover:bg-blue-700"
          >
            Login
          </button>
        )}
      </header>

      {/* Render the page-specific component */}
      <main className="p-4">
        <Outlet />
      </main>
    </div>
  );
};

export default App;

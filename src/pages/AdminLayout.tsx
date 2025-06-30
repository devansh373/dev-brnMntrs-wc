import { Outlet, NavLink } from "react-router-dom";

export default function AdminLayout() {
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
              isActive ? "text-blue-400 font-bold" : "text-white"
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/admin/create"
            className={({ isActive }) =>
              isActive ? "text-blue-400 font-bold" : "text-white"
            }
          >
            Create New Form
          </NavLink>
          <NavLink
            to="/admin/certificate-template"
            className={({ isActive }) =>
              isActive ? "text-blue-400 font-bold" : "text-white"
            }
          >
            Certificate Template
          </NavLink>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 bg-gray-100">
        <Outlet />
      </main>
    </div>
  );
}

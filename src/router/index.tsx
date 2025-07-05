// src/router/index.tsx
import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Login from "../pages/Login";
// import AdminDashboard from "../pages/FormBuilder";
import ProtectedRoute from "../components/ProtectedRoute";
import PublicRoute from "../components/PublicRoute";
import AdminHome from "../pages/AdminHome"; // new dashboard page
import FormBuilder from "../pages/FormBuilder"; // previously AdminDashboard
import AdminLayout from "../pages/AdminLayout";
import StudentFeedbackForm from "../pages/StudentFeedbackForm";
import CertificateManager from "../pages/CertificateManager";
import CheckSubmissions from "../pages/CheckSubmissions";
import Landing from "../pages/Landing";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index:true,
        element: (
          <Landing/>
        ),
      },
      {
        path: "login",
        element: (
          <PublicRoute>
            <Login />
          </PublicRoute>
        ),
      },
      {
        path: "admin",
        element: (
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        ), // has <Outlet />
        children: [
          {
            index: true, // matches /admin
            element: <AdminHome />, // dashboard list, analytics etc.
          },
          {
            path: "create",
            element: <FormBuilder />, // your current form builder logic
          },
          {
            path:"certificate-template",
            element:<CertificateManager/>
          },
          {
            path:"check-submissions",
            element:<CheckSubmissions/>
          }
        ],
      },
      {
        path: "feedback/:id",
        element: <StudentFeedbackForm />, // No auth protection, accessible via link
      },
    ],
  },
]);

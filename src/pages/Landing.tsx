import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="text-center py-20 px-4">
      <h2 className="text-4xl font-bold mb-4 text-gray-800">
        Workshop Feedback & Certificate System
      </h2>
      <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
        Submit your feedback and automatically receive a verified participation certificate via Email and WhatsApp.
      </p>

      <div className="flex justify-center gap-6 flex-wrap">
        

        <button
          onClick={() => navigate("/login")}
          className="border border-blue-600 text-blue-600 px-6 py-3 rounded hover:bg-blue-50 cursor-pointer"
        >
          Admin Login
        </button>
      </div>

      <div className="mt-16 text-left max-w-3xl mx-auto grid gap-6 md:grid-cols-2">
        <div className="border p-4 rounded shadow-sm">
          <h3 className="font-semibold text-lg">🔐 OTP Verification</h3>
          <p className="text-sm text-gray-600 mt-1">
            Ensure authenticity using both email and phone OTPs.
          </p>
        </div>

        <div className="border p-4 rounded shadow-sm">
          <h3 className="font-semibold text-lg">📄 PDF Certificate Generation</h3>
          <p className="text-sm text-gray-600 mt-1">
            Auto-generate personalized certificates from uploaded templates.
          </p>
        </div>

        <div className="border p-4 rounded shadow-sm">
          <h3 className="font-semibold text-lg">📬 Delivery via Email & WhatsApp</h3>
          <p className="text-sm text-gray-600 mt-1">
            Instantly send certificates to participants after feedback.
          </p>
        </div>

        <div className="border p-4 rounded shadow-sm">
          <h3 className="font-semibold text-lg">📊 Admin Panel</h3>
          <p className="text-sm text-gray-600 mt-1">
            Monitor feedback, manage forms, and handle certificates.
          </p>
        </div>
      </div>
    </div>
  );
}

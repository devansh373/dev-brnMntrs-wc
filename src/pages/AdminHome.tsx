import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../utils/firebase";
import Papa from "papaparse";
import { Link } from "react-router-dom";

export default function AdminHome() {
  const [workshops, setWorkshops] = useState<any[]>([]);
  const [selectedWorkshop, setSelectedWorkshop] = useState("");
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [formURL, setFormURL] = useState("");

  useEffect(() => {
    const fetchWorkshops = async () => {
      const snapshot = await getDocs(collection(db, "workshops"));
      const active = snapshot.docs
        // .filter((doc) => doc.data().isActive)
        .map((doc) => ({ id: doc.id, ...doc.data() }));
      setWorkshops(active);
    };
    fetchWorkshops();
  }, []);

  useEffect(() => {
    fetchFormURL();
  }, [selectedWorkshop]);
  const handleToggleWorkshopStatus = async () => {
    if (!selectedWorkshop) return;

    const workshopRef = doc(db, "workshops", selectedWorkshop);
    const current = workshops.find((w) => w.id === selectedWorkshop);
    const newStatus = !current?.isActive;

    try {
      await updateDoc(workshopRef, {
        isActive: newStatus,
      });

      setWorkshops((prev) =>
        prev.map((w) =>
          w.id === selectedWorkshop ? { ...w, isActive: newStatus } : w
        )
      );
      alert(`Workshop is now ${newStatus ? "Active" : "Inactive"}`);
    } catch (err) {
      console.error("Failed to update workshop status:", err);
      alert("Failed to toggle form status");
    }
  };

  const fetchFormURL = async () => {
    if (!selectedWorkshop) return;
    const snapshot = await getDoc(doc(db, "workshops", selectedWorkshop));
    if (snapshot.exists()) {
      const data = snapshot.data();
      setFormURL(data?.formURL || "");
    }
  };
  const fetchSubmissions = async () => {
    if (!selectedWorkshop) return;

    const q = query(
      collection(db, "submissions"),
      where("formId", "==", selectedWorkshop)
    );
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setSubmissions(data);
  };

  const filteredSubmissions = submissions
    .filter(
      (s) =>
        s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((s) => (ratingFilter ? s.rating === ratingFilter : true))
    .filter((s) =>
      courseFilter
        ? s.course?.toLowerCase().includes(courseFilter.toLowerCase())
        : true
    );
  const total = filteredSubmissions.length;

  const averageRating =
    filteredSubmissions.reduce((sum, s) => sum + Number(s.rating || 0), 0) /
    (total || 1);

  const certsSent = filteredSubmissions.filter((s) => s.certificateURL).length;

  const exportToCSV = (data: any[], fileName: string) => {
    const csvData = data.map((s) => ({
      Name: s.name,
      Email: s.email,
      Phone: s.phone,
      Course: s.course,
      Rating: s.rating,
      Comments: s.comments,
      Certificate: s.certificateURL ?? "Not Generated",
      SubmittedAt: s.submittedAt?.toDate().toLocaleString?.() ?? "-",
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportAll = () => {
    exportToCSV(submissions, `all_submissions_${selectedWorkshop}.csv`);
  };

  const handleExportFiltered = () => {
    exportToCSV(
      filteredSubmissions,
      `filtered_submissions_${selectedWorkshop}.csv`
    );
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="bg-white shadow rounded p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          📋 Manage Workshops
        </h1>
        <select
          className="w-full border rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={selectedWorkshop}
          onChange={(e) => setSelectedWorkshop(e.target.value)}
        >
          <option value="">-- Select Workshop --</option>
          {workshops.map((ws) => (
            <option key={ws.id} value={ws.id}>
              {ws.workshopName} ({ws.college})
            </option>
          ))}
        </select>
      </div>

      {selectedWorkshop && (
        <>
          <div className="bg-white shadow rounded p-6 flex flex-wrap gap-4 items-center">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition cursor-pointer"
              onClick={fetchSubmissions}
            >
              Load Submissions
            </button>

            <button
              onClick={handleToggleWorkshopStatus}
              className={`px-4 py-2 rounded text-white transition cursor-pointer ${
                workshops.find((w) => w.id === selectedWorkshop)?.isActive
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {workshops.find((w) => w.id === selectedWorkshop)?.isActive
                ? "Deactivate Form"
                : "Activate Form"}
            </button>

            {formURL && (
              <div className="text-sm">
                <strong>🔗 Form Link:</strong>{" "}
                <a
                  href={formURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  {formURL}
                </a>
              </div>
            )}
          </div>

          <div className="bg-white shadow rounded p-6 space-y-4">
            <div className="flex flex-wrap gap-4">
              <input
                type="text"
                placeholder="🔍 Search by name or email"
                className="p-2 border rounded flex-1 min-w-[200px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select
                className="p-2 border rounded cursor-pointer"
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
              >
                <option value="">⭐ All Ratings</option>
                <option value="5">Excellent (5)</option>
                <option value="4">Very Good (4)</option>
                <option value="3">Good (3)</option>
                <option value="2">Fair (2)</option>
                <option value="1">Poor (1)</option>
              </select>
              <input
                type="text"
                placeholder="🎓 Filter by course"
                className="p-2 border rounded flex-1 min-w-[150px]"
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
              />
            </div>

            {filteredSubmissions.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm bg-gray-50 p-4 rounded border">
                <div>
                  <strong>Total:</strong> {total}
                </div>
                <div>
                  <strong>Average Rating:</strong> {averageRating.toFixed(1)}
                </div>
                <div>
                  <strong>Certificates Sent:</strong> {certsSent}
                </div>
              </div>
            )}

            {filteredSubmissions.length > 0 && (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full table-auto border rounded overflow-hidden">
                    <thead className="bg-gray-100 text-left">
                      <tr>
                        <th className="p-2">Name</th>
                        <th className="p-2">Email</th>
                        <th className="p-2">Rating</th>
                        <th className="p-2">Certificate</th>
                        <th className="p-2">Submitted At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSubmissions.map((s, idx) => (
                        <tr
                          key={s.id}
                          className={`${
                            idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                          } hover:bg-blue-50`}
                        >
                          <td className="p-2">{s.name}</td>
                          <td className="p-2">{s.email}</td>
                          <td className="p-2">{s.rating}</td>
                          <td className="p-2">
                            {s.certificateURL ? (
                              <a
                                href={s.certificateURL}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-600 underline"
                              >
                                View
                              </a>
                            ) : (
                              <span className="text-red-600">
                                Not Generated
                              </span>
                            )}
                          </td>
                          <td className="p-2 text-sm">
                            {s.submittedAt?.toDate().toLocaleString?.() ?? "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex gap-4 justify-end mt-4">
                  <button
                    onClick={handleExportAll}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded cursor-pointer"
                  >
                    📁 Export All
                  </button>
                  <button
                    onClick={handleExportFiltered}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded cursor-pointer"
                  >
                    ✅ Export Filtered
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

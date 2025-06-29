import { useState } from "react";
import Editor from "../components/Editor"; // Adjust the path if needed

export default function AdminDashboard() {
  const [college, setCollege] = useState("");
  const [workshopName, setWorkshopName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [instructions, setInstructions] = useState(""); // <== Editor data
  const [formStatus, setFormStatus] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({
      college,
      workshopName,
      date,
      time,
      instructions,
      formStatus,
    });
    // TODO: Save to Firestore
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 border rounded max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Create Workshop Feedback Form</h1>

      <label>College Name</label>
      <input
        className="w-full p-2 border mb-2"
        value={college}
        onChange={(e) => setCollege(e.target.value)}
      />

      <label>Workshop Name</label>
      <input
        className="w-full p-2 border mb-2"
        value={workshopName}
        onChange={(e) => setWorkshopName(e.target.value)}
      />

      <div className="flex gap-4">
        <div className="flex-1">
          <label>Date</label>
          <input
            type="date"
            className="w-full p-2 border mb-2"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div className="flex-1">
          <label>Time</label>
          <input
            type="time"
            className="w-full p-2 border mb-2"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>
      </div>

      <label>Instructions</label>
      <Editor content={instructions} setContent={setInstructions} />

      <div className="mt-4">
        <label>Form Status:</label>
        <button
          type="button"
          className={`ml-2 px-4 py-1 rounded ${
            formStatus ? "bg-green-500 text-white" : "bg-gray-300"
          }`}
          onClick={() => setFormStatus((prev) => !prev)}
        >
          {formStatus ? "Active" : "Inactive"}
        </button>
      </div>

      <button
        type="submit"
        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
      >
        Create Form
      </button>
    </form>
  );
}

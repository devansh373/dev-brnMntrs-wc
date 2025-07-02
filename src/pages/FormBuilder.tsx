import { useState } from "react";
import Editor from "../components/Editor"; // Adjust the path if needed
import { addDoc, collection, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../utils/firebase";
import { v4 as uuidv4 } from "uuid";
import TimePicker from "react-time-picker";
import "react-time-picker/dist/TimePicker.css";
import "react-clock/dist/Clock.css";
import { formatTime } from "../utils/helper";
import { Link } from "react-router-dom";

export default function FormBuilder() {
  const [college, setCollege] = useState("");
  const [workshopName, setWorkshopName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState<string>("10:00 AM");
  const [instructions, setInstructions] = useState(""); // <== Editor data
  const [formStatus, setFormStatus] = useState(false);
  const [formURL, setFormURL] = useState("");
const [copied, setCopied] = useState(false);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = uuidv4(); // Generate unique ID for form

    const formData = {
      id,
      college,
      workshopName,
      date,
      time,
      instructions,
      isActive: formStatus,
      createdAt: serverTimestamp(),
      formURL: `${window.location.origin}/feedback/${id}`,
    };
    console.log(formData);

    try {
      await setDoc(doc(db, "workshops", id), formData);
      setFormURL(formData.formURL);


      alert("Workshop created successfully!");

      // Clear form
      setCollege("");
      setWorkshopName("");
      setDate("");
      setTime("");
      setInstructions("");
      setFormStatus(false);
    } catch (error) {
      console.error("Error saving form:", error);
      alert("Failed to save the form.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 border rounded max-w-2xl mx-auto"
    >
      <h1 className="text-2xl font-bold mb-4">Create Workshop Feedback Form</h1>

      <label>College Name</label>
      <input
        className="w-full p-2 border mb-2"
        value={college}
        onChange={(e) => setCollege(e.target.value)}
        required
      />

      <label>Workshop Name</label>
      <input
        className="w-full p-2 border mb-2"
        value={workshopName}
        onChange={(e) => setWorkshopName(e.target.value)}
        required
      />

      <div className="flex gap-4">
        <div className="flex-1">
          <label>Date</label>
          <input
            type="date"
            className="w-full p-2 border mb-2"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div className="flex-1 min-w-[100px]">
          <label>Time</label>
          <TimePicker
            onChange={(value) => {
              // value && console.log(formatTime(value));
              value && setTime(formatTime(value));
            }}
            value={time}
            disableClock
            format="hh:mm a"
            locale="en-US" // ✅ Forces 12-hour AM/PM format
            className="w-full mb-2"
            required
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
      {formURL && (
  <div className="mt-4 flex items-center gap-4">
    <Link to={formURL} className="text-sm text-gray-700 truncate">{formURL}</Link>
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(formURL);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="bg-gray-800 text-white px-3 py-1 rounded"
    >
      {copied ? "Copied!" : "Copy Link"}
    </button>
  </div>
)}

    </form>
  );
}

import { useState } from "react";
import Editor from "../components/Editor"; // Adjust the path if needed
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { v4 as uuidv4 } from "uuid";
import TimePicker from "react-time-picker";
import "react-time-picker/dist/TimePicker.css";
import "react-clock/dist/Clock.css";
import { formatTime } from "../utils/helper";

export default function FormBuilder() {
  const [college, setCollege] = useState("");
  const [workshopName, setWorkshopName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState<string>("10:00 AM");
  const [instructions, setInstructions] = useState(""); // <== Editor data
  const [formStatus, setFormStatus] = useState(false);

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
      await addDoc(collection(db, "workshops"), formData);
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
        <div className="flex-1 min-w-[100px]">
          <label>Time</label>
          <TimePicker
            onChange={(value) => {
              // value && console.log(formatTime(value));
               value && setTime(formatTime(value))}}
            value={time}
            disableClock
            format="hh:mm a"
            locale="en-US" // ✅ Forces 12-hour AM/PM format
            className="w-full mb-2"
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

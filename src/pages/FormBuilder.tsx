import { useState } from "react";
import Editor from "../components/Editor";
import {  doc, serverTimestamp, setDoc } from "firebase/firestore";
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
  const [instructions, setInstructions] = useState("");
  const [formStatus, setFormStatus] = useState(false);
  const [formURL, setFormURL] = useState("");
  const [copied, setCopied] = useState(false);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!college.trim().match(/^[A-Za-z\s]{2,}$/)) {
      newErrors.college = "College name must contain only letters and spaces (min 2 chars).";
    }
    if (!workshopName.trim().match(/^[\w\s-]{2,}$/)) {
      newErrors.workshopName = "Workshop name must contain letters, numbers, spaces, or dashes.";
    }
    if (!date) {
      newErrors.date = "Date is required.";
    }
    if (!time) {
      newErrors.time = "Time is required.";
    }
    if (!instructions.trim()) {
      newErrors.instructions = "Instructions are required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const id = uuidv4();
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

    try {
      await setDoc(doc(db, "workshops", id), formData);
      setFormURL(formData.formURL);

      alert("Workshop created successfully!");
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
    <form onSubmit={handleSubmit} className="p-6 border rounded max-w-2xl mx-auto shadow bg-white">
      <h1 className="text-2xl font-bold mb-6 text-center">Create Workshop Feedback Form</h1>

      <label className="block font-medium">College Name</label>
      <input
        className="w-full p-2 border rounded mb-1 focus:outline-blue-500"
        value={college}
        onChange={(e) => setCollege(e.target.value)}
      />
      {errors.college && <p className="text-red-500 text-sm mb-2">{errors.college}</p>}

      <label className="block font-medium">Workshop Name</label>
      <input
        className="w-full p-2 border rounded mb-1 focus:outline-blue-500"
        value={workshopName}
        onChange={(e) => setWorkshopName(e.target.value)}
      />
      {errors.workshopName && <p className="text-red-500 text-sm mb-2">{errors.workshopName}</p>}

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block font-medium">Date</label>
          <input
            type="date"
            className="w-full p-2 border rounded mb-1 focus:outline-blue-500"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          {errors.date && <p className="text-red-500 text-sm mb-2">{errors.date}</p>}
        </div>
        <div className="flex-1 min-w-[100px]">
          <label className="block font-medium">Time</label>
          <TimePicker
            onChange={(value) => value && setTime(formatTime(value))}
            value={time}
            disableClock
            format="hh:mm a"
            locale="en-US"
            className="w-full mb-2"
          />
          {errors.time && <p className="text-red-500 text-sm mb-2">{errors.time}</p>}
        </div>
      </div>

      <label className="block font-medium">Instructions</label>
      <Editor content={instructions} setContent={setInstructions} />
      {errors.instructions && <p className="text-red-500 text-sm mt-1">{errors.instructions}</p>}

      <div className="mt-4">
        <label className="font-medium">Form Status:</label>
        <button
          type="button"
          className={`ml-2 px-4 py-1.5 rounded transition cursor-pointer ${
            formStatus ? "bg-green-500 text-white" : "bg-gray-300"
          }`}
          onClick={() => setFormStatus((prev) => !prev)}
        >
          {formStatus ? "Active" : "Inactive"}
        </button>
      </div>

      <button
        type="submit"
        className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition cursor-pointer"
      >
        Create Form
      </button>

      {formURL && (
        <div className="mt-6 flex items-center gap-4">
          <Link to={formURL} className="text-sm text-blue-700 underline truncate max-w-[70%]">
            {formURL}
          </Link>
          <button
            type="button"
            onClick={async () => {
              await navigator.clipboard.writeText(formURL);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="bg-gray-800 text-white px-3 py-1 rounded cursor-pointer"
          >
            {copied ? "Copied!" : "Copy Link"}
          </button>
        </div>
      )}
    </form>
  );
}

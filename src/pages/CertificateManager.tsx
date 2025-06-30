import { useState, useEffect } from "react";
import { db, storage } from "../utils/firebase";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  Timestamp,
} from "firebase/firestore";

export default function CertificateManager() {
  const [file, setFile] = useState<File | null>(null);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

//   const uploadTemplate = async () => {
//     if (!selectedWorkshop) return alert("Please select a workshop");

//     if (!file) return alert("Please choose a file");

//     setLoading(true);
//     try {
//       const storageRef = ref(storage, `certificateTemplates/${file.name}`);
//       await uploadBytes(storageRef, file);
//       const downloadURL = await getDownloadURL(storageRef);

//       await addDoc(collection(db, "certificateTemplates"), {
//         fileName: file.name,
//         downloadURL,
//         uploadedAt: Timestamp.now(),
//       });

//       setFile(null);
//       fetchTemplates();
//       alert("Template uploaded");
//     } catch (error) {
//       console.error("Upload error:", error);
//       alert("Failed to upload");
//     } finally {
//       setLoading(false);
//     }
//   };


const uploadTemplate = async () => {
  if (!file) return alert("Please choose a file");
  if (!selectedWorkshop) return alert("Please select a workshop");

  setLoading(true);
  try {
    // Check if one already exists for this workshop
    const snapshot = await getDocs(collection(db, "certificateTemplates"));
    const existing = snapshot.docs.find(
      (doc) => doc.data().workshopId === selectedWorkshop
    );

    // Upload file to Storage
    const storageRef = ref(storage, `certificateTemplates/${selectedWorkshop}.pdf`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    if (existing) {
      // Replace existing template
      await deleteDoc(doc(db, "certificateTemplates", existing.id));
    }

    await addDoc(collection(db, "certificateTemplates"), {
      workshopId: selectedWorkshop,
      fileName: `${selectedWorkshop}.pdf`,
      downloadURL,
      uploadedAt: Timestamp.now(),
    });

    setFile(null);
    fetchTemplates();
    alert("Template uploaded");
  } catch (error) {
    console.error("Upload error:", error);
    alert("Failed to upload");
  } finally {
    setLoading(false);
  }
};

  const fetchTemplates = async () => {
    const snapshot = await getDocs(collection(db, "certificateTemplates"));
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setTemplates(data);
  };

  const deleteTemplate = async (template: any) => {
    if (!window.confirm("Delete this template?")) return;
    try {
      const fileRef = ref(storage, `certificateTemplates/${template.fileName}`);
      await deleteObject(fileRef);
      await deleteDoc(doc(db, "certificateTemplates", template.id));
      fetchTemplates();
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete template");
    }
  };

  const [workshops, setWorkshops] = useState<any[]>([]);
const [selectedWorkshop, setSelectedWorkshop] = useState<string>("");

const fetchWorkshops = async () => {
  const snapshot = await getDocs(collection(db, "workshops"));
  const data = snapshot.docs
    .filter(doc => doc.data().isActive)
    .map(doc => ({ id: doc.id, ...doc.data() }));
  setWorkshops(data);
};

  useEffect(() => {
    fetchWorkshops();
    fetchTemplates();
  }, []);

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Certificate Templates</h1>

      <label className="block mb-1">Select Workshop</label>
<select
  className="w-full p-2 border rounded mb-4"
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


      <input type="file" accept="application/pdf" onChange={handleFileChange} />
      <button
        onClick={uploadTemplate}
        disabled={loading}
        className="ml-2 px-4 py-1 bg-blue-600 text-white rounded"
      >
        {loading ? "Uploading..." : "Upload"}
      </button>

      <ul className="mt-6 space-y-2">
        {templates.map((tpl) => (
          <li key={tpl.id} className="flex justify-between items-center border p-2 rounded">
            <a href={tpl.downloadURL} target="_blank" rel="noreferrer" className="text-blue-600">
              {tpl.fileName}
            </a>
            <button
              onClick={() => deleteTemplate(tpl)}
              className="text-red-600 hover:underline"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

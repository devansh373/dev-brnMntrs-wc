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
  setDoc,
} from "firebase/firestore";
import TemplateEditor from "../components/TemplateEditor";
import PdfPreview from "../components/PdfPreview";

export default function CertificateManager() {
  const [file, setFile] = useState<File | null>(null);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingEditFields, setLoadingEditFields] = useState(false);
  // const [loadingDeleteTemplate, setLoadingDeleteTemplate] = useState(false);
  const [selectedTemplateUrl, setSelectedTemplateUrl] = useState("");
  const [renderedPreviewUrl, setRenderedPreviewUrl] = useState("");
  const [workshops, setWorkshops] = useState<any[]>([]);
  const [selectedWorkshop, setSelectedWorkshop] = useState<string>("");
  const [showContainer, setShowContainer] = useState(false);


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
      const storageRef = ref(
        storage,
        `certificateTemplates/${selectedWorkshop}.pdf`
      );
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
    setLoadingEditFields(false)
  };

  const deleteTemplate = async (template: any) => {
    if (!window.confirm("Delete this template?")) return;
    try {
      // setLoadingDeleteTemplate(true)
      const fileRef = ref(storage, `certificateTemplates/${template.fileName}`);
      await deleteObject(fileRef);
      await deleteDoc(doc(db, "certificateTemplates", template.id));
      // setLoadingDeleteTemplate(false)
      fetchTemplates();
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete template");
    }
  };

  const fetchWorkshops = async () => {
    const snapshot = await getDocs(collection(db, "workshops"));
    const data = snapshot.docs
      .filter((doc) => doc.data().isActive)
      .map((doc) => ({ id: doc.id, ...doc.data() }));
    setWorkshops(data);
  };

  useEffect(() => {
    fetchWorkshops();
    fetchTemplates();
  }, []);
  

 return (
  <div className="p-6 max-w-3xl mx-auto">
    <h1 className="text-2xl font-bold mb-6">📄 Certificate Templates</h1>

    <div className="space-y-4 mb-8">
      <div>
        <label className="block font-semibold mb-1">Select Workshop</label>
        <select
          className="w-full p-2 border rounded focus:outline-none focus:ring focus:border-blue-400 cursor-pointer"
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

      <div className="flex items-center gap-4">
        <label
          htmlFor="file"
          className="cursor-pointer px-4 py-2 rounded bg-blue-900 text-white hover:bg-blue-950 transition"
        >
          Choose File
        </label>
        <input id="file" type="file" accept="application/pdf" onChange={handleFileChange} hidden />

        <button
          onClick={uploadTemplate}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition disabled:opacity-50 cursor-pointer"
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
      </div>
    </div>

    <h2 className="text-xl font-semibold mb-3">Your Templates</h2>
    <ul className="space-y-3">
      {templates.map((tpl) => (
        <li
          key={tpl.id}
          className="flex justify-between items-center border border-gray-300 p-3 rounded shadow-sm bg-white hover:shadow-md transition"
        >
          <a
            href={tpl.downloadURL}
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 hover:underline truncate w-2/3"
            title={tpl.fileName}
          >
            📎 {tpl.fileName}
          </a>
          <div className="flex items-center gap-4 text-sm">
            <button
              onClick={() => {
                setSelectedTemplateUrl(tpl.downloadURL);
                setShowContainer(true);
              }}
              className="text-blue-600 hover:underline cursor-pointer"
            >
              Edit Fields
            </button>
            <button
              onClick={() => deleteTemplate(tpl)}
              className="text-red-600 hover:underline cursor-pointer"
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>

    {selectedTemplateUrl && (
      <PdfPreview
        pdfUrl={selectedTemplateUrl}
        onRendered={(imageUrl) => setRenderedPreviewUrl(imageUrl)}
      />
    )}

    {loadingEditFields && <p>Loading...</p>}

    {renderedPreviewUrl && showContainer && !loadingEditFields && (
      <TemplateEditor
        showContainer={showContainer}
        setShowContainer={setShowContainer}
        backgroundImageUrl={renderedPreviewUrl}
        onSave={async (positions) => {
          const templateId = templates.find(
            (t) => t.workshopId === selectedWorkshop
          )?.id;

          if (!templateId) return alert("Template not found");

          await setDoc(doc(db, "certificateTemplates", templateId), {
            ...templates.find((t) => t.id === templateId),
            fieldPositions: positions,
          });

          alert("Field positions saved!");
        }}
      />
    )}
  </div>
);

}

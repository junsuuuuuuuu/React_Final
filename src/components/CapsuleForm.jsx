// src/components/CapsuleForm.jsx
import { useState } from "react";
import { db, storage } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

function CapsuleForm() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [openAt, setOpenAt] = useState("");
  const [file, setFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    let fileUrl = "";
    if (file) {
      const fileRef = ref(storage, `capsuleFiles/${file.name}`);
      await uploadBytes(fileRef, file);
      fileUrl = await getDownloadURL(fileRef);
    }

    await addDoc(collection(db, "capsules"), {
      title,
      message,
      openAt,
      fileUrl,
      createdAt: new Date(),
    });

    alert("타임캡슐이 저장되었습니다!");
    setTitle(""); setMessage(""); setOpenAt(""); setFile(null);
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card">
      <input
        type="text"
        placeholder="제목"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <textarea
        placeholder="메시지"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        required
      />
      <input
        type="date"
        value={openAt}
        onChange={(e) => setOpenAt(e.target.value)}
        required
      />
      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <button type="submit">타임캡슐 저장</button>
    </form>
  );
}

export default CapsuleForm;

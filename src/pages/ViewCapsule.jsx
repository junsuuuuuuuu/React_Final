// src/components/CapsuleForm.jsx
import { useState } from "react";
import { db, storage } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigate } from "react-router-dom";

function CapsuleForm() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [openAt, setOpenAt] = useState("");
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setFile(e.target.files[0] || null);
  };

  const sanitizeFileName = (name) => {
    const timestamp = Date.now();
    const extension = name.split('.').pop();
    const baseName = name.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_-]/g, "");
    return `${baseName}_${timestamp}.${extension}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    let fileUrl = null;

    try {
      if (file) {
        const storageRef = ref(storage, `capsule_files/${sanitizeFileName(file.name)}`);
        await uploadBytes(storageRef, file);
        fileUrl = await getDownloadURL(storageRef);
        console.log("파일 업로드 완료, URL:", fileUrl);
      }

      const docRef = await addDoc(collection(db, "capsules"), {
        title,
        message,
        openAt,
        fileUrl: fileUrl || null,
        createdAt: new Date(),
      });

      console.log("Firestore 저장 성공, doc ID:", docRef.id);

      // 저장 후 ViewCapsule로 이동
      navigate(`/capsule/${docRef.id}`);
    } catch (err) {
      console.error("저장/업로드 오류:", err);
      alert("저장 실패, 콘솔 확인");
    } finally {
      setIsLoading(false);
    }
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
        placeholder="내용"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        required
      />

      <label className="file-label">
        {file ? file.name : "사진선택 (선택 사항)"}
        <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
      </label>

      <input
        type="date"
        value={openAt}
        onChange={(e) => setOpenAt(e.target.value)}
        required
      />

      {openAt && <p className="preview-text">개봉 예정일: {openAt}</p>}

      <button type="submit" disabled={isLoading}>
        {isLoading ? "업로드 중..." : "타임캡슐 저장"}
      </button>
    </form>
  );
}

export default CapsuleForm;

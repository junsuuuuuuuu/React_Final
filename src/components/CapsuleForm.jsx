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
  
  // 💡 [수정] 단일 파일(file) 대신, 파일 배열(files)을 저장합니다.
  const [files, setFiles] = useState([]); 
  const [isLoading, setIsLoading] = useState(false); 
  
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      // 새로 선택된 파일들을 배열로 변환
      const selectedFiles = Array.from(e.target.files); 
      
      // 기존 파일 목록과 새 파일을 합칩니다.
      const newFiles = [...files, ...selectedFiles];

      // 💡 [핵심 로직] 최대 3개까지만 허용
      if (newFiles.length > 3) {
        alert("파일은 최대 3개까지만 첨부할 수 있습니다.");
        // 배열을 앞에서부터 3개까지만 잘라서 저장
        setFiles(newFiles.slice(0, 3)); 
      } else {
        setFiles(newFiles);
      }
    }
    // 파일을 비울 때는 <button onClick={() => setFiles([])}> 같은 것을 사용해야 합니다.
  };

  // 💡 파일명을 안전하게 변환 (영문+숫자+_만)
  const sanitizeFileName = (name) => {
    const timestamp = Date.now();
    const extension = name.split('.').pop();
    // 파일명에서 공백, 한글, 특수문자 제거
    const baseName = name
      .replace(/\s+/g, "_")           // 공백 → _
      .replace(/[^a-zA-Z0-9_-]/g, ""); 
    return `${baseName}_${timestamp}.${extension}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // 💡 [수정] 단일 fileUrl 대신, URL 배열을 저장합니다.
    let fileUrls = []; 

    try {
      if (files.length > 0) {
        // 모든 파일 업로드를 Promise.all로 병렬 처리
        const uploadPromises = files.map(file => {
          // 파일명 충돌 방지를 위해 파일별로 Ref 생성
          const storageRef = ref(storage, `capsule_files/${sanitizeFileName(file.name)}`);
          
          // 업로드 및 다운로드 URL 획득 작업을 Promise로 반환
          return uploadBytes(storageRef, file).then(snapshot => {
            return getDownloadURL(snapshot.ref);
          });
        });
        
        // 모든 업로드가 완료될 때까지 기다림
        fileUrls = await Promise.all(uploadPromises);
        console.log("모든 파일 업로드 완료, URLs:", fileUrls);
      }

      // 캡슐 데이터 Firestore에 저장
      const docRef = await addDoc(collection(db, "capsules"), {
        title,
        message,
        openAt,
        // 💡 [수정] fileUrls 배열을 Firestore에 저장
        fileUrls: fileUrls, 
        createdAt: new Date(),
      });

      console.log("Firestore 저장 성공, doc ID:", docRef.id, "fileUrls:", fileUrls);
      alert("타임캡슐이 저장되었습니다!");
      navigate("/");

    } catch (error) {
      console.error("저장/업로드 오류:", error);
      alert("타임캡슐 저장/업로드 실패. 콘솔과 Firebase 규칙을 확인하세요.");
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
        placeholder="메시지"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        required
      />
      
      <label className="file-label">
        {/* 💡 [수정] 파일 개수를 표시하고, 최대 개수를 알립니다. */}
        {files.length > 0 ? `사진 ${files.length}개 선택됨` : "사진 선택 (최대 3개)"}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          // 💡 [수정] multiple 속성을 추가하여 여러 파일 선택 허용
          multiple 
          style={{ display: 'none' }}
        />
      </label>

      {/* 💡 [추가] 선택된 파일 목록을 보여주는 UI */}
      {files.length > 0 && (
        <div className="file-preview">
          {files.map((file, index) => (
            <span key={index} className="file-name">{file.name}</span>
          ))}
          {/* 파일 초기화 버튼 */}
          <button type="button" onClick={() => setFiles([])} className="reset-file-button">
            X 파일 전체 삭제
          </button>
        </div>
      )}


      <input
        type="text" // 텍스트 타입으로 변경해야 placeholder가 보입니다.
        placeholder="클릭해서 개봉 날짜를 정해주세요" // 원하는 배경 문구 추가
        value={openAt}
        onChange={(e) => setOpenAt(e.target.value)}
        onFocus={(e) => (e.target.type = 'date')} // 클릭하면 날짜 선택 창이 열리도록 다시 type 변경
        onBlur={(e) => openAt === "" && (e.target.type = 'text')} // 값이 없으면 다시 text 타입으로 복구
        required
      />
      
      <button type="submit" disabled={isLoading}>
        {isLoading ? "저장 중..." : "캡슐 저장하기"}
      </button>
    </form>
  );
}

export default CapsuleForm;
// src/components/CapsuleForm.jsx
import { useState, useCallback } from "react"; // useCallback 추가
import { db, storage } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigate } from "react-router-dom";

// 💡 [최적화] 파일명 변환 함수를 컴포넌트 외부로 분리 (순수 함수)
const sanitizeFileName = (name) => {
  const timestamp = Date.now();
  const extension = name.split('.').pop();
  // 파일명에서 공백, 한글, 특수문자 제거
  const baseName = name
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_-]/g, "");
  return `${baseName}_${timestamp}.${extension}`;
};

function CapsuleForm() {
  // 기본 입력 필드 상태
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [openAt, setOpenAt] = useState("");
  
  // 파일 배열을 저장합니다.
  const [files, setFiles] = useState([]); 
  const [isLoading, setIsLoading] = useState(false); 
  
  const navigate = useNavigate();

  // 💡 [UI/UX 개선] 파일 개별 삭제 함수
  const handleRemoveFile = useCallback((indexToRemove) => {
    setFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
  }, []); // files에 의존성이 없으므로, 한 번만 생성됩니다.

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files); 
    const newFiles = [...files, ...selectedFiles];

    if (newFiles.length > 3) {
      alert("파일은 최대 3개까지만 첨부할 수 있습니다.");
      setFiles(newFiles.slice(0, 3)); 
    } else {
      setFiles(newFiles);
    }
    
    // 파일 입력 필드를 초기화하여 같은 파일을 다시 선택해도 change 이벤트가 발생하도록 함
    e.target.value = null; 
  };
  
  // 💡 [Hooks 활용] useCallback을 사용하여 제출 함수를 최적화
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setIsLoading(true);

    let fileUrls = []; 

    try {
      if (files.length > 0) {
        // 모든 파일 업로드를 Promise.all로 병렬 처리
        const uploadPromises = files.map(file => {
          const storageRef = ref(storage, `capsule_files/${sanitizeFileName(file.name)}`);
          return uploadBytes(storageRef, file).then(snapshot => getDownloadURL(snapshot.ref));
        });
        
        fileUrls = await Promise.all(uploadPromises);
      }

      // 캡슐 데이터 Firestore에 저장
      const docRef = await addDoc(collection(db, "capsules"), {
        title,
        message,
        openAt,
        fileUrls: fileUrls, 
        createdAt: new Date(),
      });

      alert("타임캡슐이 저장되었습니다!");
      navigate("/");

    } catch (error) {
      console.error("저장/업로드 오류:", error);
      alert("타임캡슐 저장/업로드 실패. 콘솔 확인.");
    } finally {
      setIsLoading(false); 
    }
  }, [files, title, message, openAt, navigate]); // 의존성 배열 명확화

  return (
    <form onSubmit={handleSubmit} className="glass-card capsule-form">
      <h3>새 타임캡슐 만들기</h3>
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
      
      <label className="file-label custom-button">
        {files.length > 0 ? `사진 ${files.length}/3개 선택됨` : "📸 사진 선택 (최대 3개)"}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          multiple 
          style={{ display: 'none' }}
        />
      </label>

      {/* 💡 [개선] 선택된 파일 목록 및 개별 삭제 UI */}
      {files.length > 0 && (
        <div className="file-preview-list">
          {files.map((file, index) => (
            <div key={index} className="file-item">
              <span className="file-name">{file.name}</span>
              <button 
                type="button" 
                onClick={() => handleRemoveFile(index)} 
                className="remove-file-button"
              >
                X
              </button>
            </div>
          ))}
          {/* 파일 전체 초기화 버튼 (필요시 사용) */}
          <button type="button" onClick={() => setFiles([])} className="reset-all-button">
            🗑️ 파일 전체 초기화
          </button>
        </div>
      )}


      <input
        type="text" 
        placeholder="클릭해서 개봉 날짜를 정해주세요"
        value={openAt}
        onChange={(e) => setOpenAt(e.target.value)}
        onFocus={(e) => (e.target.type = 'date')} 
        onBlur={(e) => openAt === "" && (e.target.type = 'text')}
        required
      />
      
      <button type="submit" disabled={isLoading}>
        {isLoading ? "⏳ 저장 중..." : "🚀 캡슐 저장하기"}
      </button>
    </form>
  );
}

export default CapsuleForm;

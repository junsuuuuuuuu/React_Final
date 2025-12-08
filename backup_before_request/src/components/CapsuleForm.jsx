// src/components/CapsuleForm.jsx
import { useState, useCallback } from "react"; // useCallback 최적화
import { db, storage } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigate } from "react-router-dom";

// 파일명 중복 방지를 위해 타임스탬프를 붙이고, 파일명은 안전한 문자만 남긴다.
const sanitizeFileName = (name) => {
  const timestamp = Date.now();
  const extension = name.split(".").pop();
  // 파일명에서 공백, 특수문자 제거
  const baseName = name
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_-]/g, "");
  return `${baseName}_${timestamp}.${extension}`;
};

const MAX_FILES = 3;
const ACCEPTED_TYPES = ["image/", "audio/"];

function CapsuleForm() {
  // 기본 입력 필드 상태
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [openAt, setOpenAt] = useState("");

  // 파일 배열과 업로드 상태
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fileError, setFileError] = useState("");

  const navigate = useNavigate();

  // 파일 개별 삭제 핸들러
  const handleRemoveFile = useCallback((indexToRemove) => {
    setFiles((prevFiles) => prevFiles.filter((_, index) => index !== indexToRemove));
  }, []); // files 의존성을 피해서 재생성 최소화

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const allowedFiles = selectedFiles.filter((file) =>
      ACCEPTED_TYPES.some((prefix) => file.type.startsWith(prefix))
    );
    const merged = [...files, ...allowedFiles];
    const limited = merged.slice(0, MAX_FILES);

    if (selectedFiles.length !== allowedFiles.length) {
      setFileError("이미지와 오디오 파일만 업로드할 수 있어요.");
    } else if (merged.length > MAX_FILES) {
      setFileError("최대 3개의 파일까지 업로드할 수 있어요.");
    } else {
      setFileError("");
    }

    setFiles(limited);

    // 같은 파일을 다시 선택해도 change 이벤트가 발생하도록 input 값을 비운다.
    e.target.value = null;
  };

  // 폼 제출
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setIsLoading(true);
      setFileError("");

      let fileUrls = [];

      try {
        if (files.length > 0) {
          // 모든 파일을 병렬 업로드
          const uploadPromises = files.map((file) => {
            const storageRef = ref(storage, `capsule_files/${sanitizeFileName(file.name)}`);
            return uploadBytes(storageRef, file).then((snapshot) =>
              getDownloadURL(snapshot.ref).then((url) => ({
                url,
                type: file.type.startsWith("audio/") ? "audio" : "image",
                name: file.name,
              }))
            );
          });

          fileUrls = await Promise.all(uploadPromises);
        }

        // 캡슐 데이터를 Firestore에 저장
        await addDoc(collection(db, "capsules"), {
          title,
          message,
          openAt,
          fileUrls: fileUrls,
          createdAt: new Date(),
        });

        alert("타임캡슐이 저장됐어요!");
        navigate("/");
      } catch (error) {
        console.error("캡슐 업로드 오류:", error);
        alert("캡슐 업로드에 실패했어요. 다시 시도해주세요.");
      } finally {
        setIsLoading(false);
      }
    },
    [files, title, message, openAt, navigate]
  ); // 의존성 배열 명확히
  return (
    <form onSubmit={handleSubmit} className="glass-card capsule-form">
      <div className="form-header-block">
        <p className="eyebrow">Time Capsule</p>
        <h3>타임캡슐 만들기</h3>
        <p className="helper-text">원하는 이미지와 음성 파일을 함께 담아보세요.</p>
      </div>

      <div className="field">
        <label className="field-label" htmlFor="title-input">
          제목
        </label>
        <input
          id="title-input"
          type="text"
          placeholder="제목을 적어주세요"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="field">
        <label className="field-label" htmlFor="message-input">
          메시지
        </label>
        <textarea
          id="message-input"
          placeholder="남기고 싶은 이야기, 들려주고 싶은 메시지를 적어주세요"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
      </div>

      <div className="field">
        <label className="field-label">첨부 파일</label>
        <label className="file-label custom-button">
          {files.length > 0
            ? `첨부 ${files.length}/3개 선택됨`
            : "사진/음성 파일 선택 (최대 3개)"}
          <input
            type="file"
            accept="image/*,audio/*"
            onChange={handleFileChange}
            multiple
            style={{ display: "none" }}
          />
        </label>
      </div>

      {/* 파일 선택/리스트 표시 영역 */}
      {files.length > 0 && (
        <div className="file-preview-list">
          {files.map((file, index) => (
            <div key={index} className="file-item">
              <div className="file-chip">
                <span className="file-type">{file.type.startsWith("audio/") ? "AUDIO" : "IMAGE"}</span>
                <span className="file-name">{file.name}</span>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveFile(index)}
                className="remove-file-button"
              >
                X
              </button>
            </div>
          ))}
          {/* 파일 전체 초기화 버튼 */}
          <button type="button" onClick={() => setFiles([])} className="reset-all-button">
            파일 모두 지우기
          </button>
        </div>
      )}

      {fileError && <p className="file-error">{fileError}</p>}

      <div className="field">
        <label className="field-label" htmlFor="open-at-input">
          개봉 예정일
        </label>
        <input
          id="open-at-input"
          type="text"
          placeholder="타임캡슐 개봉 날짜를 선택해주세요"
          value={openAt}
          onChange={(e) => setOpenAt(e.target.value)}
          onFocus={(e) => (e.target.type = "date")}
          onBlur={(e) => openAt === "" && (e.target.type = "text")}
          required
        />
      </div>

      <button type="submit" className="primary-button" disabled={isLoading}>
        {isLoading ? "올리는 중.." : "내 타임캡슐 저장하기"}
      </button>
    </form>
  );
}

export default CapsuleForm;

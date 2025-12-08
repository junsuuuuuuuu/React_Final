// src/components/CapsuleForm.jsx
import { useState, useCallback } from "react";
import { db, storage } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

// 파일명에 타임스탬프를 붙여 중복을 피하고 특수문자를 제거
const sanitizeFileName = (name) => {
  const timestamp = Date.now();
  const extension = name.split(".").pop();
  const baseName = name.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_-]/g, "");
  return `${baseName}_${timestamp}.${extension}`;
};

const MAX_FILES = 3;
const ACCEPTED_TYPES = ["image/", "audio/"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function CapsuleForm() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [openAt, setOpenAt] = useState("");

  // 파일 배열과 업로드 상태
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fileError, setFileError] = useState("");
  const [formError, setFormError] = useState("");

  const navigate = useNavigate();

  const handleRemoveFile = useCallback((indexToRemove) => {
    setFiles((prevFiles) => prevFiles.filter((_, index) => index !== indexToRemove));
  }, []);

  const handleFileChange = (e) => {
    // 파일 타입/크기 검증 후 최대 3개까지만 유지
    const selectedFiles = Array.from(e.target.files);
    const allowedFiles = selectedFiles.filter((file) =>
      ACCEPTED_TYPES.some((prefix) => file.type.startsWith(prefix))
    );
    const sizeSafeFiles = allowedFiles.filter((file) => file.size <= MAX_FILE_SIZE);
    const merged = [...files, ...sizeSafeFiles];
    const limited = merged.slice(0, MAX_FILES);

    if (selectedFiles.length !== allowedFiles.length) {
      setFileError("이미지/오디오 파일만 업로드할 수 있어요.");
    } else if (allowedFiles.length !== sizeSafeFiles.length) {
      setFileError("파일 크기는 최대 10MB까지만 업로드할 수 있어요.");
    } else if (merged.length > MAX_FILES) {
      setFileError("최대 3개의 파일까지만 업로드할 수 있어요.");
    } else {
      setFileError("");
    }

    setFiles(limited);
    e.target.value = null; // 같은 파일 재선택도 이벤트 발생하게 초기화
  };

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setIsLoading(true);
      setFileError("");
      setFormError("");

      // 필수값 및 날짜 유효성 검증
      const trimmedTitle = title.trim();
      const trimmedMessage = message.trim();
      const openDate = dayjs(openAt);

      if (!trimmedTitle || !trimmedMessage || !openAt) {
        setFormError("제목, 메시지, 개봉 예정일을 모두 입력해주세요.");
        setIsLoading(false);
        return;
      }

      if (!openDate.isValid()) {
        setFormError("개봉 예정일을 올바른 날짜로 선택해주세요.");
        setIsLoading(false);
        return;
      }

      if (openDate.isBefore(dayjs(), "day")) {
        setFormError("개봉 예정일은 오늘 이후 날짜를 선택해주세요.");
        setIsLoading(false);
        return;
      }

      let fileUrls = [];

      try {
        if (files.length > 0) {
          // 모든 파일을 병렬로 업로드하고 URL 목록을 만든다
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

        await addDoc(collection(db, "capsules"), {
          title: trimmedTitle,
          message: trimmedMessage,
          openAt,
          fileUrls,
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
  );

  return (
    <form onSubmit={handleSubmit} className="glass-card capsule-form">
      <div className="form-header-block">
        <p className="eyebrow">Time Capsule</p>
        <h3>타임캡슐 만들기</h3>
        <p className="helper-text">기억하고 싶은 이야기를 음성/이미지 파일과 함께 남겨보세요.</p>
      </div>

      <div className="field">
        <label className="field-label" htmlFor="title-input">
          제목
        </label>
        <input
          id="title-input"
          type="text"
          placeholder="제목을 입력해주세요"
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
          placeholder="미래의 나에게 남기고 싶은 메시지를 적어주세요"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
      </div>

      <div className="field">
        <label className="field-label">첨부 파일</label>
        <label className="file-label custom-button">
          {files.length > 0 ? `첨부 ${files.length}/3개 선택됨` : "사진/음성 파일 선택 (최대 3개)"}
          <input
            type="file"
            accept="image/*,audio/*"
            onChange={handleFileChange}
            multiple
            style={{ display: "none" }}
          />
        </label>
      </div>

      {/* 첨부 파일 리스트 */}
      {files.length > 0 && (
        <div className="file-preview-list">
          {files.map((file, index) => (
            <div key={index} className="file-item">
              <div className="file-chip">
                <span className="file-type">{file.type.startsWith("audio/") ? "AUDIO" : "IMAGE"}</span>
                <span className="file-name">{file.name}</span>
              </div>
              <button type="button" onClick={() => handleRemoveFile(index)} className="remove-file-button">
                X
              </button>
            </div>
          ))}
          <button type="button" onClick={() => setFiles([])} className="reset-all-button">
            첨부 파일 모두 지우기
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

      {formError && <p className="file-error">{formError}</p>}

      <button type="submit" className="primary-button" disabled={isLoading}>
        {isLoading ? "처리 중..." : "타임캡슐 저장하기"}
      </button>
    </form>
  );
}

export default CapsuleForm;

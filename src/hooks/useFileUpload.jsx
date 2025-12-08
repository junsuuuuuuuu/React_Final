// 파일 업로드 상태를 Firebase Storage 업로드로 처리하는 커스텀 훅이다.
import { useState, useRef } from "react";
import { storage } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export const useFileUpload = () => {
  const [files, setFiles] = useState([]);
  const inputRef = useRef(null); // 숨겨진 file input 제어용

  // 파일 배열에 추가(최대 3개까지 유지)
  const addFiles = (newList) => {
    setFiles(prev => [...prev, ...newList].slice(0, 3));
  };

  // 같은 파일 재선택 허용을 위해 input value 초기화
  const resetInput = () => {
    if (inputRef.current) inputRef.current.value = "";
  };

  // Storage에 순차 업로드하고 다운로드 URL을 반환
  const upload = async () => {
    const urls = [];

    for (let f of files) {
      const safe = f.name.replace(/\s+/g, "_");
      const fileRef = ref(storage, `capsule/${Date.now()}_${safe}`);
      await uploadBytes(fileRef, f);
      urls.push(await getDownloadURL(fileRef));
    }

    return urls;
  };

  return { files, addFiles, upload, setFiles, inputRef, resetInput };
};

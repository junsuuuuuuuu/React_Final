// 파일 업로드 상태와 Firebase Storage 업로드를 처리하는 커스텀 훅입니다.
import { useState, useRef } from "react";
import { storage } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export const useFileUpload = () => {
  const [files, setFiles] = useState([]);
  const inputRef = useRef(null);

  const addFiles = (newList) => {
    setFiles(prev => [...prev, ...newList].slice(0, 3));
  };

  const resetInput = () => {
    if (inputRef.current) inputRef.current.value = "";
  };

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

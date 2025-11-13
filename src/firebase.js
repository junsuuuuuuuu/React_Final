// src/firebase.jsx

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Firestore (데이터베이스)
import { getStorage } from "firebase/storage";   // Storage (파일 저장소)

// 💡 1. Firebase 콘솔에서 복사한 실제 설정 정보를 여기에 붙여넣습니다.
const firebaseConfig = {
  apiKey: "AIzaSyD8VAe0ZRqNB55R7DZDPO MZC9RPZHBJ_FE", // 실제 키 값
  authDomain: "react-final-6e81e.firebaseapp.com",
  projectId: "react-final-6e81e",
  storageBucket: "react-final-6e81e.firebasestorage.app",
  messagingSenderId: "703795060268",
  appId: "1:703795060268:web:b73467d08ed7e94f27fb89",
  measurementId: "G-0F1V5TX1HP"
};

// 2. Firebase 앱 초기화
const app = initializeApp(firebaseConfig);

// 3. 서비스 인스턴스를 내보내기
export const db = getFirestore(app);
export const storage = getStorage(app);
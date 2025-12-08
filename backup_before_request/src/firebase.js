// Firebase 앱과 Firestore, Storage를 초기화하는 설정 파일입니다.

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyD8VAe0ZRqNB55R7DZDPO MZC9RPZHBJ_FE",
  authDomain: "react-final-6e81e.firebaseapp.com",
  projectId: "react-final-6e81e",
  storageBucket: "react-final-6e81e.firebasestorage.app",
  messagingSenderId: "703795060268",
  appId: "1:703795060268:web:b73467d08ed7e94f27fb89",
  measurementId: "G-0F1V5TX1HP"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);

// src/pages/Home.jsx
import { useEffect, useState } from "react";
import { db } from "../firebase"; // DB 가져오기
import { collection, getDocs } from "firebase/firestore"; // 데이터 조회 함수
import CapsuleCard from "../components/CapsuleCard";

function Home() {
  const [capsules, setCapsules] = useState([]);

  // 캡슐 삭제 후 목록을 즉시 업데이트하는 함수
  const handleDeleteCapsule = (deletedId) => {
    setCapsules(capsules.filter(c => c.id !== deletedId));
  };
  
  // 데이터 조회
  useEffect(() => {
    const fetchCapsules = async () => {
      const snapshot = await getDocs(collection(db, "capsules"));
      setCapsules(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchCapsules();
  }, []);

  return (
    <div className="container">
      <h1>디지털 타임캡슐(테스트중 DB 테스트)</h1>
      <a href="/create" className="create-capsule-button">새 타임캡슐 만들기</a> 
      <div className="capsule-list">
        {capsules.map(c => 
          <CapsuleCard 
            key={c.id} 
            capsule={c}
            onDelete={handleDeleteCapsule} 
          />
        )}
      </div>
    </div>
  );
}

export default Home;
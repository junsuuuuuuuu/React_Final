// src/pages/Home.jsx
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import CapsuleCard from "../components/CapsuleCard";

function Home() {
  const [capsules, setCapsules] = useState([]);

  useEffect(() => {
    const fetchCapsules = async () => {
      const snapshot = await getDocs(collection(db, "capsules"));
      setCapsules(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchCapsules();
  }, []);

  return (
    <div className="container">
      <h1>🕰️ 디지털 타임캡슐</h1>
      <a href="/create">새 타임캡슐 만들기</a>
      <div className="capsule-list">
        {capsules.map(c => <CapsuleCard key={c.id} capsule={c} />)}
      </div>
    </div>
  );
}

export default Home;

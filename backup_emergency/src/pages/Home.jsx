// src/pages/Home.jsx
import { useEffect, useState, useMemo } from "react";
import { db } from "../firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore"; // 쿼리 함수 추가
import CapsuleCard from "../components/CapsuleCard";
import dayjs from "dayjs";

function Home() {
  // 홈에 보여줄 캡슐 리스트 상태
  const [capsules, setCapsules] = useState([]);
  // 정렬 기준 상태: 기본값은 개봉일 오름차순
  const [sortBy, setSortBy] = useState('openAt_asc');
  const [isLoading, setIsLoading] = useState(true);

  // 캡슐 삭제 시 리스트 업데이트
  const handleDeleteCapsule = (deletedId) => {
    setCapsules(prev => prev.filter(c => c.id !== deletedId));
  };
  
  // 데이터 조회 (컴포넌트 마운트 시 실행)
  useEffect(() => {
    const fetchCapsules = async () => {
      setIsLoading(true);
      try {
        // Firestore 쿼리를 사용해 기본 정렬로 가져온다. (최신 등록 순)
        const q = query(collection(db, "capsules"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        
        // Firestore Timestamp를 JS Date로 변환
        const fetchedCapsules = snapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data(),
          // createdAt 필드를 Date 객체로 변환해 정렬 시 편하게 처리
          createdAt: doc.data().createdAt.toDate(), 
        }));
        setCapsules(fetchedCapsules);
      } catch (error) {
        console.error("캡슐 불러오기 오류:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCapsules();
  }, []);

  // 정렬 계산 최적화
  const sortedCapsules = useMemo(() => {
    // 캡슐 배열을 복사해서 정렬
    return [...capsules].sort((a, b) => {
      // 1. 개봉일 기준 정렬
      if (sortBy.startsWith('openAt')) {
        const dateA = dayjs(a.openAt).valueOf();
        const dateB = dayjs(b.openAt).valueOf();
        // openAt_asc: 빠른 순(오름차순)
        return sortBy === 'openAt_asc' ? dateA - dateB : dateB - dateA;
      }
      // 2. 등록일 기준 정렬
      if (sortBy.startsWith('createdAt')) {
        const timeA = a.createdAt.getTime();
        const timeB = b.createdAt.getTime();
        // createdAt_desc: 최신 순(내림차순)
        return sortBy === 'createdAt_desc' ? timeB - timeA : timeA - timeB;
      }
      return 0;
    });
  }, [capsules, sortBy]); // capsules 또는 sortBy가 바뀔 때만 재계산

  if (isLoading) {
    return (
      <div className="container">
        <div className="glass-card loading-card">로딩 중..</div>
      </div>
    );
  }

  return (
    <div className="container page">
      <div className="page-header hero-card glass-card">
        <div className="hero-text">
          <p className="eyebrow">Time Capsule</p>
          <h1 className="page-title">나만의 디지털 캡슐</h1>
          <p className="page-meta">사진과 음성을 한곳에 담아두고, 열람이 가능한 시점에 다시 만나보세요.</p>
        </div>
        <div className="header-actions">
          <a href="/create" className="primary-cta">타임캡슐 만들기</a> 
          
          {/* 정렬 UI */}
          <div className="sort-control">
            <label htmlFor="sort-select">정렬 보기</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select" id="sort-select">
              <option value="openAt_asc">개봉일 빠른 순</option>
              <option value="createdAt_desc">최신 등록 순</option>
            </select>
          </div>
        </div>
      </div>

      <div className="capsule-list modern-grid">
        {/* 정렬 기준에 맞춰 렌더링된 카드 목록 */}
        {sortedCapsules.length > 0 ? (
          sortedCapsules.map(c => 
            <CapsuleCard 
              key={c.id} 
              capsule={c}
              onDelete={handleDeleteCapsule} 
            />
          )
        ) : (
          <p className="no-capsules">아직 저장된 캡슐이 없습니다.</p>
        )}
      </div>
    </div>
  );
}

export default Home;

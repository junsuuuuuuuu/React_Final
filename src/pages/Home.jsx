// src/pages/Home.jsx
import { useEffect, useState, useMemo } from "react";
import { db } from "../firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore"; // 쿼리 함수 추가
import CapsuleCard from "../components/CapsuleCard";
import dayjs from "dayjs";

function Home() {
  // 화면에 보여줄 캡슐 리스트 데이터
  const [capsules, setCapsules] = useState([]);
  // 정렬 기준 상태: 기본값은 개봉일 임박순
  const [sortBy, setSortBy] = useState('openAt_asc'); // 정렬 상태: 'openAt_asc' (가장 빨리 열리는 순)
  const [isLoading, setIsLoading] = useState(true);

  // 캡슐 삭제 후 목록을 즉시 업데이트하는 함수
  const handleDeleteCapsule = (deletedId) => {
    setCapsules(capsules.filter(c => c.id !== deletedId));
  };
  
  // 데이터 조회 (컴포넌트 마운트 시 한 번 실행)
  useEffect(() => {
    const fetchCapsules = async () => {
      setIsLoading(true);
      try {
        // Firestore 쿼리를 사용하여 기본 정렬을 적용할 수도 있습니다. (선택 사항)
        const q = query(collection(db, "capsules"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        
        // Firestore Timestamp를 JS Date로 변환하여 저장
        const fetchedCapsules = snapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data(),
          // createdAt 필드를 Date 객체로 변환하여 useMemo에서 비교 용이하게 처리
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

  // 💡 [Hooks 활용] useMemo를 활용하여 정렬 연산 최적화
  const sortedCapsules = useMemo(() => {
    // 캡슐 배열을 복사하여 정렬
    return [...capsules].sort((a, b) => {
      // 1. 개봉일 기준 정렬
      if (sortBy.startsWith('openAt')) {
        const dateA = dayjs(a.openAt).valueOf();
        const dateB = dayjs(b.openAt).valueOf();
        // openAt_asc: 빨리 열리는 순 (오름차순)
        return sortBy === 'openAt_asc' ? dateA - dateB : dateB - dateA;
      }
      // 2. 생성일 기준 정렬
      if (sortBy.startsWith('createdAt')) {
        const timeA = a.createdAt.getTime();
        const timeB = b.createdAt.getTime();
        // createdAt_desc: 최신순 (내림차순)
        return sortBy === 'createdAt_desc' ? timeB - timeA : timeA - timeB;
      }
      return 0;
    });
  }, [capsules, sortBy]); // capsules 또는 sortBy가 바뀔 때만 재계산

  if (isLoading) {
    return <div className="container">로딩 중...</div>;
  }

  return (
    <div className="container">
      <h1>디지털 타임캡슐</h1>
      <div className="controls">
        <a href="/create" className="create-capsule-button">➕ 새 타임캡슐 만들기</a> 
        
        {/* 정렬 UI 추가 */}
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
          <option value="openAt_asc">개봉일 임박순</option>
          <option value="createdAt_desc">최신 등록순</option>
        </select>
      </div>

      <div className="capsule-list">
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

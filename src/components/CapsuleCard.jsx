// src/components/CapsuleCard.jsx
import dayjs from "dayjs";
import { useState } from "react";
import { db } from "../firebase"; // DB 설정 가져오기
import { doc, deleteDoc } from "firebase/firestore"; // Firestore 삭제 함수

function CapsuleCard({ capsule, onDelete }) { 
  const [isOpened, setIsOpened] = useState(false);
  const now = dayjs();
  const openDate = dayjs(capsule.openAt);
  
  // 오늘 날짜를 포함, 미래 날짜일 경우에만 잠김 (true)
  const isLocked = now.isBefore(openDate, 'day'); 

  // 캡슐 내용 표시 상태 변경 함수
  const handleOpen = () => setIsOpened(true);
  const handleClose = () => setIsOpened(false); // 닫기 기능

  // 캡슐 삭제 로직
  const handleDelete = async () => {
    if (!window.confirm("정말로 삭제하시겠습니까?")) return;
    
    try {
      await deleteDoc(doc(db, "capsules", capsule.id)); 
      onDelete(capsule.id); // Home 컴포넌트 업데이트
    } catch (error) {
      console.error("삭제 오류:", error);
      alert("삭제 실패. 콘솔 확인.");
    }
  };

  return (
    <div className="glass-card">
      <h3>{capsule.title}</h3>
      
      {isLocked ? (
        // 🔒 잠긴 상태
        <p>🔒 {openDate.format("YYYY-MM-DD")} 에 열립니다</p>
      ) : (
        // 🔓 개봉 가능 상태
        <>
          {isOpened ? (
            // 2-A. 열린 후: 메시지, 이미지들, 삭제/닫기 버튼 표시
            <div className="opened-content">
              <p className="opened-message">{capsule.message}</p>
              
              {/* 💡 [수정] 이미지들을 감싸는 컨테이너 추가 및 map 함수로 이미지 출력 */}
              {Array.isArray(capsule.fileUrls) && capsule.fileUrls.length > 0 && (
                <div className="capsule-images-container"> 
                  {capsule.fileUrls.map((url, index) => (
                    <img 
                      key={index} 
                      src={url} 
                      alt={`첨부 이미지 ${index + 1}`} 
                      className="capsule-image" // 💡 크기를 제어할 클래스
                    />
                  ))}
                </div>
              )}
              
              <div className="button-group">
                {/* 닫기 버튼 */}
                <button 
                  onClick={handleClose} 
                  className="close-button" 
                >
                  🚪 닫기
                </button>
                {/* 삭제 버튼 */}
                <button 
                  onClick={handleDelete} 
                  className="delete-button" 
                >
                  🗑️ 삭제하기
                </button>
              </div>
            </div>
          ) : (
            // 2-B. 열기 전: '열어보기' 버튼 표시
            <button 
              onClick={handleOpen} 
              className="open-button" 
            >
              {openDate.format("YYYY-MM-DD")} 캡슐 열어보기
            </button>
          )}
        </>
      )}
    </div>
  );
}

export default CapsuleCard;
// src/components/CapsuleCard.jsx
import dayjs from "dayjs";
import { useState } from "react";
import { db } from "../firebase"; // DB 설정 불러오기
import { doc, deleteDoc } from "firebase/firestore"; // Firestore 삭제 함수

function CapsuleCard({ capsule, onDelete }) { 
  // 메시지가 열려 있는지 상태
  const [isOpened, setIsOpened] = useState(false);
  const now = dayjs();
  
  // 캡슐 개봉 예정일과 저장일
  const openDate = dayjs(capsule.openAt);
  // createdAt은 Home.jsx에서 JS Date 객체로 변환됨 (Firestore Timestamp → Date)
  // 렌더 시에는 dayjs로 다시 변환해서 사용
  const saveDate = dayjs(capsule.createdAt); 

  // 오늘 날짜 이전이면 잠금 상태(true)
  const isLocked = now.isBefore(openDate, 'day'); 

  // 캡슐 사용 시 상태 변경 함수
  const handleOpen = () => setIsOpened(true);
  const handleClose = () => setIsOpened(false); // 닫기 기능

  // 캡슐 삭제 로직
  const handleDelete = async () => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    
    try {
      await deleteDoc(doc(db, "capsules", capsule.id)); 
      onDelete(capsule.id); // Home 컴포넌트 업데이트
    } catch (error) {
      console.error("삭제 오류:", error);
      alert("삭제 실패. 다시 시도해주세요.");
    }
  };

  // 문자열/객체 형태 모두 호환되게 첨부파일 정규화
  const attachments = Array.isArray(capsule.fileUrls)
    ? capsule.fileUrls
        .map((file) => {
          if (typeof file === "string") {
            const audioMatch = /\.(mp3|m4a|wav|aac|ogg)$/i.test(file);
            return { url: file, type: audioMatch ? "audio" : "image", name: "" };
          }

          if (file && typeof file === "object") {
            const url = file.url || "";
            const audioMatch = /\.(mp3|m4a|wav|aac|ogg)$/i.test(url);
            return {
              url,
              type: file.type ? (file.type.startsWith("audio/") ? "audio" : "image") : audioMatch ? "audio" : "image",
              name: file.name || "",
            };
          }

          return null;
        })
        .filter(Boolean)
    : [];

  return (
    <div className={`glass-card capsule-card ${isLocked ? 'locked' : 'unlocked'}`}>
      <div className="card-head">
        <div className="card-titles">
          <h3>{capsule.title}</h3>
          {/* 저장일과 예정일 표기 */}
          <p className="meta">저장일: {saveDate.format("YYYY-MM-DD")}</p>
          <p className="meta">개봉 예정일: {openDate.format("YYYY-MM-DD")}</p>
        </div>
        <span className={`pill ${isLocked ? "pill-locked" : "pill-open"}`}>
          {isLocked ? "잠김" : "열림"}
        </span>
      </div>
      
      {isLocked ? (
        // 1. 잠금 상태
        <div className="locked-state">
          <p>아직 개봉 전입니다.</p>
          <p className="meta">개봉 예정일에 열어보세요</p>
        </div>
      ) : (
        // 2. 개봉 가능한 상태
        <>
          {isOpened ? (
            // 2-A. 메시지와 첨부 열람
            <div className="opened-content">
              <p className="opened-message">{capsule.message}</p>
              
              {/* 첨부 파일 출력 */}
              {attachments.length > 0 && (
                <div className="capsule-media-rail"> 
                  {/* 업로드된 파일 목록 가로 스크롤 미리보기 */}
                  {attachments.map((file, index) => (
                    file.type === "audio" ? (
                      <div key={index} className="audio-card media-card">
                        <div className="media-header">
                          <p className="media-label">{file.name || `오디오 ${index + 1}`}</p>
                          <a className="download-link" href={file.url} download>
                            다운로드
                          </a>
                        </div>
                        <audio controls src={file.url}>
                          현재 브라우저에서 오디오를 재생할 수 없습니다.
                        </audio>
                      </div>
                    ) : (
                      <figure key={index} className="image-card media-card">
                        <div className="media-header">
                          <figcaption className="media-label">{file.name || `이미지 ${index + 1}`}</figcaption>
                          <a className="download-link" href={file.url} download>
                            다운로드
                          </a>
                        </div>
                        <img 
                          src={file.url} 
                          alt={`첨부 이미지 ${index + 1}`} 
                          className="capsule-image" 
                        />
                      </figure>
                    )
                  ))}
                </div>
              )}
              
              <div className="button-group">
                <button 
                  onClick={handleClose} 
                  className="close-button" 
                >
                  닫기
                </button>
                <button 
                  onClick={handleDelete} 
                  className="delete-button" 
                >
                  삭제
                </button>
              </div>
            </div>
          ) : (
            // 2-B. 열람 버튼
            <button 
              onClick={handleOpen} 
              className="open-button" 
            >
              타임캡슐 열어보기
            </button>
          )}
        </>
      )}
    </div>
  );
}

export default CapsuleCard;

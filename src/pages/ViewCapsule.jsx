// src/pages/ViewCapsule.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import dayjs from "dayjs";

function ViewCapsule() {
  const { id } = useParams();
  const [capsule, setCapsule] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 단일 캡슐 문서를 불러오는 비동기 함수
    const fetchCapsule = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const snap = await getDoc(doc(db, "capsules", id));
        if (snap.exists()) {
          setCapsule({
            id: snap.id,
            ...snap.data(),
          });
        } else {
          setCapsule(null);
        }
      } catch (err) {
        console.error("캡슐 조회 오류:", err);
        setCapsule(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCapsule();
  }, [id]);

  // fileUrls의 다양한 형태(string/object)를 일관된 배열로 정규화
  const attachments = useMemo(() => {
    if (!capsule) return [];
    const list = Array.isArray(capsule.fileUrls) ? capsule.fileUrls : capsule.fileUrl ? [capsule.fileUrl] : [];
    return list
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
      .filter(Boolean);
  }, [capsule]);

  if (loading) {
    return <div className="glass-card">불러오는 중...</div>;
  }

  if (!capsule) {
    return (
      <div className="glass-card">
        <p>캡슐을 찾을 수 없습니다.</p>
        <Link to="/">홈으로 돌아가기</Link>
      </div>
    );
  }

  // 날짜 관련 파생 값 계산
  const openDate = dayjs(capsule.openAt);
  const saveDate = capsule.createdAt ? dayjs(capsule.createdAt.seconds ? capsule.createdAt.toDate() : capsule.createdAt) : null;
  const isLocked = dayjs().isBefore(openDate, "day");

  return (
    <div className="glass-card capsule-card">
      <div className="card-head">
        <div className="card-titles">
          <h3>{capsule.title}</h3>
          <p className="meta">저장일: {saveDate ? saveDate.format("YYYY-MM-DD") : "-"}</p>
          <p className="meta">개봉 예정일: {openDate.format("YYYY-MM-DD")}</p>
        </div>
        <span className={`pill ${isLocked ? "pill-locked" : "pill-open"}`}>{isLocked ? "잠김" : "열림"}</span>
      </div>

      <div className="opened-content">
        <p className="opened-message">{capsule.message}</p>

        {attachments.length > 0 && (
          <div className="capsule-media-rail">
            {attachments.map((file, index) =>
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
                  <img src={file.url} alt={`첨부 이미지 ${index + 1}`} className="capsule-image" />
                </figure>
              )
            )}
          </div>
        )}

        <div className="button-group">
          <Link to="/" className="close-button" style={{ textDecoration: "none", textAlign: "center" }}>
            목록으로
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ViewCapsule;

// src/components/CapsuleCard.jsx
import dayjs from "dayjs";

function CapsuleCard({ capsule }) {
  const now = dayjs();
  const openDate = dayjs(capsule.openAt);
  const isLocked = now.isBefore(openDate);

  return (
    <div className="glass-card">
      <h3>{capsule.title}</h3>
      {isLocked ? (
        <p>🔒 {openDate.format("YYYY-MM-DD")} 에 열립니다</p>
      ) : (
        <>
          <p>{capsule.message}</p>
          {capsule.fileUrl && <img src={capsule.fileUrl} alt="capsule" style={{ maxWidth: '100%' }} />}
        </>
      )}
    </div>
  );
}

export default CapsuleCard;

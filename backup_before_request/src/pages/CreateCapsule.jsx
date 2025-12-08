// src/pages/CreateCapsule.jsx
import CapsuleForm from "../components/CapsuleForm";

function CreateCapsule() {
  return (
    <div className="container">
      {/* 페이지 헤더는 Form 컴포넌트에서 처리 */}
      <CapsuleForm />
    </div>
  );
}

export default CreateCapsule;

// src/pages/CreateCapsule.jsx
import CapsuleForm from "../components/CapsuleForm";

function CreateCapsule() {
  return (
    <div className="container">
      {/* 작성 페이지에서는 폼만 감싸서 레이아웃을 유지 */}
      {/* <h1>새 타임캡슐 만들기</h1> -> Form 컴포넌트로 이동 */}
      <CapsuleForm />
    </div>
  );
}

export default CreateCapsule;

// src/pages/CreateCapsule.jsx
import CapsuleForm from "../components/CapsuleForm";

function CreateCapsule() {
  return (
    <div className="container">
      {/* <h1>새 타임캡슐 만들기</h1> -> Form 컴포넌트로 이동 */}
      <CapsuleForm />
    </div>
  );
}

export default CreateCapsule;
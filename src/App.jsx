// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import CapsuleForm from "./components/CapsuleForm"; // 폼 컴포넌트 직접 사용
import ViewCapsule from "./pages/ViewCapsule";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* CreateCapsule 페이지 없이 바로 CapsuleForm 렌더링 */}
        <Route path="/create" element={<CapsuleForm />} /> 
        {/* ID로 접근하는 상세 보기 라우트 */}
        <Route path="/capsule/:id" element={<ViewCapsule />} /> 
      </Routes>
    </Router>
  );
}

export default App;
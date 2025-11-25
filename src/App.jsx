// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import CreateCapsule from "./pages/CreateCapsule"; // 페이지 컴포넌트 사용

function App() {
  return (
    <Router>
      <div className="app-main-layout">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreateCapsule />} /> 
          
          {/* 캡슐 상세 보기 라우트는 필요하다면 추가 */}
          {/* <Route path="/capsule/:id" element={<ViewCapsule />} /> */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
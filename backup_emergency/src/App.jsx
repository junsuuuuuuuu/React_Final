// src/App.jsx
// 라우터로 페이지를 전환하는 엔트리 포인트
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import CreateCapsule from "./pages/CreateCapsule";

function App() {
  return (
    <Router>
      <div className="app-main-layout">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreateCapsule />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

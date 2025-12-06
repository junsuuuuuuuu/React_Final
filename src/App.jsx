// src/App.jsx
// 캡슐 앱의 라우팅을 정의하는 최상위 컴포넌트입니다.
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

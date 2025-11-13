// src/main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// React 앱의 진입점
createRoot(document.getElementById('root')).render(
  // 개발 환경에서 잠재적 문제를 감지하는 도구
  <StrictMode>
    <App />
  </StrictMode>,
)
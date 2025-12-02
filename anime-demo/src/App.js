import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

// 페이지 컴포넌트 임포트
import Home from "./pages/Home";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import Detail from "./pages/Detail";
import MyPage from "./pages/MyPage"; // 신규 페이지

// 스타일 및 상수 파일은 컴포넌트 내부에서 임포트하여 사용

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/detail/:id" element={<Detail />} />
          <Route path="/mypage" element={<MyPage />} />{" "}
          {/* 마이페이지 라우트 추가 */}
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

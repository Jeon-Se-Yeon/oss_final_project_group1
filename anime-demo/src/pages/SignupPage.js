import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import { styles } from "../styles";

const SignupPage = () => {
    const [userid, setUserid] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPw, setConfirmPw] = useState("");
    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        if (password !== confirmPw) return alert("비밀번호 불일치");
        if (await signup(userid, password)) {
            alert("가입 성공");
            navigate("/login");
        } else alert("가입 실패");
    };

    return (
        <div style={styles.container}>
            <Header />
            <div style={styles.authCard}>
                <h2 style={{ textAlign: "center" }}>회원가입</h2>
                <form onSubmit={handleSignup} style={styles.formCol}>
                    <input
                        value={userid}
                        onChange={(e) => setUserid(e.target.value)}
                        placeholder="아이디"
                        style={styles.input}
                    />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="비밀번호"
                        style={styles.input}
                    />
                    <input
                        type="password"
                        value={confirmPw}
                        onChange={(e) => setConfirmPw(e.target.value)}
                        placeholder="비밀번호 확인"
                        style={styles.input}
                    />
                    <button type="submit" style={styles.secondaryButton}>
                        가입하기
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SignupPage;
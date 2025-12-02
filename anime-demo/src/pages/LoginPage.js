import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import { styles } from "../styles";

const LoginPage = () => {
    const [userid, setUserid] = useState("");
    const [password, setPassword] = useState("");
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (await login(userid, password)) navigate("/");
        else alert("로그인 실패");
    };

    return (
        <div style={styles.container}>
            <Header />
            <div style={styles.authCard}>
                <h2 style={{ textAlign: "center" }}>로그인</h2>
                <form onSubmit={handleSubmit} style={styles.formCol}>
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
                    <button type="submit" style={styles.primaryButton}>
                        로그인
                    </button>
                </form>
                <div style={styles.linkText}>
                    계정이 없으신가요? <Link to="/signup">회원가입</Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
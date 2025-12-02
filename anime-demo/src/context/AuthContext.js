import React, { useState, useEffect, createContext, useContext } from "react";
import { USER_API_URL } from "../constants";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) setUser(JSON.parse(storedUser));
    }, []);

    const login = async (inputUserid, inputPassword) => {
        try {
            const response = await fetch(USER_API_URL);
            const users = await response.json();
            const foundUser = users.find(
                (u) => u.userid === inputUserid && u.password === inputPassword
            );
            if (foundUser) {
                setUser(foundUser);
                localStorage.setItem("user", JSON.stringify(foundUser));
                return true;
            }
            return false;
        } catch (error) {
            console.error("Login Error:", error);
            return false;
        }
    };

    const signup = async (inputUserid, inputPassword) => {
        try {
            const response = await fetch(USER_API_URL);
            const users = await response.json();
            if (users.some((u) => u.userid === inputUserid)) {
                alert("이미 존재하는 아이디입니다.");
                return false;
            }
            const postResponse = await fetch(USER_API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userid: inputUserid, password: inputPassword }),
            });
            return postResponse.ok;
        } catch (error) {
            console.error("Signup Error:", error);
            return false;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("user");
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, signup }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
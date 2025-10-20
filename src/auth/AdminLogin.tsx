import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/AdminLogin.css";

const AdminLogin: React.FC = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");

        try {
            const response = await axios.post(
                "http://localhost:8081/api/auth/login",
                { username, password },
                { headers: { "Content-Type": "application/json" } }
            );

            const token = response.data.token;
            const role = response.data.roles[0];

            if (role !== "ROLE_ADMIN") {
                setMessage("❌ You are not authorized as an admin user.");
                return;
            }

            localStorage.setItem("token", token);
            localStorage.setItem("username", username);
            localStorage.setItem("role", role);

            setMessage("✅ Login successful! Redirecting...");
            setTimeout(() => navigate("/create-admin"), 1000);
        } catch (error) {
            console.error(error);
            setMessage("❌ Invalid credentials or server error.");
        }
    };

    return (
        <div className="admin-login-page">
            <div className="admin-login-container">
                <h2>Admin Login</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Admin Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Admin Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit">Login</button>
                </form>

                {message && <p className="message">{message}</p>}

                <button className="back-btn" onClick={() => navigate("/login") }>
                    ⬅ Back to User Login
                </button>
            </div>
        </div>
    );
};

export default AdminLogin;


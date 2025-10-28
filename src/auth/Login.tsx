import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "../styles/Login.css";

const Login: React.FC = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // Use environment variable when available; otherwise use relative path so CRA dev proxy (if present) will forward requests
        const baseUrl = process.env.REACT_APP_API_URL ?? "";

        try {
            const response = await axios.post(
                `${baseUrl}authservice/auth/login`,
                { username, password },
                { headers: { "Content-Type": "application/json" }, responseType: "json" }
            );

            // Helpful console log for debugging server response
            console.log("Login response:", response);

            const data = response?.data ?? {};
            const token = data.token;
            const roles = data.roles;
            if (!token) {
                setError("Login succeeded but no token returned from server.");
                return;
            }

            localStorage.setItem("token", token);
            if (roles && roles.length > 0) {
                localStorage.setItem("role", roles[0]);
            }
            localStorage.setItem("username", username);

            // NOTE: adjust this route if your app now uses a different path
            navigate("/queryProduct");
        } catch (err: any) {
            // Better extraction of server error messages
            console.error("Login error:", err);

            // If this is an axios error
            if (axios.isAxiosError(err)) {
                // If the request was made but no response was received => likely CORS or network issue
                if (!err.response) {
                    console.error("No response received. XHR request:", err.request);
                    setError(
                        "Network Error: no response received. This often means the browser blocked the request (CORS), there is a mixed-content issue (HTTPS page calling HTTP API), or the API is not reachable. Check the browser Network tab and server logs."
                    );
                    return;
                }

                const status = err.response?.status;
                const data = err.response?.data;

                // Try common locations for server-provided message
                const serverMessage =
                    (data && (data.message || data.error || data.detail)) ||
                    (typeof data === "string" ? data : undefined) ||
                    err.message;

                setError(
                    serverMessage
                        ? `Error ${status ?? ""}: ${serverMessage}`
                        : `Request failed: ${err.message}`
                );

                // Common causes to look for in the console:
                // - CORS errors (no response object, check browser console network tab)
                // - 401/403 (bad credentials or permission)
                // - 404 (wrong endpoint)
                return;
            }

            setError("Invalid username or password");
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <h2>Login</h2>
                <form onSubmit={handleLogin}>
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit">Login</button>
                </form>
                {error && <p className="error">{error}</p>}

                <div className="register-link">
                    <p>
                        Don’t have an account?{" "}
                        <Link to="/register" className="link">
                            Register here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;

import React, { useState } from "react";
import axios from "axios";

type Props = {
    onClose?: () => void;
};

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8080";

const ChangePassword: React.FC<Props> = ({ onClose }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const validate = () => {
        if (!username.trim() || !password.trim() || !newPassword.trim()) {
            alert("Please fill all fields (username, password and new password).");
            return false;
        }
        if (newPassword.length < 8) {
            alert("New password should be at least 8 characters long.");
            return false;
        }
        return true;
    };

    const handleChangePassword = async () => {
        if (!validate()) return;
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            await axios.post(
                `${API_BASE}/authservice/auth/change-password`,
                { username: username, currentPassword: password, newPassword: newPassword },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: token ? `Bearer ${token}` : "",
                    },
                }
            );
            alert("✅ Password changed successfully.");
            setUsername("");
            setPassword("");
            setNewPassword("");
            if (onClose) onClose();
        } catch (err: any) {
            console.error(err);
            const msg = err?.response?.data?.message || err?.message || "Failed to change password";
            alert(`❌ ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                maxWidth: 520,
                width: "100%",
                margin: "18px auto",
                padding: 18,
                borderRadius: 12,
                boxShadow: "0 10px 30px rgba(20,20,40,0.08)",
                background: "linear-gradient(180deg,#fff,#fbfdff)",
                fontFamily: "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
            }}
            className="card"
            role="region"
            aria-label="Change password"
        >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ fontSize: 20 }}>🔒</div>
                    <h3 style={{ margin: 0, fontSize: 18 }}>Change Password</h3>
                </div>
            </div>

            <div style={{ display: "grid", gap: 10 }}>
                <label style={{ fontSize: 13, color: "#333" }}>
                    Username
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        style={{
                            width: "100%",
                            marginTop: 6,
                            padding: "10px 12px",
                            borderRadius: 8,
                            border: "1px solid #e6e9ef",
                            outline: "none",
                            fontSize: 14,
                        }}
                    />
                </label>

                <label style={{ fontSize: 13, color: "#333" }}>
                    Password
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{
                            width: "100%",
                            marginTop: 6,
                            padding: "10px 12px",
                            borderRadius: 8,
                            border: "1px solid #e6e9ef",
                            outline: "none",
                            fontSize: 14,
                        }}
                    />
                </label>

                <label style={{ fontSize: 13, color: "#333" }}>
                    New password
                    <input
                        type="password"
                        placeholder="New password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        style={{
                            width: "100%",
                            marginTop: 6,
                            padding: "10px 12px",
                            borderRadius: 8,
                            border: "1px solid #e6e9ef",
                            outline: "none",
                            fontSize: 14,
                        }}
                    />
                </label>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
                <div style={{ fontSize: 12, color: "#64748b" }}>Tip: choose a strong, unique password.</div>

                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    {onClose && (
                        <button
                            onClick={onClose}
                            disabled={loading}
                            style={{
                                padding: "8px 12px",
                                borderRadius: 8,
                                border: "1px solid #e6e9ef",
                                background: "white",
                                cursor: loading ? "not-allowed" : "pointer",
                            }}
                        >
                            Cancel
                        </button>
                    )}

                    <button
                        onClick={handleChangePassword}
                        disabled={loading}
                        aria-label="change-password"
                        style={{
                            padding: "10px 18px",
                            borderRadius: 10,
                            border: "none",
                            cursor: loading ? "not-allowed" : "pointer",
                            fontWeight: 600,
                            color: "white",
                            background: "linear-gradient(90deg,#6c8cff 0%,#4db6ff 100%)",
                            boxShadow: "0 10px 30px rgba(76,140,255,0.18)",
                            display: "inline-flex",
                            gap: 8,
                            alignItems: "center",
                        }}
                    >
                        {loading ? "Processing..." : "Change Password"}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                            <path d="M12 2v10" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M5 12h14" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChangePassword;

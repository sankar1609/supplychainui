import React, { useState } from "react";
import axios from "axios";

type Props = {
    onClose?: () => void;
};

const ChangePassword: React.FC<Props> = ({ onClose }) => {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const validate = () => {
        if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
            alert("Please fill all password fields.");
            return false;
        }
        if (newPassword !== confirmPassword) {
            alert("New password and confirmation do not match.");
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
                "http://localhost:8081/api/auth/change-password",
                { currentPassword: currentPassword, newPassword: newPassword },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: token ? `Bearer ${token}` : "",
                    },
                }
            );
            alert("✅ Password changed successfully.");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
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
        <div className="card">
            <h3>🔒 Change Password</h3>
            <input
                type="password"
                placeholder="Current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <input
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
            />
            <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <div style={{ display: "flex", gap: 8 }}>
                <button onClick={handleChangePassword} disabled={loading}>
                    {loading ? "Processing..." : "Change Password"}
                </button>
                {onClose && (
                    <button onClick={onClose} disabled={loading}>
                        Cancel
                    </button>
                )}
            </div>
        </div>
    );
};

export default ChangePassword;


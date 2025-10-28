import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/createAdminUser.css";

const CreateAdminUser: React.FC = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    const [formData, setFormData] = useState({
        username: "",
        password: "",
        email: "",
        fullName: "",
    });

    const [message, setMessage] = useState("");

    if (role !== "ROLE_ADMIN") {
        return (
            <div className="not-authorized">
                <h3>Access Denied</h3>
                <p>You do not have permission to access this page.</p>
            </div>
        );
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await axios.post(
                "http://localhost:8080/authservice/auth/createAdminUser",
                formData,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setMessage("✅ Admin user created successfully!");
            setFormData({ username: "", password: "", email: "", fullName: "" });
        } catch (error: any) {
            console.error(error);
            setMessage("❌ Failed to create admin user. Please check your access or input.");
        }
    };

    return (
        <div className="admin-create-page">
            <div className="admin-create-container">
                <h2>Create New Admin User</h2>

                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        name="username"
                        placeholder="Enter username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="password"
                        name="password"
                        placeholder="Enter password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="email"
                        name="email"
                        placeholder="Enter email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="text"
                        name="fullName"
                        placeholder="Enter full name"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                    />

                    <button type="submit">Create Admin</button>
                </form>

                {message && <p className="message">{message}</p>}

                <button className="back-btn" onClick={() => navigate("/queryProduct")}>
                    ⬅ Back to Dashboard
                </button>
            </div>
        </div>
    );
};

export default CreateAdminUser;

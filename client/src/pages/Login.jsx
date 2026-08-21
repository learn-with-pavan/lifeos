import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { useState } from "react";
import { loginUser } from "../services/authService";
import { useToast } from "../context/ToastContext";

function Login() {

    const navigate = useNavigate();
    const toast = useToast();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            setLoading(true);
            setMessage("");

            const data = await loginUser(formData);

            localStorage.setItem("token", data.token);

            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );

            toast.success("Login successful");
            navigate("/dashboard");
        } catch (error) {
            const message =
                error.response?.data?.message ||
                "Login failed";
            toast.error(message);
            setMessage("");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">

                <div className="auth-brand">
                    <div className="brand-icon">
                        <ShieldCheck size={24} />
                    </div>

                    <div>
                        <h1>LifeOS</h1>
                        <p>Your life, organized.</p>
                    </div>
                </div>

                <div className="auth-heading">
                    <h2>Welcome back</h2>
                    <p>Sign in to continue managing your life.</p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email address</label>

                        <input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={(event) =>
                                setFormData({
                                    ...formData,
                                    email: event.target.value,
                                })
                            }
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>

                        <input
                            id="password"
                            type="password"
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={(event) =>
                                setFormData({
                                    ...formData,
                                    password: event.target.value,
                                })
                            }
                        />
                    </div>

                    <button
                        type="submit"
                        className="auth-button"
                        disabled={loading}
                    >
                        {loading ? "Signing in..." : "Sign in"}
                    </button>
                </form>

                {message && (
                    <p style={{ marginTop: "16px", textAlign: "center" }}>
                        {message}
                    </p>
                )}
                <div className="auth-footer">
                    <p>
                        Don't have an account?{" "}
                        <Link to="/register">Create one</Link>
                    </p>
                </div>

            </div>
        </div>
    );
}

export default Login;
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { loginUser } from "../services/authService";
import { useToast } from "../context/ToastContext";
import logo from '../assets/logo.svg';

const INITIAL_FORM_DATA = {
    email: "",
    password: "",
};

const INITIAL_ERRORS = {
    email: "",
    password: "",
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Login() {
    const navigate = useNavigate();
    const toast = useToast();

    const [formData, setFormData] = useState(INITIAL_FORM_DATA);
    const [errors, setErrors] = useState(INITIAL_ERRORS);
    const [loading, setLoading] = useState(false);

    const validateForm = () => {
        const newErrors = {};
        const email = formData.email.trim();
        const password = formData.password;

        if (!email) {
            newErrors.email = "Email address is required.";
        } else if (!EMAIL_REGEX.test(email)) {
            newErrors.email = "Please enter a valid email address.";
        }

        if (!password) {
            newErrors.password = "Password is required.";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previousData) => ({
            ...previousData,
            [name]: value,
        }));

        // Clear the field error when the user starts correcting it.
        setErrors((previousErrors) => ({
            ...previousErrors,
            [name]: "",
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (loading) {
            return;
        }

        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);

            const loginData = {
                email: formData.email.trim(),
                password: formData.password,
            };

            const data = await loginUser(loginData);

            if (!data?.token || !data?.user) {
                throw new Error("Invalid login response.");
            }

            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            toast.success("Login successful");

            if (data.user.role === "PROVIDER") {
                navigate("/provider/dashboard", {
                    replace: true,
                });
            } else {
                navigate("/dashboard", {
                    replace: true,
                });
            }
        } catch (error) {
            const errorMessage =
                error.response?.data?.message ||
                "Login failed. Please check your credentials.";

            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-brand">
                    <div className="brand-icon">
                        <img src={logo} alt="brand-icon" />
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

                <form
                    className="auth-form"
                    onSubmit={handleSubmit}
                    noValidate
                >
                    <div className="form-group">
                        <label htmlFor="email">Email address</label>

                        <input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            autoComplete="email"
                            disabled={loading}
                            aria-invalid={Boolean(errors.email)}
                            aria-describedby={
                                errors.email ? "email-error" : undefined
                            }
                        />

                        {errors.email && (
                            <p
                                id="email-error"
                                className="form-error"
                                role="alert"
                            >
                                {errors.email}
                            </p>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>

                        <input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={handleChange}
                            autoComplete="current-password"
                            disabled={loading}
                            aria-invalid={Boolean(errors.password)}
                            aria-describedby={
                                errors.password
                                    ? "password-error"
                                    : undefined
                            }
                        />

                        {errors.password && (
                            <p
                                id="password-error"
                                className="form-error"
                                role="alert"
                            >
                                {errors.password}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="auth-button"
                        disabled={loading}
                    >
                        {loading ? "Signing in..." : "Sign in"}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        Don't have an account?{" "}
                        <Link to="/register">
                            Create a customer account
                        </Link>
                    </p>

                    <p>
                        Are you a service provider?{" "}
                        <Link to="/provider/register">
                            Register as a provider
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;

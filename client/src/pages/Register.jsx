import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { useState } from "react";
import { loginUser, registerUser } from "../services/authService";
import { useToast } from "../context/ToastContext";

const INITIAL_FORM_DATA = {
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
};

const INITIAL_ERRORS = {
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UPPERCASE_REGEX = /[A-Z]/;
const LOWERCASE_REGEX = /[a-z]/;
const NUMBER_REGEX = /[0-9]/;

function Register() {
    const navigate = useNavigate();
    const toast = useToast();

    const [formData, setFormData] = useState(INITIAL_FORM_DATA);
    const [errors, setErrors] = useState(INITIAL_ERRORS);
    const [loading, setLoading] = useState(false);

    const validateForm = () => {
        const newErrors = {};

        const name = formData.name.trim();
        const email = formData.email.trim();
        const password = formData.password;
        const confirmPassword = formData.confirmPassword;

        // Name validation
        if (!name) {
            newErrors.name = "Full name is required.";
        } else if (name.length < 2) {
            newErrors.name = "Name must be at least 2 characters.";
        }

        // Email validation
        if (!email) {
            newErrors.email = "Email address is required.";
        } else if (!EMAIL_REGEX.test(email)) {
            newErrors.email = "Please enter a valid email address.";
        }

        // Password validation
        if (!password) {
            newErrors.password = "Password is required.";
        } else if (password.length < 8) {
            newErrors.password =
                "Password must be at least 8 characters.";
        } else if (!UPPERCASE_REGEX.test(password)) {
            newErrors.password =
                "Password must contain at least one uppercase letter.";
        } else if (!LOWERCASE_REGEX.test(password)) {
            newErrors.password =
                "Password must contain at least one lowercase letter.";
        } else if (!NUMBER_REGEX.test(password)) {
            newErrors.password =
                "Password must contain at least one number.";
        }

        // Confirm password validation
        if (!confirmPassword) {
            newErrors.confirmPassword =
                "Please confirm your password.";
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword =
                "Passwords do not match.";
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

        setErrors((previousErrors) => ({
            ...previousErrors,
            [name]: "",
        }));

        // Keep confirm-password validation in sync.
        if (
            name === "password" ||
            name === "confirmPassword"
        ) {
            setErrors((previousErrors) => ({
                ...previousErrors,
                [name]: "",
                confirmPassword: "",
            }));
        }
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

            const name = formData.name.trim();
            const email = formData.email.trim();
            const password = formData.password;

            await registerUser({
                name,
                email,
                password,
            });

            const data = await loginUser({
                email,
                password,
            });

            if (!data?.token || !data?.user) {
                throw new Error("Invalid login response.");
            }

            localStorage.setItem("token", data.token);
            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );

            toast.success("Account created successfully");

            navigate("/dashboard", {
                replace: true,
            });
        } catch (error) {
            const errorMessage =
                error.response?.data?.message ||
                "Registration failed. Please try again.";

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
                        <ShieldCheck size={24} />
                    </div>

                    <div>
                        <h1>LifeOS</h1>
                        <p>Your life, organized.</p>
                    </div>
                </div>

                <div className="auth-heading">
                    <h2>Create your account</h2>
                    <p>
                        Start organizing everything that matters.
                    </p>
                </div>

                <form
                    className="auth-form"
                    onSubmit={handleSubmit}
                    noValidate
                >
                    <div className="form-group">
                        <label htmlFor="name">Full name</label>

                        <input
                            id="name"
                            name="name"
                            type="text"
                            placeholder="Enter your name"
                            value={formData.name}
                            onChange={handleChange}
                            autoComplete="name"
                            disabled={loading}
                            aria-invalid={Boolean(errors.name)}
                            aria-describedby={
                                errors.name
                                    ? "name-error"
                                    : undefined
                            }
                        />

                        {errors.name && (
                            <p
                                id="name-error"
                                className="form-error"
                                role="alert"
                            >
                                {errors.name}
                            </p>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">
                            Email address
                        </label>

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
                                errors.email
                                    ? "email-error"
                                    : undefined
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
                        <label htmlFor="password">
                            Password
                        </label>

                        <input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="Create a password"
                            value={formData.password}
                            onChange={handleChange}
                            autoComplete="new-password"
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

                    <div className="form-group">
                        <label htmlFor="confirmPassword">
                            Confirm password
                        </label>

                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            placeholder="Confirm your password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            autoComplete="new-password"
                            disabled={loading}
                            aria-invalid={Boolean(
                                errors.confirmPassword
                            )}
                            aria-describedby={
                                errors.confirmPassword
                                    ? "confirm-password-error"
                                    : undefined
                            }
                        />

                        {errors.confirmPassword && (
                            <p
                                id="confirm-password-error"
                                className="form-error"
                                role="alert"
                            >
                                {errors.confirmPassword}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="auth-button"
                        disabled={loading}
                    >
                        {loading
                            ? "Creating account..."
                            : "Create account"}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        Already have an account?{" "}
                        <Link to="/login">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Register;

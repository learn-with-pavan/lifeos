import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
    registerProviderUser,
    loginUser,
} from "../../services/authService";
import { useToast } from "../../context/ToastContext";
import logo from '../../assets/logo.svg'

const INITIAL_FORM_DATA = {
    name: "",
    businessName: "",
    email: "",
    password: "",
    confirmPassword: "",
};

const INITIAL_ERRORS = {
    name: "",
    businessName: "",
    email: "",
    password: "",
    confirmPassword: "",
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UPPERCASE_REGEX = /[A-Z]/;
const LOWERCASE_REGEX = /[a-z]/;
const NUMBER_REGEX = /[0-9]/;

function ProviderRegister() {
    const navigate = useNavigate();
    const toast = useToast();

    const [formData, setFormData] = useState(INITIAL_FORM_DATA);
    const [errors, setErrors] = useState(INITIAL_ERRORS);
    const [loading, setLoading] = useState(false);

    const validateForm = () => {
        const newErrors = {};

        const name = formData.name.trim();
        const businessName = formData.businessName.trim();
        const email = formData.email.trim();
        const password = formData.password;
        const confirmPassword = formData.confirmPassword;

        // Full name validation
        if (!name) {
            newErrors.name = "Full name is required.";
        } else if (name.length < 2) {
            newErrors.name = "Name must be at least 2 characters.";
        }

        // Business name validation
        if (!businessName) {
            newErrors.businessName = "Business name is required.";
        } else if (businessName.length < 2) {
            newErrors.businessName =
                "Business name must be at least 2 characters.";
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

        // Keep password confirmation validation synchronized.
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
            const businessName = formData.businessName.trim();
            const email = formData.email.trim();
            const password = formData.password;

            await registerProviderUser({
                name,
                businessName,
                email,
                password,
            });

            const loginData = await loginUser({
                email,
                password,
            });

            if (!loginData?.token || !loginData?.user) {
                throw new Error("Invalid login response.");
            }

            localStorage.setItem(
                "token",
                loginData.token
            );

            localStorage.setItem(
                "user",
                JSON.stringify(loginData.user)
            );

            toast.success(
                "Provider account created successfully"
            );

            navigate("/provider/dashboard", {
                replace: true,
            });
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message ||
                "Provider registration failed. Please try again.";

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
                        <p>Provider Portal</p>
                    </div>
                </div>

                <div className="auth-heading">
                    <h2>Create your provider account</h2>
                    <p>
                        Start offering your services through LifeOS.
                    </p>
                </div>

                <form
                    className="auth-form"
                    onSubmit={handleSubmit}
                    noValidate
                >
                    <div className="form-group">
                        <label htmlFor="name">
                            Full name
                        </label>

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
                        <label htmlFor="businessName">
                            Business name
                        </label>

                        <input
                            id="businessName"
                            name="businessName"
                            type="text"
                            placeholder="Enter your business name"
                            value={formData.businessName}
                            onChange={handleChange}
                            autoComplete="organization"
                            disabled={loading}
                            aria-invalid={Boolean(
                                errors.businessName
                            )}
                            aria-describedby={
                                errors.businessName
                                    ? "business-name-error"
                                    : undefined
                            }
                        />

                        {errors.businessName && (
                            <p
                                id="business-name-error"
                                className="form-error"
                                role="alert"
                            >
                                {errors.businessName}
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
                            ? "Creating provider account..."
                            : "Create provider account"}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        Already have an account?{" "}
                        <Link to="/login">
                            Sign in
                        </Link>
                    </p>

                    <p>
                        Looking for a customer account?{" "}
                        <Link to="/register">
                            Create customer account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default ProviderRegister;

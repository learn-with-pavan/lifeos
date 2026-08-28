import {
    ArrowRight,
    Check,
    Eye,
    EyeOff,
    FileText,
    Home,
    LockKeyhole,
    Mail,
    ShieldCheck,
    UserRound,
    Users,
    Wrench,
    Boxes,
    BarChart3,
    Bell,
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

import { loginUser, registerUser } from "../services/authService";
import { useToast } from "../context/ToastContext";

import logo from "../assets/logo.svg";
import "../styles/register.css";

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

const LIFEOS_MODULES = [
    {
        id: "home",
        icon: Home,
        title: "Homes",
        description: "Properties & spaces",
        position: "module-home",
    },
    {
        id: "assets",
        icon: Boxes,
        title: "Assets",
        description: "Everything you own",
        position: "module-assets",
    },
    {
        id: "maintenance",
        icon: Wrench,
        title: "Maintenance",
        description: "Repairs & schedules",
        position: "module-maintenance",
    },
    {
        id: "documents",
        icon: FileText,
        title: "Documents",
        description: "Warranties & records",
        position: "module-documents",
    },
    {
        id: "services",
        icon: Users,
        title: "Services",
        description: "Trusted providers",
        position: "module-services",
    },
    {
        id: "insights",
        icon: BarChart3,
        title: "Insights",
        description: "Costs & ownership",
        position: "module-insights",
    },
    {
        id: "reminders",
        icon: Bell,
        title: "Reminders",
        description: "Stay ahead",
        position: "module-reminders",
    },
    {
        id: "notifications",
        icon: Bell,
        title: "Notifications",
        description: "Important updates",
        position: "module-notifications",
    },
];

function Register() {
    const navigate = useNavigate();
    const toast = useToast();

    const [formData, setFormData] = useState(INITIAL_FORM_DATA);
    const [errors, setErrors] = useState(INITIAL_ERRORS);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const validateForm = () => {
        const newErrors = {};

        const name = formData.name.trim();
        const email = formData.email.trim();
        const password = formData.password;
        const confirmPassword = formData.confirmPassword;

        if (!name) {
            newErrors.name = "Full name is required.";
        } else if (name.length < 2) {
            newErrors.name = "Name must be at least 2 characters.";
        }

        if (!email) {
            newErrors.email = "Email address is required.";
        } else if (!EMAIL_REGEX.test(email)) {
            newErrors.email = "Please enter a valid email address.";
        }

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
            ...(name === "password" || name === "confirmPassword"
                ? { confirmPassword: "" }
                : {}),
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (loading || !validateForm()) {
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
        <main className="login-page register-page">
            {/* Background */}
            <div className="login-background" aria-hidden="true">
                <div className="background-grid" />
                <div className="background-glow background-glow-one" />
                <div className="background-glow background-glow-two" />
                <div className="background-line background-line-one" />
                <div className="background-line background-line-two" />
            </div>

            {/* =================================================
                LEFT — LIFEOS EXPERIENCE
            ================================================= */}
            <section className="login-showcase register-showcase">
                <div className="showcase-inner">

                    {/* BRAND */}
                    <div className="showcase-brand">
                        <div className="showcase-logo">
                            <img src={logo} alt="LifeOS" />
                        </div>

                        <div className="showcase-brand-copy">
                            <strong>LifeOS</strong>
                            <span>Life & Asset Management</span>
                        </div>
                    </div>

                    {/* HERO */}
                    <div className="showcase-copy">
                        <span className="showcase-eyebrow">
                            <i />
                            YOUR LIFE. ONE SYSTEM.
                        </span>

                        <h1>
                            Everything that matters,
                            <br />
                            <span>beautifully organized.</span>
                        </h1>

                        <p>
                            Create your LifeOS workspace and bring
                            your homes, assets, maintenance,
                            documents, services and insights together.
                        </p>
                    </div>

                    {/* LIFEOS VISUAL */}
                    <div className="lifeos-visual">

                        {/* CONNECTIONS */}
                        <div className="connection connection-home">
                            <span />
                        </div>

                        <div className="connection connection-assets">
                            <span />
                        </div>

                        <div className="connection connection-maintenance">
                            <span />
                        </div>

                        <div className="connection connection-documents">
                            <span />
                        </div>

                        <div className="connection connection-services">
                            <span />
                        </div>

                        <div className="connection connection-insights">
                            <span />
                        </div>

                        <div className="connection connection-reminders">
                            <span />
                        </div>

                        <div className="connection connection-notifications">
                            <span />
                        </div>

                        {/* CENTRAL HUB */}
                        <div className="lifeos-hub">
                            <div className="hub-orbit hub-orbit-one" />
                            <div className="hub-orbit hub-orbit-two" />

                            <div className="hub-core">
                                <div className="hub-logo">
                                    <img src={logo} alt="" />
                                </div>

                                <strong>LifeOS</strong>

                                <span>
                                    Everything connected
                                </span>
                            </div>

                            <div className="hub-pulse" />
                        </div>

                        {/* MODULES */}
                        {LIFEOS_MODULES.map(
                            ({
                                id,
                                icon: Icon,
                                title,
                                description,
                                position,
                            }) => (
                                <div
                                    className={`lifeos-module ${position}`}
                                    key={id}
                                >
                                    <div className="module-icon">
                                        <Icon
                                            size={17}
                                            strokeWidth={1.8}
                                        />
                                    </div>

                                    <div className="module-copy">
                                        <strong>{title}</strong>
                                        <span>{description}</span>
                                    </div>

                                    <div className="module-status" />
                                </div>
                            )
                        )}
                    </div>

                    {/* FOOTER */}
                    <div className="showcase-footer">
                        <div className="showcase-security">
                            <ShieldCheck size={15} />

                            <span>
                                Your personal workspace,
                                securely organized.
                            </span>
                        </div>

                        <div className="platform-status">
                            <i />
                            LifeOS Platform
                        </div>
                    </div>
                </div>
            </section>

            {/* =================================================
                RIGHT — REGISTER
            ================================================= */}
            <section className="login-panel register-panel">
                <div className="login-form-shell register-form-shell">

                    {/* MOBILE BRAND */}
                    <div className="login-mobile-brand">
                        <div className="mobile-logo">
                            <img src={logo} alt="LifeOS" />
                        </div>

                        <div>
                            <strong>LifeOS</strong>
                            <span>
                                Life & Asset Management
                            </span>
                        </div>
                    </div>

                    {/* HEADER */}
                    <div className="login-heading register-heading">
                        <span className="login-welcome">
                            Get started
                        </span>

                        <h2>Create your LifeOS</h2>

                        <p>
                            Build one organized workspace for
                            everything that matters to you.
                        </p>
                    </div>

                    {/* FORM */}
                    <form
                        className="login-form register-form"
                        onSubmit={handleSubmit}
                        noValidate
                    >

                        {/* NAME */}
                        <div className="login-form-group">
                            <label htmlFor="name">
                                Full name
                            </label>

                            <div
                                className={`login-input-wrapper ${errors.name ? "has-error" : ""
                                    }`}
                            >
                                <UserRound size={18} />

                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    placeholder="Enter your full name"
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
                            </div>

                            {errors.name && (
                                <p
                                    id="name-error"
                                    className="login-form-error"
                                    role="alert"
                                >
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        {/* EMAIL */}
                        <div className="login-form-group">
                            <label htmlFor="email">
                                Email address
                            </label>

                            <div
                                className={`login-input-wrapper ${errors.email ? "has-error" : ""
                                    }`}
                            >
                                <Mail size={18} />

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
                            </div>

                            {errors.email && (
                                <p
                                    id="email-error"
                                    className="login-form-error"
                                    role="alert"
                                >
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        {/* PASSWORD */}
                        <div className="login-form-group">
                            <label htmlFor="password">
                                Password
                            </label>

                            <div
                                className={`login-input-wrapper ${errors.password
                                    ? "has-error"
                                    : ""
                                    }`}
                            >
                                <LockKeyhole size={18} />

                                <input
                                    id="password"
                                    name="password"
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    placeholder="Create a password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    autoComplete="new-password"
                                    disabled={loading}
                                    aria-invalid={Boolean(
                                        errors.password
                                    )}
                                    aria-describedby={
                                        errors.password
                                            ? "password-error"
                                            : undefined
                                    }
                                />

                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() =>
                                        setShowPassword(
                                            (previous) =>
                                                !previous
                                        )
                                    }
                                    tabIndex={-1}
                                    aria-label={
                                        showPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                >
                                    {showPassword ? (
                                        <EyeOff size={18} />
                                    ) : (
                                        <Eye size={18} />
                                    )}
                                </button>
                            </div>

                            {errors.password && (
                                <p
                                    id="password-error"
                                    className="login-form-error"
                                    role="alert"
                                >
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        {/* CONFIRM PASSWORD */}
                        <div className="login-form-group">
                            <label htmlFor="confirmPassword">
                                Confirm password
                            </label>

                            <div
                                className={`login-input-wrapper ${errors.confirmPassword
                                    ? "has-error"
                                    : ""
                                    }`}
                            >
                                <LockKeyhole size={18} />

                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={
                                        showConfirmPassword
                                            ? "text"
                                            : "password"
                                    }
                                    placeholder="Confirm your password"
                                    value={
                                        formData.confirmPassword
                                    }
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

                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() =>
                                        setShowConfirmPassword(
                                            (previous) =>
                                                !previous
                                        )
                                    }
                                    tabIndex={-1}
                                    aria-label={
                                        showConfirmPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff size={18} />
                                    ) : (
                                        <Eye size={18} />
                                    )}
                                </button>
                            </div>

                            {errors.confirmPassword && (
                                <p
                                    id="confirm-password-error"
                                    className="login-form-error"
                                    role="alert"
                                >
                                    {errors.confirmPassword}
                                </p>
                            )}
                        </div>

                        {/* PASSWORD NOTE */}
                        {/* <div className="register-password-note">
                            <Check size={14} />
                            <span>
                                Use 8+ characters with uppercase,
                                lowercase and a number.
                            </span>
                        </div> */}

                        {/* SUBMIT */}
                        <button
                            type="submit"
                            className="login-submit register-submit"
                            disabled={loading}
                        >
                            <span>
                                {loading
                                    ? "Creating account..."
                                    : "Create account"}
                            </span>

                            {!loading && (
                                <ArrowRight size={18} />
                            )}
                        </button>
                    </form>

                    {/* DIVIDER */}
                    <div className="login-divider">
                        <span />
                        <small>LifeOS Platform</small>
                        <span />
                    </div>

                    {/* FOOTER */}
                    <div className="login-footer register-footer">
                        <p>
                            Already have an account?

                            <Link to="/login">
                                Sign in
                            </Link>
                        </p>

                        <p>
                            Are you a service provider?

                            <Link to="/provider/register">
                                Join as Provider
                            </Link>
                        </p>
                    </div>

                    {/* SECURITY */}
                    <div className="login-security">
                        <ShieldCheck size={15} />

                        <span>
                            Secure access to your LifeOS workspace
                        </span>
                    </div>
                </div>
            </section>
        </main>
    );
}

export default Register;
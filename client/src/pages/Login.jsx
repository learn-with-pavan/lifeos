import {
    ArrowRight,
    BarChart3,
    Bell,
    Boxes,
    Eye,
    EyeOff,
    FileText,
    Home,
    LockKeyhole,
    Mail,
    ShieldCheck,
    Users,
    Wrench,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { loginUser } from "../services/authService";
import { useToast } from "../context/ToastContext";
import logo from "../assets/logo.svg";
import "../styles/login.css";

const INITIAL_FORM_DATA = {
    email: "",
    password: "",
};

const INITIAL_ERRORS = {
    email: "",
    password: "",
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LIFEOS_MODULES = [
    {
        id: "home",
        icon: Home,
        title: "Homes",
        description: "Properties & spaces",
        position: "module-home",
    },
    {
        id: "notifications",
        icon: Bell,
        title: "Notifications",
        description: "Important updates",
        position: "module-notifications",
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
];

function Login() {
    const navigate = useNavigate();
    const toast = useToast();

    const [formData, setFormData] = useState(INITIAL_FORM_DATA);
    const [errors, setErrors] = useState(INITIAL_ERRORS);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

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
                navigate("/provider/dashboard", { replace: true });
            } else {
                navigate("/dashboard", { replace: true });
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
        <main className="login-page">
            {/* =========================================
                PREMIUM PAGE BACKGROUND
            ========================================= */}
            <div className="login-background" aria-hidden="true">
                <div className="background-grid" />
                <div className="background-glow background-glow-one" />
                <div className="background-glow background-glow-two" />
                <div className="background-line background-line-one" />
                <div className="background-line background-line-two" />
            </div>

            {/* =========================================
                LEFT — LIFEOS EXPERIENCE
            ========================================= */}
            <section className="login-showcase">
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

                    {/* HERO COPY */}
                    <div className="showcase-copy">
                        <span className="showcase-eyebrow">
                            <i />
                            YOUR LIFE. ONE SYSTEM.
                        </span>

                        <h1>
                            Your life,
                            <br />
                            <span>beautifully organized.</span>
                        </h1>

                        <p>
                            LifeOS brings your homes, assets, maintenance,
                            documents, services and insights together in one
                            organized workspace.
                        </p>
                    </div>

                    {/* =========================================
                        LIFEOS SYSTEM VISUALIZATION
                    ========================================= */}
                    <div className="lifeos-visual">
                        {/* CONNECTION LINES */}
                        <div className="connection connection-home">
                            <span />
                        </div>

                        <div className="connection connection-notifications">
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

                        {/* CENTER HUB */}
                        <div className="lifeos-hub">
                            <div className="hub-orbit hub-orbit-one" />
                            <div className="hub-orbit hub-orbit-two" />

                            <div className="hub-core">
                                <div className="hub-logo">
                                    <img src={logo} alt="" />
                                </div>

                                <strong>LifeOS</strong>
                                <span>Everything connected</span>
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
                                        <Icon size={17} strokeWidth={1.8} />
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

                    {/* SHOWCASE FOOTER */}
                    <div className="showcase-footer">
                        <div className="showcase-security">
                            <ShieldCheck size={15} />
                            <span>
                                Your personal workspace, securely organized.
                            </span>
                        </div>

                        <div className="platform-status">
                            <i />
                            LifeOS Platform
                        </div>
                    </div>
                </div>
            </section>

            {/* =========================================
                RIGHT — LOGIN
            ========================================= */}
            <section className="login-panel">
                <div className="login-form-shell">
                    {/* MOBILE BRAND */}
                    <div className="login-mobile-brand">
                        <div className="mobile-logo">
                            <img src={logo} alt="LifeOS" />
                        </div>

                        <div>
                            <strong>LifeOS</strong>
                            <span>Life & Asset Management</span>
                        </div>
                    </div>

                    {/* FORM HEADER */}
                    <div className="login-heading">
                        <span className="login-welcome">
                            Welcome back
                        </span>

                        <h2>Sign in to LifeOS</h2>

                        <p>
                            Continue managing your homes, assets and
                            everything that matters.
                        </p>
                    </div>

                    {/* FORM */}
                    <form
                        className="login-form"
                        onSubmit={handleSubmit}
                        noValidate
                    >
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
                            <div className="login-label-row">
                                <label htmlFor="password">
                                    Password
                                </label>
                            </div>

                            <div
                                className={`login-input-wrapper ${errors.password ? "has-error" : ""
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

                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() =>
                                        setShowPassword(
                                            (previous) => !previous
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

                        {/* SUBMIT */}
                        <button
                            type="submit"
                            className="login-submit"
                            disabled={loading}
                        >
                            <span>
                                {loading
                                    ? "Signing in..."
                                    : "Sign in"}
                            </span>

                            {!loading && <ArrowRight size={18} />}
                        </button>
                    </form>

                    {/* DIVIDER */}
                    <div className="login-divider">
                        <span />
                        <small>LifeOS Platform</small>
                        <span />
                    </div>

                    {/* FOOTER */}
                    <div className="login-footer">
                        <p>
                            Don't have an account?
                            <Link to="/register">
                                Create account
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

export default Login;
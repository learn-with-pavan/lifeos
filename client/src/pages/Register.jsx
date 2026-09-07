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
    RefreshCw,
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import {
    registerUser,
    sendRegistrationOtp,
    verifyRegistrationOtp,
} from "../services/authService";

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
    otp: "",
};


const EMAIL_REGEX =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

    const [formData, setFormData] =
        useState(INITIAL_FORM_DATA);

    const [errors, setErrors] =
        useState(INITIAL_ERRORS);

    const [loading, setLoading] =
        useState(false);

    const [otpLoading, setOtpLoading] =
        useState(false);

    const [showPassword, setShowPassword] =
        useState(false);

    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);

    const [otp, setOtp] =
        useState("");

    const [otpSent, setOtpSent] =
        useState(false);

    const [resendCountdown, setResendCountdown] =
        useState(0);

    const [otpExpiresIn, setOtpExpiresIn] =
        useState(600);


    useEffect(() => {

        if (resendCountdown <= 0) {
            return;
        }

        const timer =
            setInterval(() => {

                setResendCountdown(
                    (previous) =>
                        previous > 0
                            ? previous - 1
                            : 0
                );

            }, 1000);

        return () => clearInterval(timer);

    }, [resendCountdown]);


    useEffect(() => {

        if (!otpSent || otpExpiresIn <= 0) {
            return;
        }

        const timer =
            setInterval(() => {

                setOtpExpiresIn(
                    (previous) =>
                        previous > 0
                            ? previous - 1
                            : 0
                );

            }, 1000);

        return () => clearInterval(timer);

    }, [otpSent, otpExpiresIn]);


    const validateForm = () => {

        const newErrors = {};

        const name =
            formData.name.trim();

        const email =
            formData.email.trim();

        const password =
            formData.password;

        const confirmPassword =
            formData.confirmPassword;


        if (!name) {

            newErrors.name =
                "Full name is required.";

        } else if (name.length < 2) {

            newErrors.name =
                "Name must be at least 2 characters.";
        }


        if (!email) {

            newErrors.email =
                "Email address is required.";

        } else if (!EMAIL_REGEX.test(email)) {

            newErrors.email =
                "Please enter a valid email address.";
        }


        if (!password) {

            newErrors.password =
                "Password is required.";

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

        } else if (
            password !== confirmPassword
        ) {

            newErrors.confirmPassword =
                "Passwords do not match.";
        }


        setErrors(newErrors);

        return (
            Object.keys(newErrors).length === 0
        );
    };


    const handleChange = (event) => {

        const {
            name,
            value,
        } = event.target;


        setFormData((previousData) => ({
            ...previousData,
            [name]: value,
        }));


        setErrors((previousErrors) => ({
            ...previousErrors,
            [name]: "",

            ...(name === "password" ||
                name === "confirmPassword"
                ? {
                    confirmPassword: "",
                }
                : {}),
        }));
    };


    const handleSubmit = async (event) => {

        event.preventDefault();

        if (
            loading ||
            otpLoading ||
            !validateForm()
        ) {
            return;
        }


        try {

            setLoading(true);

            const name =
                formData.name.trim();

            const email =
                formData.email.trim().toLowerCase();

            const password =
                formData.password;


            const data =
                await registerUser({
                    name,
                    email,
                    password,
                });


            if (!data?.otpRequired) {

                throw new Error(
                    "Invalid registration response."
                );
            }


            setOtpSent(true);

            setOtp("");

            setResendCountdown(
                data.resendAfter || 30
            );

            setOtpExpiresIn(
                data.expiresIn || 600
            );

            setErrors(INITIAL_ERRORS);

            toast.success(
                "Verification code sent to your email."
            );

        } catch (error) {

            const errorMessage =
                error.response?.data?.message ||
                error.message ||
                "Registration failed. Please try again.";

            toast.error(errorMessage);

        } finally {

            setLoading(false);
        }
    };


    const handleOtpChange = (event) => {

        const value =
            event.target.value
                .replace(/\D/g, "")
                .slice(0, 6);

        setOtp(value);

        setErrors((previousErrors) => ({
            ...previousErrors,
            otp: "",
        }));
    };


    const handleVerifyOtp = async (event) => {

        event.preventDefault();

        if (
            otpLoading ||
            loading
        ) {
            return;
        }


        if (!/^\d{6}$/.test(otp)) {

            setErrors((previousErrors) => ({
                ...previousErrors,
                otp:
                    "Please enter the 6-digit verification code.",
            }));

            return;
        }


        try {

            setOtpLoading(true);

            const email =
                formData.email
                    .trim()
                    .toLowerCase();


            const data =
                await verifyRegistrationOtp({
                    email,
                    otp,
                });


            if (
                !data?.token ||
                !data?.user
            ) {

                throw new Error(
                    "Invalid verification response."
                );
            }


            localStorage.setItem(
                "token",
                data.token
            );

            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );


            toast.success(
                "Account created successfully."
            );


            navigate("/dashboard", {
                replace: true,
            });

        } catch (error) {

            const errorMessage =
                error.response?.data?.message ||
                "Verification failed. Please try again.";

            setErrors((previousErrors) => ({
                ...previousErrors,
                otp: errorMessage,
            }));

            toast.error(errorMessage);

        } finally {

            setOtpLoading(false);
        }
    };


    const handleResendOtp = async () => {

        if (
            resendCountdown > 0 ||
            otpLoading ||
            loading
        ) {
            return;
        }


        try {

            setOtpLoading(true);

            const email =
                formData.email
                    .trim()
                    .toLowerCase();


            const data =
                await sendRegistrationOtp(
                    email
                );


            setOtp("");

            setErrors(INITIAL_ERRORS);

            setResendCountdown(
                data.resendAfter || 30
            );

            setOtpExpiresIn(
                data.expiresIn || 600
            );


            toast.success(
                "A new verification code has been sent."
            );

        } catch (error) {

            const errorMessage =
                error.response?.data?.message ||
                "Unable to resend verification code.";

            toast.error(errorMessage);

        } finally {

            setOtpLoading(false);
        }
    };


    const handleChangeEmail = () => {

        setOtpSent(false);

        setOtp("");

        setResendCountdown(0);

        setOtpExpiresIn(600);

        setErrors(INITIAL_ERRORS);
    };


    const formatRemainingTime = () => {

        const minutes =
            Math.floor(
                otpExpiresIn / 60
            );

        const seconds =
            otpExpiresIn % 60;

        return `${minutes}:${String(
            seconds
        ).padStart(2, "0")}`;
    };


    return (

        <main className="login-page register-page">

            <div
                className="login-background"
                aria-hidden="true"
            >
                <div className="background-grid" />

                <div className="background-glow background-glow-one" />

                <div className="background-glow background-glow-two" />

                <div className="background-line background-line-one" />

                <div className="background-line background-line-two" />
            </div>


            <section className="login-showcase register-showcase">

                <div className="showcase-inner">

                    <div className="showcase-brand">

                        <div className="showcase-logo">

                            <img
                                src={logo}
                                alt="LifeOS"
                            />

                        </div>

                        <div className="showcase-brand-copy">

                            <strong>
                                LifeOS
                            </strong>

                            <span>
                                Life & Asset Management
                            </span>

                        </div>

                    </div>


                    <div className="showcase-copy">

                        <span className="showcase-eyebrow">

                            <i />

                            YOUR LIFE. ONE SYSTEM.

                        </span>


                        <h1>

                            Everything that matters,

                            <br />

                            <span>
                                beautifully organized.
                            </span>

                        </h1>


                        <p>

                            Create your LifeOS workspace and bring
                            your homes, assets, maintenance,
                            documents, services and insights together.

                        </p>

                    </div>


                    <div className="lifeos-visual">

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


                        <div className="lifeos-hub">

                            <div className="hub-orbit hub-orbit-one" />

                            <div className="hub-orbit hub-orbit-two" />

                            <div className="hub-core">

                                <div className="hub-logo">

                                    <img
                                        src={logo}
                                        alt=""
                                    />

                                </div>

                                <strong>
                                    LifeOS
                                </strong>

                                <span>
                                    Everything connected
                                </span>

                            </div>

                            <div className="hub-pulse" />

                        </div>


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

                                        <strong>
                                            {title}
                                        </strong>

                                        <span>
                                            {description}
                                        </span>

                                    </div>

                                    <div className="module-status" />

                                </div>
                            )
                        )}

                    </div>


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


            <section className="login-panel register-panel">

                <div className="login-form-shell register-form-shell">

                    <div className="login-mobile-brand">

                        <div className="mobile-logo">

                            <img
                                src={logo}
                                alt="LifeOS"
                            />

                        </div>

                        <div>

                            <strong>
                                LifeOS
                            </strong>

                            <span>
                                Life & Asset Management
                            </span>

                        </div>

                    </div>


                    {!otpSent ? (

                        <>
                            <div className="login-heading register-heading">

                                <span className="login-welcome">
                                    Get started
                                </span>

                                <h2>
                                    Create your LifeOS
                                </h2>

                                <p>
                                    Build one organized workspace for
                                    everything that matters to you.
                                </p>

                            </div>


                            <form
                                className="login-form register-form"
                                onSubmit={handleSubmit}
                                noValidate
                            >

                                <div className="login-form-group">

                                    <label htmlFor="name">
                                        Full name
                                    </label>

                                    <div
                                        className={`login-input-wrapper ${
                                            errors.name
                                                ? "has-error"
                                                : ""
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
                                            aria-invalid={Boolean(
                                                errors.name
                                            )}
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


                                <div className="login-form-group">

                                    <label htmlFor="email">
                                        Email address
                                    </label>

                                    <div
                                        className={`login-input-wrapper ${
                                            errors.email
                                                ? "has-error"
                                                : ""
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
                                            aria-invalid={Boolean(
                                                errors.email
                                            )}
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


                                <div className="login-form-group">

                                    <label htmlFor="password">
                                        Password
                                    </label>

                                    <div
                                        className={`login-input-wrapper ${
                                            errors.password
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


                                <div className="login-form-group">

                                    <label htmlFor="confirmPassword">
                                        Confirm password
                                    </label>

                                    <div
                                        className={`login-input-wrapper ${
                                            errors.confirmPassword
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


                                <div className="register-password-note">

                                    <Check size={14} />

                                    <span>
                                        Use 8+ characters with uppercase,
                                        lowercase and a number.
                                    </span>

                                </div>


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
                        </>

                    ) : (

                        <div className="register-otp-container">

                            <div className="register-otp-icon">

                                <Mail size={25} />

                            </div>


                            <div className="login-heading register-heading register-otp-heading">

                                <span className="login-welcome">
                                    Verify your email
                                </span>

                                <h2>
                                    Check your inbox
                                </h2>

                                <p>
                                    We sent a 6-digit verification code to
                                    <strong>
                                        {" "}
                                        {formData.email.trim()}
                                    </strong>
                                </p>

                            </div>


                            <form
                                className="register-otp-form"
                                onSubmit={handleVerifyOtp}
                                noValidate
                            >

                                <div className="login-form-group">

                                    <label htmlFor="registration-otp">
                                        Verification code
                                    </label>

                                    <div
                                        className={`login-input-wrapper register-otp-input-wrapper ${
                                            errors.otp
                                                ? "has-error"
                                                : ""
                                        }`}
                                    >

                                        <ShieldCheck size={18} />

                                        <input
                                            id="registration-otp"
                                            type="text"
                                            inputMode="numeric"
                                            autoComplete="one-time-code"
                                            placeholder="Enter 6-digit code"
                                            value={otp}
                                            onChange={handleOtpChange}
                                            maxLength={6}
                                            autoFocus
                                            disabled={otpLoading}
                                            aria-invalid={Boolean(
                                                errors.otp
                                            )}
                                            aria-describedby={
                                                errors.otp
                                                    ? "registration-otp-error"
                                                    : undefined
                                            }
                                        />

                                    </div>


                                    {errors.otp && (

                                        <p
                                            id="registration-otp-error"
                                            className="login-form-error"
                                            role="alert"
                                        >
                                            {errors.otp}
                                        </p>

                                    )}

                                </div>


                                <div className="register-otp-meta">

                                    <span>
                                        Code expires in{" "}
                                        <strong>
                                            {formatRemainingTime()}
                                        </strong>
                                    </span>

                                    <span>
                                        Secure email verification
                                    </span>

                                </div>


                                <button
                                    type="submit"
                                    className="login-submit register-submit"
                                    disabled={
                                        otpLoading ||
                                        otp.length !== 6
                                    }
                                >

                                    <span>
                                        {otpLoading
                                            ? "Verifying..."
                                            : "Verify email"}
                                    </span>

                                    {!otpLoading && (
                                        <Check size={18} />
                                    )}

                                </button>


                                <div className="register-otp-actions">

                                    <button
                                        type="button"
                                        className="register-resend-button"
                                        onClick={handleResendOtp}
                                        disabled={
                                            resendCountdown > 0 ||
                                            otpLoading
                                        }
                                    >

                                        <RefreshCw
                                            size={15}
                                        />

                                        {resendCountdown > 0
                                            ? `Resend code in ${resendCountdown}s`
                                            : "Resend verification code"}

                                    </button>


                                    <button
                                        type="button"
                                        className="register-change-email"
                                        onClick={handleChangeEmail}
                                        disabled={otpLoading}
                                    >
                                        Change email address
                                    </button>

                                </div>

                            </form>

                        </div>

                    )}


                    <div className="login-divider">

                        <span />

                        <small>
                            LifeOS Platform
                        </small>

                        <span />

                    </div>


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
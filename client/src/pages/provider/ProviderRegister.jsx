import { useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import {
    UserRound,
    Building2,
    Mail,
    LockKeyhole,
    Eye,
    EyeOff,
    ArrowRight,
    ShieldCheck,
    CircleCheck,
    LayoutDashboard,
    ClipboardList,
    CalendarDays,
    UserCircle,
    Settings,
    WalletCards,
    Bell,
    KeyRound,
    RotateCw,
} from "lucide-react";

import {
    registerProviderUser,
    sendRegistrationOtp,
    verifyRegistrationOtp,
} from "../../services/authService";

import { useToast } from "../../context/ToastContext";

import logo from "../../assets/logo.svg";

import "../../styles/provider/providerRegister.css";


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
    otp: "",
};


const EMAIL_REGEX =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const UPPERCASE_REGEX = /[A-Z]/;

const LOWERCASE_REGEX = /[a-z]/;

const NUMBER_REGEX = /[0-9]/;


const MODULES = [
    {
        className: "module-dashboard",
        icon: LayoutDashboard,
        title: "Dashboard",
        description: "Your business overview",
    },
    {
        className: "module-requests",
        icon: ClipboardList,
        title: "Service Requests",
        description: "Manage incoming requests",
    },
    {
        className: "module-schedules",
        icon: CalendarDays,
        title: "Schedules",
        description: "Plan your availability",
    },
    {
        className: "module-profile",
        icon: UserCircle,
        title: "Profile",
        description: "Manage provider profile",
    },
    {
        className: "module-settings",
        icon: Settings,
        title: "Settings",
        description: "Configure your account",
    },
    {
        className: "module-earnings",
        icon: WalletCards,
        title: "Earnings",
        description: "Track your income",
    },
    {
        className: "provider-notifications",
        icon: Bell,
        title: "Notifications",
        description: "Stay up to date",
    },
];


const FIELD_CONFIG = [
    {
        id: "name",
        label: "Full name",
        type: "text",
        placeholder: "Enter your full name",
        autoComplete: "name",
        icon: UserRound,
    },
    {
        id: "businessName",
        label: "Business name",
        type: "text",
        placeholder: "Enter your business name",
        autoComplete: "organization",
        icon: Building2,
    },
    {
        id: "email",
        label: "Email address",
        type: "email",
        placeholder: "you@example.com",
        autoComplete: "email",
        icon: Mail,
    },
    {
        id: "password",
        label: "Password",
        type: "password",
        placeholder: "Create a password",
        autoComplete: "new-password",
        icon: LockKeyhole,
    },
    {
        id: "confirmPassword",
        label: "Confirm password",
        type: "password",
        placeholder: "Confirm your password",
        autoComplete: "new-password",
        icon: ShieldCheck,
    },
];


function ProviderRegister() {

    const navigate = useNavigate();

    const toast = useToast();


    const [formData, setFormData] =
        useState(INITIAL_FORM_DATA);

    const [errors, setErrors] =
        useState(INITIAL_ERRORS);

    const [loading, setLoading] =
        useState(false);

    const [showPassword, setShowPassword] =
        useState(false);

    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);

    const [otpSent, setOtpSent] =
        useState(false);

    const [otp, setOtp] =
        useState("");

    const [resendCountdown, setResendCountdown] =
        useState(0);


    const validateForm = () => {

        const newErrors = {};

        const name =
            formData.name.trim();

        const businessName =
            formData.businessName.trim();

        const email =
            formData.email.trim();

        const {
            password,
            confirmPassword,
        } = formData;


        if (!name) {

            newErrors.name =
                "Full name is required.";

        } else if (name.length < 2) {

            newErrors.name =
                "Name must be at least 2 characters.";
        }


        if (!businessName) {

            newErrors.businessName =
                "Business name is required.";

        } else if (businessName.length < 2) {

            newErrors.businessName =
                "Business name must be at least 2 characters.";
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

        } else if (password !== confirmPassword) {

            newErrors.confirmPassword =
                "Passwords do not match.";
        }


        setErrors({
            ...INITIAL_ERRORS,
            ...newErrors,
        });

        return Object.keys(newErrors).length === 0;
    };


    const handleChange = ({
        target: {
            name,
            value,
        },
    }) => {

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));

        setErrors((previous) => ({
            ...previous,
            [name]: "",
            otp: "",
            ...(name === "password" ||
            name === "confirmPassword"
                ? {
                    confirmPassword: "",
                }
                : {}),
        }));
    };


    const startResendCountdown = (
        seconds = 30
    ) => {

        setResendCountdown(seconds);

        const interval =
            setInterval(() => {

                setResendCountdown(
                    (previous) => {

                        if (previous <= 1) {

                            clearInterval(
                                interval
                            );

                            return 0;
                        }

                        return previous - 1;
                    }
                );

            }, 1000);
    };


    const handleSubmit = async (
        event
    ) => {

        event.preventDefault();


        if (
            loading ||
            !validateForm()
        ) {
            return;
        }


        try {

            setLoading(true);


            const name =
                formData.name.trim();

            const businessName =
                formData.businessName.trim();

            const email =
                formData.email.trim();


            const data =
                await registerProviderUser({
                    name,
                    businessName,
                    email,
                    password:
                        formData.password,
                });


            if (!data?.otpRequired) {

                throw new Error(
                    "Invalid registration response."
                );
            }


            setOtpSent(true);

            setOtp("");

            setErrors(INITIAL_ERRORS);

            startResendCountdown(
                data?.resendAfter || 30
            );


            toast.success(
                "Verification code sent to your email."
            );

        } catch (error) {

            const errorMessage =
                error?.response?.data?.message ||
                error?.message ||
                "Provider registration failed. Please try again.";

            toast.error(errorMessage);

        } finally {

            setLoading(false);
        }
    };


    const handleVerifyOtp = async (
        event
    ) => {

        event.preventDefault();


        if (loading) {
            return;
        }


        const trimmedOtp =
            otp.trim();


        if (!/^\d{6}$/.test(trimmedOtp)) {

            setErrors((previous) => ({
                ...previous,
                otp:
                    "Please enter a valid 6-digit verification code.",
            }));

            return;
        }


        try {

            setLoading(true);


            const email =
                formData.email.trim();


            const data =
                await verifyRegistrationOtp({
                    email,
                    otp: trimmedOtp,
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
                "Provider account verified successfully."
            );


            navigate(
                "/provider/dashboard",
                {
                    replace: true,
                }
            );

        } catch (error) {

            const errorMessage =
                error?.response?.data?.message ||
                error?.message ||
                "Invalid verification code. Please try again.";

            setErrors((previous) => ({
                ...previous,
                otp: errorMessage,
            }));

            toast.error(errorMessage);

        } finally {

            setLoading(false);
        }
    };


    const handleResendOtp = async () => {

        if (
            loading ||
            resendCountdown > 0
        ) {
            return;
        }


        try {

            setLoading(true);


            const email =
                formData.email.trim();


            const data =
                await sendRegistrationOtp(
                    email
                );


            setOtp("");

            setErrors((previous) => ({
                ...previous,
                otp: "",
            }));


            startResendCountdown(
                data?.resendAfter || 30
            );


            toast.success(
                "A new verification code has been sent."
            );

        } catch (error) {

            const errorMessage =
                error?.response?.data?.message ||
                "Unable to resend verification code.";

            toast.error(errorMessage);

        } finally {

            setLoading(false);
        }
    };


    const handleBackToRegistration = () => {

        if (loading) {
            return;
        }

        setOtpSent(false);

        setOtp("");

        setErrors(INITIAL_ERRORS);
    };


    const renderInput = ({
        id,
        label,
        type,
        placeholder,
        autoComplete,
        icon: Icon,
    }) => {

        const isPassword =
            id === "password";

        const isConfirmPassword =
            id === "confirmPassword";


        const inputType =
            isPassword && showPassword
                ? "text"
                : isConfirmPassword &&
                    showConfirmPassword
                    ? "text"
                    : type;


        return (
            <div
                className="provider-form-group"
            >

                <label htmlFor={id}>
                    {label}
                </label>


                <div
                    className={`provider-input-wrapper ${
                        errors[id]
                            ? "has-error"
                            : ""
                    }`}
                >

                    <Icon
                        className="provider-input-icon"
                        size={17}
                        strokeWidth={1.8}
                        aria-hidden="true"
                    />


                    <input
                        id={id}
                        name={id}
                        type={inputType}
                        placeholder={placeholder}
                        value={formData[id]}
                        onChange={handleChange}
                        autoComplete={autoComplete}
                        disabled={loading}
                        aria-invalid={Boolean(
                            errors[id]
                        )}
                        aria-describedby={
                            errors[id]
                                ? `${id}-error`
                                : undefined
                        }
                    />


                    {(isPassword ||
                        isConfirmPassword) && (

                        <button
                            type="button"
                            className="provider-password-toggle"
                            onClick={() =>
                                isPassword
                                    ? setShowPassword(
                                        (value) =>
                                            !value
                                    )
                                    : setShowConfirmPassword(
                                        (value) =>
                                            !value
                                    )
                            }
                            disabled={loading}
                            aria-label={
                                isPassword
                                    ? showPassword
                                        ? "Hide password"
                                        : "Show password"
                                    : showConfirmPassword
                                        ? "Hide confirmed password"
                                        : "Show confirmed password"
                            }
                        >

                            {(
                                isPassword
                                    ? showPassword
                                    : showConfirmPassword
                            ) ? (

                                <EyeOff
                                    size={16}
                                    strokeWidth={1.8}
                                />

                            ) : (

                                <Eye
                                    size={16}
                                    strokeWidth={1.8}
                                />

                            )}

                        </button>
                    )}

                </div>


                {errors[id] && (

                    <p
                        id={`${id}-error`}
                        className="provider-form-error"
                        role="alert"
                    >
                        {errors[id]}
                    </p>
                )}

            </div>
        );
    };


    return (

        <div className="provider-register-page">

            <div className="provider-register-background">

                <div className="provider-background-grid" />

                <div className="provider-background-glow provider-glow-one" />

                <div className="provider-background-glow provider-glow-two" />

                <div className="provider-background-line provider-line-one" />

                <div className="provider-background-line provider-line-two" />

            </div>


            <section className="provider-showcase">

                <div className="provider-showcase-inner">

                    <div className="provider-brand">

                        <div className="provider-logo">

                            <img
                                src={logo}
                                alt="LifeOS"
                            />

                        </div>

                        <div className="provider-brand-copy">

                            <strong>
                                LifeOS
                            </strong>

                            <span>
                                PROVIDER PORTAL
                            </span>

                        </div>

                    </div>


                    <div className="provider-showcase-copy">

                        <div className="provider-eyebrow">

                            <i />

                            PROVIDER ECOSYSTEM

                        </div>


                        <h1>

                            Everything you need

                            <br />

                            to{" "}

                            <span>
                                run your service.
                            </span>

                        </h1>


                        <p>

                            Manage your services, requests,
                            schedules, earnings and customers
                            from one intelligent provider workspace.

                        </p>

                    </div>


                    <div className="provider-visual">

                        <div className="provider-connection provider-connection-top">
                            <span />
                        </div>

                        <div className="provider-connection provider-connection-left">
                            <span />
                        </div>

                        <div className="provider-connection provider-connection-right">
                            <span />
                        </div>

                        <div className="provider-connection provider-connection-bottom">
                            <span />
                        </div>


                        <div className="provider-hub">

                            <div className="provider-hub-pulse" />

                            <div className="provider-hub-orbit provider-orbit-one" />

                            <div className="provider-hub-orbit provider-orbit-two" />


                            <div className="provider-hub-core">

                                <div className="provider-hub-logo">

                                    <img
                                        src={logo}
                                        alt=""
                                    />

                                </div>

                                <strong>
                                    LifeOS
                                </strong>

                                <span>
                                    PROVIDER HUB
                                </span>

                            </div>

                        </div>


                        {MODULES.map(
                            (
                                module,
                                index
                            ) => {

                                const Icon =
                                    module.icon;

                                return (

                                    <div
                                        key={
                                            module.className
                                        }
                                        className={`provider-module ${module.className}`}
                                        style={{
                                            animationDelay:
                                                `${0.18 + index * 0.08}s`,
                                        }}
                                    >

                                        <div className="provider-module-icon">

                                            <Icon
                                                size={15}
                                                strokeWidth={1.9}
                                            />

                                        </div>


                                        <div className="provider-module-copy">

                                            <strong>
                                                {module.title}
                                            </strong>

                                            <span>
                                                {module.description}
                                            </span>

                                        </div>


                                        <i className="provider-module-status" />

                                    </div>

                                );
                            }
                        )}

                    </div>


                    <div className="provider-showcase-footer">

                        <div className="provider-security">

                            <ShieldCheck
                                size={14}
                                strokeWidth={1.8}
                            />

                            Secure provider workspace

                        </div>


                        <div className="provider-platform-status">

                            <i />

                            Platform operational

                        </div>

                    </div>

                </div>

            </section>


            <section className="provider-register-panel">

                <div className="provider-register-shell">

                    <div className="provider-mobile-brand">

                        <div className="provider-mobile-logo">

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
                                Provider Portal
                            </span>

                        </div>

                    </div>


                    {!otpSent ? (

                        <>

                            <div className="provider-register-heading">

                                <span className="provider-register-welcome">
                                    PROVIDER REGISTRATION
                                </span>

                                <h2>
                                    Create provider account
                                </h2>

                                <p>
                                    Start offering your services through LifeOS.
                                </p>

                            </div>


                            <form
                                className="provider-register-form"
                                onSubmit={handleSubmit}
                                noValidate
                            >

                                {FIELD_CONFIG.map(
                                    renderInput
                                )}


                                <button
                                    type="submit"
                                    className="provider-register-submit"
                                    disabled={loading}
                                >

                                    <span>
                                        {loading
                                            ? "Sending verification code..."
                                            : "Continue"}
                                    </span>


                                    {!loading && (

                                        <ArrowRight
                                            size={16}
                                            strokeWidth={2}
                                        />

                                    )}

                                </button>

                            </form>

                        </>

                    ) : (

                        <>

                            <div className="provider-register-heading provider-otp-heading">

                                <div className="provider-otp-icon">

                                    <KeyRound
                                        size={21}
                                        strokeWidth={1.8}
                                    />

                                </div>


                                <span className="provider-register-welcome">
                                    EMAIL VERIFICATION
                                </span>

                                <h2>
                                    Verify your email
                                </h2>

                                <p>

                                    We sent a 6-digit verification
                                    code to{" "}

                                    <strong>
                                        {formData.email.trim()}
                                    </strong>

                                </p>

                            </div>


                            <form
                                className="provider-register-form provider-otp-form"
                                onSubmit={handleVerifyOtp}
                                noValidate
                            >

                                <div className="provider-form-group">

                                    <label htmlFor="provider-registration-otp">
                                        Verification code
                                    </label>


                                    <div
                                        className={`provider-input-wrapper provider-otp-input-wrapper ${
                                            errors.otp
                                                ? "has-error"
                                                : ""
                                        }`}
                                    >

                                        <KeyRound
                                            className="provider-input-icon"
                                            size={17}
                                            strokeWidth={1.8}
                                            aria-hidden="true"
                                        />


                                        <input
                                            id="provider-registration-otp"
                                            name="otp"
                                            type="text"
                                            inputMode="numeric"
                                            autoComplete="one-time-code"
                                            maxLength={6}
                                            placeholder="Enter 6-digit code"
                                            value={otp}
                                            onChange={(event) => {

                                                const value =
                                                    event.target.value
                                                        .replace(/\D/g, "")
                                                        .slice(0, 6);

                                                setOtp(value);

                                                setErrors(
                                                    (previous) => ({
                                                        ...previous,
                                                        otp: "",
                                                    })
                                                );
                                            }}
                                            disabled={loading}
                                            autoFocus
                                            aria-invalid={Boolean(
                                                errors.otp
                                            )}
                                        />

                                    </div>


                                    {errors.otp && (

                                        <p
                                            className="provider-form-error"
                                            role="alert"
                                        >
                                            {errors.otp}
                                        </p>

                                    )}

                                </div>


                                <button
                                    type="submit"
                                    className="provider-register-submit"
                                    disabled={
                                        loading ||
                                        otp.length !== 6
                                    }
                                >

                                    <span>
                                        {loading
                                            ? "Verifying email..."
                                            : "Verify and create account"}
                                    </span>


                                    {!loading && (

                                        <ArrowRight
                                            size={16}
                                            strokeWidth={2}
                                        />

                                    )}

                                </button>


                                <div className="provider-otp-meta">

                                    <span>
                                        Code expires in 10 minutes
                                    </span>

                                    {resendCountdown > 0 ? (

                                        <span className="provider-otp-countdown">
                                            Resend in {resendCountdown}s
                                        </span>

                                    ) : (

                                        <button
                                            type="button"
                                            className="provider-resend-button"
                                            onClick={
                                                handleResendOtp
                                            }
                                            disabled={loading}
                                        >

                                            <RotateCw
                                                size={13}
                                                strokeWidth={2}
                                            />

                                            Resend code

                                        </button>

                                    )}

                                </div>


                                <button
                                    type="button"
                                    className="provider-change-email"
                                    onClick={
                                        handleBackToRegistration
                                    }
                                    disabled={loading}
                                >
                                    ← Back to registration
                                </button>

                            </form>

                        </>

                    )}


                    <div className="provider-register-divider">

                        <span />

                        <small>
                            {otpSent
                                ? "EMAIL VERIFICATION"
                                : "ALREADY REGISTERED?"}
                        </small>

                        <span />

                    </div>


                    {!otpSent && (

                        <div className="provider-register-footer">

                            <p>

                                Already have an account?

                                <Link to="/login">
                                    Sign in
                                </Link>

                            </p>


                            <p>

                                Looking for a customer account?

                                <Link to="/register">
                                    Join as customer
                                </Link>

                            </p>

                        </div>

                    )}


                    {otpSent && (

                        <div className="provider-register-footer">

                            <p>

                                Already have an account?

                                <Link to="/login">
                                    Sign in
                                </Link>

                            </p>

                        </div>

                    )}


                    <div className="provider-register-security">

                        <CircleCheck
                            size={13}
                            strokeWidth={1.8}
                        />

                        Your account information is securely protected

                    </div>

                </div>

            </section>

        </div>
    );
}


export default ProviderRegister;
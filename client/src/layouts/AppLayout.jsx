import {
    Link,
    NavLink,
    Outlet,
    useLocation,
    useNavigate,
} from "react-router-dom";
import {
    LayoutDashboard,
    Package,
    Wrench,
    FileText,
    LogOut,
    Bell,
    History,
    HomeIcon,
    TrendingUp,
    ClipboardList,
    Menu,
    X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getNotificationIcon } from "../utils/notificationUtils";
import { useNotifications } from "../context/NotificationContext";
import { useToast } from "../context/ToastContext";
import ReviewModal from "../components/ReviewModal";
import { getPaymentForServiceRequest } from "../services/paymentService";
import PaymentModal from "../components/PaymentModal";
import logo from "../assets/logo.svg";

function AppLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const toast = useToast();
    const user = JSON.parse(localStorage.getItem("user"));

    const [reviewRequestId, setReviewRequestId] = useState(null);
    const [paymentId, setPaymentId] = useState(null);
    const [selectedPayment, setSelectedPayment] = useState(null);

    const profileImageUrl = user.profileImage || "";

    const getUserInitials = (name) => {

        if (!name) {
            return "U";
        }

        const parts =
            name
                .trim()
                .split(/\s+/)
                .filter(Boolean);

        if (parts.length === 1) {
            return parts[0]
                .charAt(0)
                .toUpperCase();
        }

        return (
            parts[0].charAt(0) +
            parts[parts.length - 1].charAt(0)
        ).toUpperCase();
    };

    const pageTitles = [
        {
            path: "/assets/:assetId/service",
            title: "Find a Technician",
            subtitle: "Get professional help for your asset.",
        },
        {
            path: "/homes/:id",
            title: "Home Details",
            subtitle: "View and manage everything in this home.",
        },
        {
            path: "/assets/:id",
            title: "Asset Details",
            subtitle: "View and manage this asset.",
        },
        {
            path: "/dashboard",
            title: "Dashboard",
            subtitle: "Here's what's happening with your life.",
        },
        {
            path: "/homes",
            title: "Homes",
            subtitle: "Manage the places that matter to you.",
        },
        {
            path: "/assets",
            title: "Assets",
            subtitle: "Keep track of the things you own.",
        },
        {
            path: "/maintenance",
            title: "Maintenance",
            subtitle: "Stay on top of repaiars and upkeep.",
        },
        {
            path: "/documents",
            title: "Documents",
            subtitle: "Keep important records organized.",
        },
        {
            path: "/service-history",
            title: "Service History",
            subtitle: "Review completed services and repairs.",
        },
        {
            path: "/service-requests",
            title: "Service Requests",
            subtitle: "Review completed services and repairs.",
        },
        {
            path: "/notifications",
            title: "Notifications",
            subtitle: "Stay up to date with your life admin.",
        },
        {
            path: "/insights",
            title: "Insights",
            subtitle: "See patterns across your life data.",
        },
        {
            path: "/profile",
            title: "Profile",
            subtitle: "Manage your personal information and profile photo.",
        },
    ];

    const currentPage = pageTitles.find((page) => {
        const route = page.path.replace(/:[^/]+/g, "[^/]+");

        return new RegExp(`^${route}(?:/|$)`).test(
            location.pathname
        );
    }) || pageTitles[0];

    const {
        notifications,
        unreadCount,
        markAsRead,
        loadNotifications,
    } = useNotifications();

    const [showNotifications, setShowNotifications] =
        useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const notificationRef = useRef(null);

    useEffect(() => {
        if (!showNotifications) {
            return undefined;
        }

        const handlePointerDown = (event) => {
            if (!notificationRef.current?.contains(event.target)) {
                setShowNotifications(false);
            }
        };

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                setShowNotifications(false);
            }
        };

        document.addEventListener("pointerdown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("pointerdown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [showNotifications]);

    const handleNotificationClick = async (notification) => {

        try {

            if (!notification.isRead) {
                await markAsRead(notification._id);
            }

            /*
             * SERVICE COMPLETED
             *
             * Opens review modal.
             */
            if (
                notification.type ===
                "SERVICE_COMPLETED"
            ) {

                const requestId =
                    notification.serviceRequest?._id ||
                    notification.serviceRequest;

                if (requestId) {

                    setReviewRequestId(
                        requestId
                    );

                    setShowNotifications(false);
                }

                return;
            }


            /*
             * PAYMENT CREATED
             *
             * Opens payment modal.
             */
            if (
                notification.type ===
                "PAYMENT_CREATED"
            ) {

                const requestId =
                    notification.serviceRequest?._id ||
                    notification.serviceRequest;

                const notificationPaymentId =
                    notification.paymentId ||
                    notification.entityId;

                setShowNotifications(false);


                /*
                 * If notification contains
                 * paymentId, use it.
                 */
                if (notificationPaymentId) {

                    setPaymentId(
                        notificationPaymentId
                    );

                    /*
                     * We still need the complete
                     * payment object for the modal.
                     */
                    try {

                        const response =
                            await getPaymentForServiceRequest(
                                requestId
                            );

                        setSelectedPayment(
                            response?.payment || null
                        );

                    } catch (paymentError) {
                        toast.error(
                            paymentError?.response?.data?.message ||
                            "Unable to load payment."
                        );

                        return;
                    }

                    return;
                }


                /*
                 * Fallback:
                 * notification has serviceRequestId
                 * but no paymentId.
                 */
                if (requestId) {

                    try {

                        const response =
                            await getPaymentForServiceRequest(
                                requestId
                            );

                        if (response?.payment) {

                            setPaymentId(
                                response.payment._id
                            );

                            setSelectedPayment(
                                response.payment
                            );

                        }

                    } catch (paymentError) {
                        toast.error(
                            paymentError?.response?.data?.message ||
                            "Unable to load payment."
                        );
                    }
                }

                return;
            }

        } catch (error) {
            toast.error(
                error?.response?.data?.message ||
                "Unable to open notification."
            );
        }
    };

    return (
        <div className="app-layout">
            <header className="mobile-app-header">
                <button
                    type="button"
                    className="mobile-menu-button"
                    onClick={() => setMobileMenuOpen((current) => !current)}
                    aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                >
                    {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
                <strong>LifeOS</strong>
            </header>

            <aside className={`sidebar ${mobileMenuOpen ? "sidebar-open" : ""}`}>

                <div className="sidebar-brand">
                    <div className="brand-icon">
                        <img src={logo} alt="brand-icon" />
                    </div>

                    <div>
                        <h1>LifeOS</h1>
                        <p>Your life, organized.</p>
                    </div>
                </div>

                <nav className="sidebar-nav">

                    <NavLink to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                        <LayoutDashboard size={18} />
                        Dashboard
                    </NavLink>

                    <NavLink to="/homes" onClick={() => setMobileMenuOpen(false)}>
                        <HomeIcon size={18} />
                        Homes
                    </NavLink>


                    <NavLink to="/assets" onClick={() => setMobileMenuOpen(false)}>
                        <Package size={18} />
                        Assets
                    </NavLink>

                    <NavLink to="/maintenance" onClick={() => setMobileMenuOpen(false)}>
                        <Wrench size={18} />
                        Maintenance
                    </NavLink>

                    <NavLink to="/documents" onClick={() => setMobileMenuOpen(false)}>
                        <FileText size={18} />
                        Documents
                    </NavLink>

                    <NavLink
                        to="/service-history"
                        onClick={() => setMobileMenuOpen(false)}
                        className="nav-link"
                    >
                        <History size={18} />
                        <span>Service History</span>
                    </NavLink>

                    <NavLink
                        to="/service-requests"
                        onClick={() => setMobileMenuOpen(false)}
                        className="nav-link"
                    >
                        <ClipboardList size={18} />
                        <span>Service Requests</span>
                    </NavLink>

                    <NavLink
                        to="/notifications"
                        onClick={() => setMobileMenuOpen(false)}
                        className="nav-link"
                    >
                        <Bell size={18} />
                        <span>Notifications</span>
                    </NavLink>

                    <NavLink
                        to="/insights"
                        className="nav-link"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <TrendingUp size={18} />
                        <span>Insights</span>
                    </NavLink>

                </nav>

                <div className="sidebar-bottom">

                    {/* <div className="sidebar-user">
                        <div className="user-avatar">
                            {user?.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>

                        <div>
                            <strong>{user?.name || "User"}</strong>
                            <span>{user?.email || ""}</span>
                        </div>
                    </div> */}
                    <button
                        type="button"
                        className="sidebar-profile"
                        onClick={() => {
                            setMobileMenuOpen(false);
                            navigate("/profile");
                        }}
                    >
                        <div className="sidebar-profile-avatar">

                            {profileImageUrl ? (

                                <img
                                    src={profileImageUrl}
                                    alt={`${user.name || "User"} profile`}
                                />

                            ) : (

                                <span>
                                    {getUserInitials(
                                        user.name
                                    )}
                                </span>

                            )}

                        </div>

                        <div className="sidebar-profile-info">

                            <strong>
                                {user.name || "User"}
                            </strong>

                            <span>
                                {user.email}
                            </span>
                            <span>
                                {user.phone}
                            </span>

                        </div>
                    </button>

                    <button
                        className="logout-button"
                        onClick={() => {
                            localStorage.removeItem("token");
                            localStorage.removeItem("user");
                            toast.success("Logged out successfully");
                            navigate("/login", { replace: true });
                        }}
                    >
                        <LogOut size={18} />
                        Logout
                    </button>

                </div>

            </aside>

            <main className="app-content">

                <header className="app-header">
                    <div>
                        <h2>{currentPage.title}</h2>
                        <p>{currentPage.subtitle}</p>
                    </div>
                </header>

                <section className="page-content">
                    <Outlet />
                </section>

            </main>

            <div className="notification-wrapper" ref={notificationRef}>

                <button
                    className="notification-button"
                    onClick={() =>
                        setShowNotifications((current) => {
                            const next = !current;

                            if (next) {
                                loadNotifications();
                            }

                            return next;
                        })
                    }
                    aria-label="Notifications"
                >
                    <Bell size={20} />

                    {unreadCount > 0 && (
                        <span className="notification-badge">
                            {unreadCount > 99
                                ? "99+"
                                : unreadCount}
                        </span>
                    )}
                </button>

                {showNotifications && (
                    <div className="notification-dropdown">

                        <div className="notification-dropdown-header">
                            <div>
                                <strong>
                                    Notifications
                                </strong>

                                {unreadCount > 0 && (
                                    <span className="notification-header-count">
                                        {unreadCount} unread
                                    </span>
                                )}
                            </div>
                        </div>

                        {notifications.length === 0 ? (
                            <div className="notification-empty">
                                <div>🔔</div>

                                <p>
                                    You're all caught up.
                                </p>
                            </div>
                        ) : (
                            <div className="notification-list">

                                {notifications
                                    .slice(0, 5)
                                    .map((notification) => (
                                        <div
                                            key={notification._id}
                                            className={`notification-item ${!notification.isRead
                                                ? "notification-unread"
                                                : ""
                                                } ${notification.type ===
                                                    "SERVICE_COMPLETED"
                                                    ? "notification-review-item"
                                                    : ""
                                                } ${notification.type ===
                                                    "PAYMENT_CREATED"
                                                    ? "notification-payment-item"
                                                    : ""
                                                }`}
                                            onClick={() =>
                                                handleNotificationClick(
                                                    notification
                                                )
                                            }
                                        >
                                            <div className="notification-icon">
                                                {(() => {
                                                    const Icon =
                                                        getNotificationIcon(
                                                            notification.type
                                                        );

                                                    return (
                                                        <Icon size={17} />
                                                    );
                                                })()}
                                            </div>

                                            <div className="notification-content">
                                                <strong>
                                                    {notification.title}
                                                </strong>

                                                <p>
                                                    {notification.message}
                                                </p>

                                                <small>
                                                    {new Date(
                                                        notification.createdAt
                                                    ).toLocaleDateString()}
                                                </small>

                                                {notification.type ===
                                                    "SERVICE_COMPLETED" && (
                                                        <span className="notification-review-action">
                                                            Rate now →
                                                        </span>
                                                    )}

                                                {notification.type ===
                                                    "PAYMENT_CREATED" && (
                                                        <span className="notification-payment-action">
                                                            Pay now →
                                                        </span>
                                                    )}
                                            </div>
                                        </div>
                                    ))}

                            </div>
                        )}

                        <Link
                            to="/notifications"
                            className="view-all-notifications"
                            onClick={() =>
                                setShowNotifications(false)
                            }
                        >
                            View all notifications →
                        </Link>

                    </div>
                )}
            </div>

            {reviewRequestId && (

                <ReviewModal
                    serviceRequestId={
                        reviewRequestId
                    }

                    onClose={() =>
                        setReviewRequestId(null)
                    }

                    onSubmitted={() => {

                        setReviewRequestId(null);

                        toast.success(
                            "Thank you for your feedback!"
                        );

                        loadNotifications();
                    }}
                />

            )}

            {selectedPayment && (

                <PaymentModal
                    payment={selectedPayment}

                    onClose={() => {

                        setSelectedPayment(null);
                        setPaymentId(null);

                    }}

                    onSuccess={(updatedPayment) => {

                        setSelectedPayment(null);
                        setPaymentId(null);

                        toast.success(
                            "Payment completed successfully!"
                        );

                        loadNotifications();

                    }}
                />

            )}

            {mobileMenuOpen && (
                <button
                    type="button"
                    className="sidebar-overlay"
                    onClick={() => setMobileMenuOpen(false)}
                    aria-label="Close menu"
                />
            )}
        </div>
    );
}

export default AppLayout;
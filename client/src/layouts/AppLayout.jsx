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
    User,
    LogOut,
    Bell,
    History,
    HomeIcon,
    TrendingUp,
    ClipboardList
} from "lucide-react";
import { useState } from "react";
import { getNotifications, getUnreadNotificationCount, markNotificationAsRead } from "../services/notificationService";
import { getNotificationIcon } from "../utils/notificationUtils";
import { useNotifications } from "../context/NotificationContext";
import { useToast } from "../context/ToastContext";

function AppLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const toast = useToast();
    const user = JSON.parse(localStorage.getItem("user"));

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

    const handleNotificationClick =
        async (notification) => {
            if (!notification.isRead) {
                await markAsRead(
                    notification._id
                );
            }
        };

    return (
        <div className="app-layout">
            <aside className="sidebar">

                <div className="sidebar-brand">
                    <div className="brand-icon">
                        <LayoutDashboard size={20} />
                    </div>

                    <div>
                        <h1>LifeOS</h1>
                        <p>Your life, organized.</p>
                    </div>
                </div>

                <nav className="sidebar-nav">

                    <NavLink to="/dashboard">
                        <LayoutDashboard size={18} />
                        Dashboard
                    </NavLink>

                    <NavLink to="/homes">
                        <HomeIcon size={18} />
                        Homes
                    </NavLink>


                    <NavLink to="/assets">
                        <Package size={18} />
                        Assets
                    </NavLink>

                    <NavLink to="/maintenance">
                        <Wrench size={18} />
                        Maintenance
                    </NavLink>

                    <NavLink to="/documents">
                        <FileText size={18} />
                        Documents
                    </NavLink>

                    <NavLink
                        to="/service-history"
                        className="nav-link"
                    >
                        <History size={18} />
                        <span>Service History</span>
                    </NavLink>

                    <NavLink
                        to="/service-requests"
                        className="nav-link"
                    >
                        <ClipboardList size={18} />
                        <span>Service Requests</span>
                    </NavLink>

                    <NavLink
                        to="/notifications"
                        className="nav-link"
                    >
                        <Bell size={18} />
                        <span>Notifications</span>
                    </NavLink>

                    <NavLink to="/insights" className="nav-link">
                        <TrendingUp size={18} />
                        <span>Insights</span>
                    </NavLink>

                </nav>

                <div className="sidebar-bottom">

                    <div className="sidebar-user">
                        <div className="user-avatar">
                            {user?.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>

                        <div>
                            <strong>{user?.name || "User"}</strong>
                            <span>{user?.email || ""}</span>
                        </div>
                    </div>

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

            <div className="notification-wrapper">

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
        </div>
    );
}

export default AppLayout;
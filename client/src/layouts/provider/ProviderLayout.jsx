import {
    CalendarDays,
    ClipboardList,
    LayoutDashboard,
    LogOut,
    Settings,
    UserRound,
    Wrench,
    Menu,
    X,
    Bell,
} from "lucide-react";

import {
    NavLink,
    Outlet,
    useLocation,
    useNavigate,
} from "react-router-dom";

import {
    useState,
    useEffect,
    useRef,
} from "react";

import "../../styles/provider/providerLayout.css";
import { getNotificationIcon } from "../../utils/notificationUtils";
import { useNotifications } from "../../context/NotificationContext";
import logo from "../../assets/logo.svg";

const ProviderLayout = () => {

    const navigate =
        useNavigate();

    const location =
        useLocation();


    const pageTitles = [
        {
            path: "/provider/requests/",
            title: "Service Request",
            subtitle: "Review and manage this customer request.",
        },
        {
            path: "/provider/requests",
            title: "Service Requests",
            subtitle: "Manage incoming service requests from customers.",
        },
        {
            path: "/provider/dashboard",
            title: "Dashboard",
            subtitle: "Here's what's happening with your services.",
        },
        {
            path: "/provider/schedule",
            title: "Schedule",
            subtitle: "Keep track of your upcoming appointments.",
        },
        {
            path: "/provider/services",
            title: "Services",
            subtitle: "Manage the services you provide.",
        },
        {
            path: "/provider/profile",
            title: "Profile",
            subtitle: "Manage your provider profile.",
        },
        {
            path: "/provider/notifications",
            title: "Notifications",
            subtitle: "Stay up to date with your service activity.",
        },
        {
            path: "/provider/settings",
            title: "Settings",
            subtitle: "Configure your provider account.",
        }
    ];


    const currentPage =
        pageTitles.find((page) =>
            location.pathname.startsWith(page.path)
        ) || pageTitles[1];


    const [
        mobileMenuOpen,
        setMobileMenuOpen,
    ] = useState(false);

    const [showNotifications, setShowNotifications] = useState(false);
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

    const {
        notifications,
        unreadCount,
        markAsRead,
        loadNotifications,
    } = useNotifications();

    const handleNotificationClick = async (notification) => {
        if (!notification.isRead) {
            await markAsRead(notification._id);
        }
    };


    const navigationItems = [
        {
            label: "Dashboard",
            path: "/provider/dashboard",
            icon: LayoutDashboard,
        },
        {
            label: "Service Requests",
            path: "/provider/requests",
            icon: ClipboardList,
        },
        {
            label: "Schedule",
            path: "/provider/schedule",
            icon: CalendarDays,
        },
        {
            label: "Services",
            path: "/provider/services",
            icon: Wrench,
        },
        {
            label: "Profile",
            path: "/provider/profile",
            icon: UserRound,
        },
        {
            label: "Notifications",
            path: "/provider/notifications",
            icon: Bell,
        },
        {
            label: "Settings",
            path: "/provider/settings",
            icon: Settings,
        }
    ];

    const handleLogout =
        () => {

            localStorage.removeItem(
                "token"
            );

            navigate("/login");
        };


    return (

        <div className="provider-layout">

            {/* MOBILE HEADER */}

            <header className="provider-mobile-header">

                <button
                    type="button"
                    className="provider-mobile-menu-button"
                    onClick={() =>
                        setMobileMenuOpen(
                            (current) =>
                                !current
                        )
                    }
                >

                    {mobileMenuOpen ? (
                        <X size={22} />
                    ) : (
                        <Menu size={22} />
                    )}

                </button>


                <div className="provider-mobile-brand">

                    <div className="provider-brand-icon">
                        <Wrench size={19} />
                    </div>

                    <span>
                        LifeOS Provider
                    </span>

                </div>

            </header>


            {/* SIDEBAR */}

            <aside
                className={`provider-sidebar ${mobileMenuOpen
                    ? "provider-sidebar-open"
                    : ""
                    }`}
            >

                {/* BRAND */}

                <div className="provider-sidebar-brand">

                    <div className="provider-brand-icon">

                        <img src={logo} alt="brand-icon" />

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


                {/* NAVIGATION */}

                <nav className="provider-sidebar-navigation">

                    <span className="provider-sidebar-section-label">
                        Workspace
                    </span>


                    {navigationItems.map(
                        ({
                            label,
                            path,
                            icon: Icon,
                        }) => (

                            <NavLink
                                key={path}
                                to={path}
                                onClick={() =>
                                    setMobileMenuOpen(
                                        false
                                    )
                                }
                                className={({
                                    isActive,
                                }) =>
                                    `provider-sidebar-link ${isActive
                                        ? "provider-sidebar-link-active"
                                        : ""
                                    }`
                                }
                            >

                                <Icon
                                    size={18}
                                />

                                <span>
                                    {label}
                                </span>

                            </NavLink>

                        )
                    )}

                </nav>


                {/* BOTTOM */}

                <div className="provider-sidebar-bottom">

                    <button
                        type="button"
                        className="provider-sidebar-logout"
                        onClick={
                            handleLogout
                        }
                    >

                        <LogOut
                            size={18}
                        />

                        <span>
                            Logout
                        </span>

                    </button>

                </div>

            </aside>


            {/* OVERLAY */}

            {mobileMenuOpen && (

                <button
                    type="button"
                    className="provider-sidebar-overlay"
                    onClick={() =>
                        setMobileMenuOpen(
                            false
                        )
                    }
                    aria-label="Close menu"
                />

            )}


            {/* CONTENT */}

            <main className="provider-layout-content">

                <header className="provider-app-header">

                    <div>

                        <h2>
                            {currentPage.title}
                        </h2>

                        <p>
                            {currentPage.subtitle}
                        </p>

                    </div>

                </header>

                <div className="provider-notification-wrapper" ref={notificationRef}>
                    <button
                        type="button"
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
                                {unreadCount > 99 ? "99+" : unreadCount}
                            </span>
                        )}
                    </button>

                    {showNotifications && (
                        <div className="notification-dropdown">
                            <div className="notification-dropdown-header">
                                <strong>Notifications</strong>
                            </div>

                            {notifications.length === 0 ? (
                                <div className="notification-empty">
                                    <div>🔔</div>
                                    <p>You're all caught up.</p>
                                </div>
                            ) : (
                                <div className="notification-list">
                                    {notifications.slice(0, 5).map((notification) => {
                                        const Icon = getNotificationIcon(notification.type);

                                        return (
                                            <div
                                                key={notification._id}
                                                className={`notification-item ${!notification.isRead ? "notification-unread" : ""}`}
                                                onClick={() => handleNotificationClick(notification)}
                                            >
                                                <div className="notification-icon">
                                                    <Icon size={17} />
                                                </div>
                                                <div className="notification-content">
                                                    <strong>{notification.title}</strong>
                                                    <p>{notification.message}</p>
                                                    <small>
                                                        {new Date(notification.createdAt).toLocaleDateString()}
                                                    </small>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            <NavLink
                                to="/provider/notifications"
                                className="view-all-notifications"
                                onClick={() => setShowNotifications(false)}
                            >
                                View all notifications →
                            </NavLink>
                        </div>
                    )}
                </div>

                <section className="provider-page-content">
                    <Outlet />
                </section>

            </main>

        </div>
    );
};


export default ProviderLayout;
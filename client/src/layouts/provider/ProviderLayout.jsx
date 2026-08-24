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
} from "lucide-react";

import {
    NavLink,
    Outlet,
    useLocation,
    useNavigate,
} from "react-router-dom";

import {
    useState,
} from "react";

import "../../styles/provider/providerLayout.css";


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
            path: "/provider/settings",
            title: "Settings",
            subtitle: "Configure your provider account.",
        },
    ];


    const currentPage =
        pageTitles.find((page) =>
            location.pathname.startsWith(page.path)
        ) || pageTitles[1];


    const [
        mobileMenuOpen,
        setMobileMenuOpen,
    ] = useState(false);


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
            label: "Settings",
            path: "/provider/settings",
            icon: Settings,
        },
    ];


    const handleNavigation =
        (path) => {

            navigate(path);

            setMobileMenuOpen(false);
        };


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

                        <Wrench size={20} />

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

                <section className="provider-page-content">
                    <Outlet />
                </section>

            </main>

        </div>
    );
};


export default ProviderLayout;
import {
    Home as HomeIcon,
    Package,
    Wrench,
    FileText,
    ArrowRight,
    Calendar,
    ShieldCheck,
    Bell,
    ClipboardList,
    UserRoundCog,
    Clock3,
    CircleCheck,
    XCircle,
    MapPin,
} from "lucide-react";

import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    useNavigate,
} from "react-router-dom";

import LoadingState from "../components/LoadingState";

import {
    getDashboard,
} from "../services/dashboardService";

import "../styles/dashboard.css";
import { formatAddress } from "../utils/formatters";


function Dashboard() {

    const navigate = useNavigate();

    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    /* ---------------------------------
       LOAD DASHBOARD
    --------------------------------- */

    const loadDashboard = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await getDashboard();

            setDashboard(response.data);

        } catch (error) {

            console.error(
                "Failed to load dashboard:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Unable to load dashboard."
            );

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {
        loadDashboard();
    }, []);


    /* ---------------------------------
       GREETING
    --------------------------------- */

    const greeting = useMemo(() => {

        const hour = new Date().getHours();

        if (hour < 12) {
            return "Good morning";
        }

        if (hour < 18) {
            return "Good afternoon";
        }

        return "Good evening";

    }, []);


    /* ---------------------------------
       OVERVIEW
    --------------------------------- */

    const overview = [

        {
            label: "Homes",
            value: dashboard?.overview?.homes ?? 0,
            description: "Places you manage",
            icon: HomeIcon,
            onClick: () => navigate("/homes"),
        },

        {
            label: "Assets",
            value: dashboard?.overview?.assets ?? 0,
            description: "Things you own",
            icon: Package,
            onClick: () => navigate("/assets"),
        },

        {
            label: "Maintenance",
            value: dashboard?.overview?.maintenance ?? 0,
            description: "Upcoming maintenance",
            icon: Wrench,
            onClick: () => navigate("/maintenance"),
        },

        {
            label: "Documents",
            value: dashboard?.overview?.documents ?? 0,
            description: "Important documents",
            icon: FileText,
            onClick: () => navigate("/documents"),
        },

    ];


    /* ---------------------------------
       FORMAT DATE
    --------------------------------- */

    const formatDate = (date) => {

        if (!date) {
            return "";
        }

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "";
        }

        return parsedDate.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );

    };

    /* ---------------------------------
       UPCOMING ICON
    --------------------------------- */

    const getUpcomingIcon = (type) => {

        const icons = {
            MAINTENANCE: Wrench,
            WARRANTY: ShieldCheck,
            REMINDER: Bell,
            SERVICE: Calendar,
        };

        return icons[type] || Bell;

    };


    /* ---------------------------------
       SERVICE REQUEST ICON
    --------------------------------- */

    const getServiceRequestIcon = (status) => {

        const icons = {
            PENDING: Clock3,
            ACCEPTED: UserRoundCog,
            ASSIGNED: UserRoundCog,
            IN_PROGRESS: Wrench,
            COMPLETED: CircleCheck,
            CANCELLED: XCircle,
        };

        return icons[status] || ClipboardList;

    };


    /* ---------------------------------
       SERVICE REQUEST STATUS
    --------------------------------- */

    const formatRequestStatus = (status) => {

        const statuses = {
            PENDING: "Pending",
            ACCEPTED: "Accepted",
            ASSIGNED: "Provider assigned",
            IN_PROGRESS: "In progress",
            COMPLETED: "Completed",
            CANCELLED: "Cancelled",
        };

        return statuses[status] || "Pending";

    };


    /* ---------------------------------
       HOME TYPE
    --------------------------------- */

    const formatHomeType = (type) => {

        const types = {
            HOUSE: "House",
            APARTMENT: "Apartment",
            VILLA: "Villa",
            OTHER: "Other",
        };

        return types[type] || type || "Home";

    };


    /* ---------------------------------
       LOADING
    --------------------------------- */

    if (loading && !dashboard) {

        return (
            <div className="dashboard">

                <LoadingState
                    title="Loading dashboard"
                    message="We're getting everything ready for you."
                />

            </div>
        );

    }


    /* ---------------------------------
       PAGE
    --------------------------------- */

    return (

        <div className="dashboard">

            {/* ==========================================
                WELCOME
            ========================================== */}

            <div className="welcome-section">

                <div>

                    <h1>
                        {greeting} 👋
                    </h1>

                    <p>
                        Here's what's happening
                        with your homes and services.
                    </p>

                </div>


                <button
                    type="button"
                    className="primary-action"
                    onClick={() =>
                        navigate("/services")
                    }
                >

                    <Wrench size={18} />

                    Book a Service

                </button>

            </div>


            {/* ==========================================
                OVERVIEW
            ========================================== */}

            <div className="overview-grid">

                {overview.map((item) => {

                    const Icon = item.icon;

                    return (

                        <button
                            className="overview-card"
                            key={item.label}
                            type="button"
                            onClick={item.onClick}
                        >

                            <div className="overview-card-top">

                                <div className="overview-icon">

                                    <Icon size={20} />

                                </div>

                                <span>
                                    {item.label}
                                </span>

                            </div>


                            <h2>
                                {item.value}
                            </h2>


                            <p>
                                {item.description}
                            </p>

                        </button>

                    );

                })}

            </div>


            {/* ==========================================
                HOMES
            ========================================== */}

            <div className="dashboard-section">

                <div className="section-header">

                    <div>

                        <h2>
                            Your homes
                        </h2>

                        <p>
                            See what you have inside
                            each home.
                        </p>

                    </div>


                    <button
                        className="section-action"
                        type="button"
                        onClick={() =>
                            navigate("/homes")
                        }
                    >

                        View all

                        <ArrowRight size={16} />

                    </button>

                </div>


                {error ? (

                    <div className="empty-state">

                        <h3>
                            Something went wrong
                        </h3>

                        <p>
                            {error}
                        </p>

                        <button
                            type="button"
                            onClick={loadDashboard}
                        >
                            Try again
                        </button>

                    </div>

                ) : !dashboard?.homes?.length ? (

                    <div className="empty-state">

                        <div className="dashboard-empty-icon">

                            <HomeIcon size={24} />

                        </div>

                        <h3>
                            No homes yet
                        </h3>

                        <p>
                            Add a home to start
                            organizing your assets.
                        </p>

                        <button
                            type="button"
                            onClick={() =>
                                navigate("/homes")
                            }
                        >
                            Add a home
                        </button>

                    </div>

                ) : (

                    <div className="dashboard-homes-grid">

                        {dashboard.homes.map((home) => {
                            return (

                                <button
                                    className="dashboard-home-card"
                                    key={home._id}
                                    type="button"
                                    onClick={() =>
                                        navigate(
                                            `/homes/${home._id}`
                                        )
                                    }
                                >

                                    <div className="dashboard-home-header">

                                        <div className="dashboard-home-icon">

                                            <HomeIcon size={21} />

                                        </div>


                                        <div className="dashboard-home-info">

                                            <h3>
                                                {home.name}
                                            </h3>

                                            <span>
                                                {formatHomeType(
                                                    home.type
                                                )}
                                            </span>


                                            {home.address && (

                                                <p className="dashboard-home-address">

                                                    <MapPin size={14} />

                                                    <span>
                                                        {formatAddress(home.address)}
                                                    </span>

                                                </p>

                                            )}

                                        </div>


                                        <ArrowRight
                                            size={17}
                                            className="dashboard-home-arrow"
                                        />

                                    </div>


                                    {/* HOME STATS */}

                                    <div className="dashboard-home-stats">

                                        <div>

                                            <Package size={16} />

                                            <strong>
                                                {home.assets ?? 0}
                                            </strong>

                                            <span>
                                                Assets
                                            </span>

                                        </div>


                                        <div>

                                            <Wrench size={16} />

                                            <strong>
                                                {home.maintenance ?? 0}
                                            </strong>

                                            <span>
                                                Maintenance
                                            </span>

                                        </div>


                                        <div>

                                            <FileText size={16} />

                                            <strong>
                                                {home.documents ?? 0}
                                            </strong>

                                            <span>
                                                Documents
                                            </span>

                                        </div>


                                        <div>

                                            <Bell size={16} />

                                            <strong>
                                                {home.reminders ?? 0}
                                            </strong>

                                            <span>
                                                Reminders
                                            </span>

                                        </div>

                                    </div>

                                </button>

                            );

                        })}

                    </div>

                )}

            </div>


            {/* ==========================================
                SERVICE REQUESTS
            ========================================== */}

            <div className="dashboard-section">

                <div className="section-header">

                    <div>

                        <h2>
                            Service requests
                        </h2>

                        <p>
                            Track your repair and
                            maintenance requests.
                        </p>

                    </div>


                    <button
                        className="section-action"
                        type="button"
                        onClick={() =>
                            navigate("/service-requests")
                        }
                    >

                        View all

                        <ArrowRight size={16} />

                    </button>

                </div>


                {!dashboard?.serviceRequests?.length ? (

                    <div className="empty-state">

                        <div className="dashboard-empty-icon">

                            <ClipboardList size={24} />

                        </div>

                        <h3>
                            No service requests
                        </h3>

                        <p>
                            Need help with an asset?
                            Book a service and track it here.
                        </p>

                        <button
                            type="button"
                            onClick={() =>
                                navigate("/services")
                            }
                        >
                            Book a Service
                        </button>

                    </div>

                ) : (

                    <div className="service-request-list">

                        {dashboard.serviceRequests.map(
                            (request) => {

                                const Icon =
                                    getServiceRequestIcon(
                                        request.status
                                    );

                                return (

                                    <button
                                        type="button"
                                        className="service-request-item"
                                        key={request._id}
                                        onClick={() =>
                                            navigate(
                                                `/service-requests/${request._id}`
                                            )
                                        }
                                    >

                                        <div className="service-request-main">

                                            <div className="service-request-icon">

                                                <Icon size={18} />

                                            </div>


                                            <div>

                                                <strong>
                                                    {request.title ||
                                                        "Service request"}
                                                </strong>

                                                <p>
                                                    {typeof request.asset === "string"
                                                        ? request.asset
                                                        : request.asset?.name ||
                                                        "Asset"}
                                                </p>

                                            </div>

                                        </div>


                                        <div className="service-request-meta">

                                            <span
                                                className={`request-status request-status-${String(
                                                    request.status ||
                                                    "PENDING"
                                                ).toLowerCase()}`}
                                            >

                                                {formatRequestStatus(
                                                    request.status
                                                )}

                                            </span>


                                            {request.scheduledDate && (

                                                <span className="service-request-date">

                                                    <Calendar size={14} />

                                                    {formatDate(
                                                        request.scheduledDate
                                                    )}

                                                </span>

                                            )}

                                        </div>


                                        <ArrowRight
                                            size={17}
                                            className="service-request-arrow"
                                        />

                                    </button>

                                );

                            }
                        )}

                    </div>

                )}

            </div>


            {/* ==========================================
                UPCOMING
            ========================================== */}

            <div className="dashboard-section">

                <div className="section-header">

                    <div>

                        <h2>
                            Upcoming
                        </h2>

                        <p>
                            Things you may need
                            to take care of.
                        </p>

                    </div>


                    <button
                        className="section-action"
                        type="button"
                        onClick={() =>
                            navigate("/maintenance")
                        }
                    >

                        View all

                        <ArrowRight size={16} />

                    </button>

                </div>


                {!dashboard?.upcoming?.length ? (

                    <div className="empty-state">

                        <div className="dashboard-empty-icon">

                            <CircleCheck size={24} />

                        </div>

                        <h3>
                            You're all caught up
                        </h3>

                        <p>
                            No upcoming maintenance or
                            warranty reminders require
                            your attention.
                        </p>

                    </div>

                ) : (

                    <div className="upcoming-list">

                        {dashboard.upcoming.map((item) => {

                            const Icon =
                                getUpcomingIcon(
                                    item.type
                                );

                            return (

                                <div
                                    className="upcoming-item"
                                    key={`${item.type}-${item._id}`}
                                >

                                    <div className="upcoming-item-main">

                                        <div className="upcoming-item-icon">

                                            <Icon size={18} />

                                        </div>


                                        <div>

                                            <strong>
                                                {item.title}
                                            </strong>

                                            <p>
                                                {typeof item.asset === "string"
                                                    ? item.asset
                                                    : item.asset?.name ||
                                                    "Asset"}
                                            </p>

                                        </div>

                                    </div>


                                    <div className="upcoming-date">

                                        <Calendar size={15} />

                                        <span>
                                            {formatDate(
                                                item.dueDate
                                            )}
                                        </span>

                                    </div>

                                </div>

                            );

                        })}

                    </div>

                )}

            </div>

        </div>

    );

}


export default Dashboard;
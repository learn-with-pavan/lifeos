import {
    Home as HomeIcon,
    Package,
    Wrench,
    FileText,
    AlertTriangle,
    ArrowRight,
    Calendar,
    ShieldAlert,
    Bell,
} from "lucide-react";

import {
    useEffect,
    useState,
} from "react";

import {
    useNavigate,
} from "react-router-dom";

import LoadingState from "../components/LoadingState";

import {
    getDashboard,
} from "../services/dashboardService";

import '../styles/dashboard.css'

function Dashboard() {

    const navigate = useNavigate();

    const [dashboard, setDashboard] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    const loadDashboard = async () => {

        try {

            setLoading(true);
            setError("");

            const response =
                await getDashboard();

            setDashboard(
                response.data
            );

        } catch (error) {

            console.error(
                "Failed to load dashboard:",
                error
            );

            setError(
                "Unable to load dashboard."
            );

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {
        loadDashboard();
    }, []);


    /*
     * Overview cards
     */

    const overview = [

        {
            label: "Homes",

            value:
                dashboard?.overview?.homes ??
                0,

            description:
                "Places you manage",

            icon: HomeIcon,
        },

        {
            label: "Assets",

            value:
                dashboard?.overview?.assets ??
                0,

            description:
                "Things you own",

            icon: Package,
        },

        {
            label: "Maintenance",

            value:
                dashboard?.overview?.maintenance ??
                0,

            description:
                "Upcoming maintenance",

            icon: Wrench,
        },

        {
            label: "Documents",

            value:
                dashboard?.overview?.documents ??
                0,

            description:
                "Important documents",

            icon: FileText,
        },

        {
            label: "Attention",

            value:
                dashboard?.overview?.attention ??
                0,

            description:
                "Things requiring action",

            icon: AlertTriangle,
        },

    ];


    const formatDate = (date) => {

        if (!date) {
            return "";
        }

        return new Date(
            date
        ).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    };


    const getUpcomingIcon = (type) => {

        if (
            type === "MAINTENANCE"
        ) {
            return Wrench;
        }

        return ShieldAlert;
    };


    const formatHomeType = (type) => {

        const types = {
            HOUSE: "House",
            APARTMENT: "Apartment",
            VILLA: "Villa",
            OTHER: "Other",
        };

        return (
            types[type] ||
            type ||
            "Home"
        );
    };


    return (

        <div className="dashboard">

            {/* Welcome */}

            <div className="welcome-section">

                <div>

                    <h1>
                        Good evening 👋
                    </h1>

                    <p>
                        Here's a quick overview
                        of what needs your
                        attention.
                    </p>

                </div>

            </div>


            {/* Overview */}

            <div className="overview-grid">

                {overview.map(
                    (item) => {

                        const Icon =
                            item.icon;

                        return (

                            <div
                                className="overview-card"
                                key={
                                    item.label
                                }
                            >

                                <div className="overview-card-top">

                                    <div className="overview-icon">

                                        <Icon
                                            size={20}
                                        />

                                    </div>

                                    <span>
                                        {
                                            item.label
                                        }
                                    </span>

                                </div>

                                <h2>
                                    {loading
                                        ? "..."
                                        : item.value}
                                </h2>

                                <p>
                                    {
                                        item.description
                                    }
                                </p>

                            </div>

                        );
                    }
                )}

            </div>


            {/* Homes */}

            <div className="dashboard-section">

                <div className="section-header">

                    <div>

                        <h2>
                            Your homes
                        </h2>

                        <p>
                            See what you have
                            inside each home.
                        </p>

                    </div>

                    <button
                        className="section-action"
                        type="button"
                        onClick={() =>
                            navigate(
                                "/homes"
                            )
                        }
                    >

                        View all

                        <ArrowRight
                            size={16}
                        />

                    </button>

                </div>


                {loading ? (

                    <LoadingState
                        title="Loading homes"
                        message="We're getting your home information."
                    />

                ) : error ? (

                    <div className="empty-state">

                        <h3>
                            Something went wrong
                        </h3>

                        <p>
                            {error}
                        </p>

                        <button
                            type="button"
                            onClick={
                                loadDashboard
                            }
                        >
                            Try again
                        </button>

                    </div>

                ) : !dashboard?.homes ||
                    dashboard.homes.length === 0 ? (

                    <div className="empty-state">

                        <div
                            className="dashboard-empty-icon"
                        >
                            <HomeIcon
                                size={24}
                            />
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
                                navigate(
                                    "/homes"
                                )
                            }
                        >
                            Add a home
                        </button>

                    </div>

                ) : (

                    <div className="dashboard-homes-grid">

                        {dashboard.homes.map(
                            (home) => (

                                <div
                                    className="dashboard-home-card"
                                    key={
                                        home._id
                                    }
                                    onClick={() =>
                                        navigate(
                                            `/homes/${home._id}`
                                        )
                                    }
                                >

                                    <div className="dashboard-home-header">

                                        <div className="dashboard-home-icon">

                                            <HomeIcon
                                                size={21}
                                            />

                                        </div>

                                        <div>

                                            <h3>
                                                {
                                                    home.name
                                                }
                                            </h3>

                                            <span>
                                                {
                                                    formatHomeType(
                                                        home.type
                                                    )
                                                }
                                            </span>

                                        </div>

                                        <ArrowRight
                                            size={17}
                                            className="dashboard-home-arrow"
                                        />

                                    </div>


                                    {home.address && (

                                        <p className="dashboard-home-address">

                                            {home.address}

                                        </p>

                                    )}


                                    <div className="dashboard-home-stats">

                                        <div>

                                            <Package
                                                size={16}
                                            />

                                            <strong>
                                                {
                                                    home.assets
                                                }
                                            </strong>

                                            <span>
                                                Assets
                                            </span>

                                        </div>


                                        <div>

                                            <Wrench
                                                size={16}
                                            />

                                            <strong>
                                                {
                                                    home.maintenance
                                                }
                                            </strong>

                                            <span>
                                                Maintenance
                                            </span>

                                        </div>


                                        <div>

                                            <FileText
                                                size={16}
                                            />

                                            <strong>
                                                {
                                                    home.documents
                                                }
                                            </strong>

                                            <span>
                                                Documents
                                            </span>

                                        </div>


                                        <div>

                                            <Bell
                                                size={16}
                                            />

                                            <strong>
                                                {
                                                    home.reminders
                                                }
                                            </strong>

                                            <span>
                                                Reminders
                                            </span>

                                        </div>

                                    </div>

                                </div>

                            )
                        )}

                    </div>

                )}

            </div>


            {/* Upcoming */}

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
                            navigate(
                                "/maintenance"
                            )
                        }
                    >

                        View all

                        <ArrowRight
                            size={16}
                        />

                    </button>

                </div>


                {loading ? (

                    <div className="empty-state">

                        <h3>
                            Loading...
                        </h3>

                        <p>
                            We're getting your
                            upcoming items.
                        </p>

                    </div>

                ) : error ? (

                    <div className="empty-state">

                        <h3>
                            Something went wrong
                        </h3>

                        <p>
                            {error}
                        </p>

                        <button
                            type="button"
                            onClick={
                                loadDashboard
                            }
                        >
                            Try again
                        </button>

                    </div>

                ) : !dashboard?.upcoming ||
                    dashboard.upcoming.length === 0 ? (

                    <div className="empty-state">

                        <h3>
                            You're all caught up
                        </h3>

                        <p>
                            No upcoming maintenance
                            or warranty reminders
                            require your attention.
                        </p>

                    </div>

                ) : (

                    <div className="upcoming-list">

                        {dashboard.upcoming.map(
                            (item) => {

                                const Icon =
                                    getUpcomingIcon(
                                        item.type
                                    );

                                return (

                                    <div
                                        className="upcoming-item"
                                        key={
                                            `${item.type}-${item._id}`
                                        }
                                    >

                                        <div className="upcoming-item-main">

                                            <div className="upcoming-item-icon">

                                                <Icon
                                                    size={18}
                                                />

                                            </div>

                                            <div>

                                                <strong>
                                                    {
                                                        item.title
                                                    }
                                                </strong>

                                                <p>
                                                    {
                                                        item.asset
                                                    }
                                                </p>

                                            </div>

                                        </div>


                                        <div className="upcoming-date">

                                            <Calendar
                                                size={15}
                                            />

                                            <span>
                                                {
                                                    formatDate(
                                                        item.dueDate
                                                    )
                                                }
                                            </span>

                                        </div>

                                    </div>

                                );
                            }
                        )}

                    </div>

                )}

            </div>

        </div>
    );
}

export default Dashboard;
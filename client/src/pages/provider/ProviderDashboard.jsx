import {
    CalendarDays,
    CheckCircle2,
    ClipboardList,
    Clock,
    RefreshCw,
    Wrench,
    ArrowRight,
} from "lucide-react";

import {
    useCallback,
    useEffect,
    useState,
} from "react";

import { useNavigate } from "react-router-dom";

import "../../styles/provider/providerDashboard.css";
import {
    getProviderDashboard,
} from "../../services/serviceProviderService";


const formatDate = (date) => {
    if (!date) return null;

    return new Date(date).toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }
    );
};


const formatDateParts = (date) => {
    if (!date) {
        return {
            day: "--",
            month: "",
        };
    }

    const value = new Date(date);

    return {
        day: value.getDate(),
        month: value.toLocaleDateString(
            "en-IN",
            { month: "short" }
        ),
    };
};


const getStatusClass = (status) =>
    String(status || "pending")
        .toLowerCase()
        .replace(/\s+/g, "-");


const ProviderDashboard = () => {

    const navigate = useNavigate();

    const [dashboard, setDashboard] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    const loadDashboard = useCallback(
        async () => {
            try {
                setLoading(true);
                setError("");

                const response =
                    await getProviderDashboard();

                setDashboard(
                    response?.data?.dashboard
                );
            } catch (requestError) {
                console.error(
                    "Failed to load provider dashboard:",
                    requestError
                );

                setError(
                    requestError?.response?.data?.message ||
                    "Unable to load provider dashboard."
                );
            } finally {
                setLoading(false);
            }
        },
        []
    );


    useEffect(() => {
        loadDashboard();
    }, [loadDashboard]);


    if (loading) {
        return (
            <div className="provider-dashboard-page">

                <div className="provider-dashboard-state">

                    <div className="provider-dashboard-state-icon">
                        <RefreshCw
                            size={24}
                            className="provider-dashboard-spin"
                        />
                    </div>

                    <h2>
                        Loading dashboard
                    </h2>

                    <p>
                        We're preparing your provider workspace.
                    </p>

                </div>

            </div>
        );
    }


    if (error) {
        return (
            <div className="provider-dashboard-page">

                <div className="provider-dashboard-state">

                    <div className="provider-dashboard-state-icon provider-dashboard-error-icon">
                        <RefreshCw size={24} />
                    </div>

                    <h2>
                        Unable to load dashboard
                    </h2>

                    <p>
                        {error}
                    </p>

                    <button
                        type="button"
                        className="provider-dashboard-retry"
                        onClick={loadDashboard}
                    >
                        Try again
                    </button>

                </div>

            </div>
        );
    }


    const counts =
        dashboard?.counts || {};

    const provider =
        dashboard?.provider || {};

    const todayServices =
        dashboard?.todayServices || [];

    const upcomingServices =
        dashboard?.upcomingServices || [];

    const recentRequests =
        dashboard?.recentRequests || [];


    const stats = [
        {
            label: "Pending Requests",
            value: counts.pending || 0,
            icon: ClipboardList,
            key: "pending",
        },
        {
            label: "Scheduled",
            value: counts.scheduled || 0,
            icon: CalendarDays,
            key: "scheduled",
        },
        {
            label: "In Progress",
            value: counts.inProgress || 0,
            icon: Clock,
            key: "in-progress",
        },
        {
            label: "Completed",
            value: counts.completed || 0,
            icon: CheckCircle2,
            key: "completed",
        },
    ];


    return (
        <div className="provider-dashboard-page">

            {/* HEADER */}

            <header className="provider-dashboard-header">

                <div className="provider-dashboard-heading">

                    <span className="provider-dashboard-eyebrow">
                        Provider Workspace
                    </span>

                    <h1>
                        Welcome back
                    </h1>

                    <p>
                        Manage your services, requests,
                        and appointments from one place.
                    </p>

                </div>


                <div className="provider-dashboard-header-meta">

                    <span className="provider-dashboard-date">
                        {new Date().toLocaleDateString(
                            "en-IN",
                            {
                                weekday: "long",
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                            }
                        )}
                    </span>

                    <div
                        className={`provider-dashboard-status ${
                            provider.isActive
                                ? "is-active"
                                : "is-inactive"
                        }`}
                    >
                        <span className="provider-dashboard-status-dot" />

                        <span>
                            {provider.availability ||
                                "AVAILABLE"}
                        </span>
                    </div>

                </div>

            </header>


            {/* STATS */}

            <section className="provider-dashboard-stats">

                {stats.map((stat) => {

                    const Icon = stat.icon;

                    return (
                        <div
                            className="provider-dashboard-stat-card"
                            key={stat.key}
                        >

                            <div
                                className={`provider-dashboard-stat-icon provider-stat-icon-${stat.key}`}
                            >
                                <Icon size={20} />
                            </div>

                            <div className="provider-dashboard-stat-content">

                                <span>
                                    {stat.label}
                                </span>

                                <strong>
                                    {stat.value}
                                </strong>

                            </div>

                        </div>
                    );
                })}

            </section>


            {/* TODAY + UPCOMING */}

            <div className="provider-dashboard-content">

                {/* TODAY */}

                <section className="provider-dashboard-card">

                    <div className="provider-dashboard-card-header">

                        <div>
                            <div className="provider-dashboard-section-title">
                                <CalendarDays size={18} />

                                <h2>
                                    Today's Services
                                </h2>
                            </div>

                            <p>
                                Your scheduled services for today.
                            </p>
                        </div>

                        {todayServices.length > 0 && (
                            <span className="provider-dashboard-count">
                                {todayServices.length}
                            </span>
                        )}

                    </div>


                    {todayServices.length === 0 ? (

                        <div className="provider-dashboard-empty">

                            <div className="provider-dashboard-empty-icon">
                                <CalendarDays size={24} />
                            </div>

                            <strong>
                                No services today
                            </strong>

                            <span>
                                You don't have any scheduled
                                services for today.
                            </span>

                        </div>

                    ) : (

                        <div className="provider-dashboard-service-list">

                            {todayServices.map((service) => (

                                <button
                                    type="button"
                                    key={service._id}
                                    className="provider-dashboard-service-item"
                                    onClick={() =>
                                        navigate(
                                            `/provider/requests/${service._id}`
                                        )
                                    }
                                >

                                    <div className="provider-dashboard-service-icon">
                                        <Wrench size={18} />
                                    </div>


                                    <div className="provider-dashboard-service-info">

                                        <strong>
                                            {service.asset?.name ||
                                                "Service"}
                                        </strong>

                                        <span>
                                            {service.serviceType ||
                                                "Service"}

                                            {service.scheduling
                                                ?.scheduledTime && (
                                                <>
                                                    <span className="provider-dashboard-meta-dot">
                                                        ·
                                                    </span>

                                                    {
                                                        service.scheduling
                                                            .scheduledTime
                                                    }
                                                </>
                                            )}
                                        </span>

                                    </div>


                                    <span
                                        className={`provider-status-badge provider-status-${getStatusClass(
                                            service.status
                                        )}`}
                                    >
                                        {service.status ||
                                            "Pending"}
                                    </span>


                                    <ArrowRight
                                        size={16}
                                        className="provider-dashboard-item-arrow"
                                    />

                                </button>

                            ))}

                        </div>

                    )}

                </section>


                {/* UPCOMING */}

                <section className="provider-dashboard-card">

                    <div className="provider-dashboard-card-header">

                        <div>
                            <div className="provider-dashboard-section-title">
                                <CalendarDays size={18} />

                                <h2>
                                    Upcoming Services
                                </h2>
                            </div>

                            <p>
                                Your next scheduled appointments.
                            </p>
                        </div>

                        {upcomingServices.length > 0 && (
                            <span className="provider-dashboard-count">
                                {upcomingServices.length}
                            </span>
                        )}

                    </div>


                    {upcomingServices.length === 0 ? (

                        <div className="provider-dashboard-empty">

                            <div className="provider-dashboard-empty-icon">
                                <CalendarDays size={24} />
                            </div>

                            <strong>
                                No upcoming services
                            </strong>

                            <span>
                                Your upcoming appointments
                                will appear here.
                            </span>

                        </div>

                    ) : (

                        <div className="provider-dashboard-upcoming-list">

                            {upcomingServices.map(
                                (service) => {

                                    const date =
                                        formatDateParts(
                                            service.scheduling
                                                ?.scheduledDate
                                        );

                                    return (
                                        <button
                                            type="button"
                                            key={service._id}
                                            className="provider-dashboard-upcoming-item"
                                            onClick={() =>
                                                navigate(
                                                    `/provider/requests/${service._id}`
                                                )
                                            }
                                        >

                                            <div className="provider-dashboard-date-block">

                                                <strong>
                                                    {date.day}
                                                </strong>

                                                <span>
                                                    {date.month}
                                                </span>

                                            </div>


                                            <div className="provider-dashboard-service-info">

                                                <strong>
                                                    {service.asset?.name ||
                                                        "Service"}
                                                </strong>

                                                <span>
                                                    {service.serviceType ||
                                                        "Service"}

                                                    <span className="provider-dashboard-meta-dot">
                                                        ·
                                                    </span>

                                                    {service.scheduling
                                                        ?.scheduledTime ||
                                                        "Time not specified"}
                                                </span>

                                            </div>


                                            <ArrowRight
                                                size={16}
                                                className="provider-dashboard-item-arrow"
                                            />

                                        </button>
                                    );
                                }
                            )}

                        </div>

                    )}

                </section>

            </div>


            {/* RECENT REQUESTS */}

            <section className="provider-dashboard-card provider-dashboard-recent-card">

                <div className="provider-dashboard-card-header">

                    <div>
                        <div className="provider-dashboard-section-title">

                            <ClipboardList size={18} />

                            <h2>
                                Recent Requests
                            </h2>

                        </div>

                        <p>
                            Latest service requests assigned
                            to your business.
                        </p>
                    </div>


                    <button
                        type="button"
                        className="provider-dashboard-view-all"
                        onClick={() =>
                            navigate(
                                "/provider/requests"
                            )
                        }
                    >
                        View all
                        <ArrowRight size={15} />
                    </button>

                </div>


                {recentRequests.length === 0 ? (

                    <div className="provider-dashboard-empty">

                        <div className="provider-dashboard-empty-icon">
                            <ClipboardList size={24} />
                        </div>

                        <strong>
                            No requests yet
                        </strong>

                        <span>
                            New customer requests will
                            appear here.
                        </span>

                    </div>

                ) : (

                    <div className="provider-dashboard-request-list">

                        {recentRequests.map(
                            (service) => (

                                <button
                                    type="button"
                                    key={service._id}
                                    className="provider-dashboard-request-item"
                                    onClick={() =>
                                        navigate(
                                            `/provider/requests/${service._id}`
                                        )
                                    }
                                >

                                    <div className="provider-dashboard-request-main">

                                        <div className="provider-dashboard-request-icon">
                                            <Wrench size={17} />
                                        </div>

                                        <div>

                                            <strong>
                                                {service.asset?.name ||
                                                    "Service Request"}
                                            </strong>

                                            <span>
                                                {service.serviceType ||
                                                    "Service"}

                                                <span className="provider-dashboard-meta-dot">
                                                    ·
                                                </span>

                                                {service.user?.name ||
                                                    "Customer"}

                                                {service.scheduling
                                                    ?.scheduledDate && (
                                                    <>
                                                        <span className="provider-dashboard-meta-dot">
                                                            ·
                                                        </span>

                                                        {
                                                            formatDate(
                                                                service
                                                                    .scheduling
                                                                    .scheduledDate
                                                            )
                                                        }
                                                    </>
                                                )}
                                            </span>

                                        </div>

                                    </div>


                                    <div className="provider-dashboard-request-end">

                                        <span
                                            className={`provider-status-badge provider-status-${getStatusClass(
                                                service.status
                                            )}`}
                                        >
                                            {service.status ||
                                                "Pending"}
                                        </span>

                                        <ArrowRight
                                            size={16}
                                            className="provider-dashboard-item-arrow"
                                        />

                                    </div>

                                </button>

                            )
                        )}

                    </div>

                )}

            </section>

        </div>
    );
};


export default ProviderDashboard;
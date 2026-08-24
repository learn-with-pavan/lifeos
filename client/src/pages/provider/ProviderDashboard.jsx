import {
    CalendarDays,
    CheckCircle2,
    Clock,
    ClipboardList,
    RefreshCw,
    Wrench,
} from "lucide-react";

import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    useNavigate,
} from "react-router-dom";

import "../../styles/provider/providerDashboard.css";
import { getProviderDashboard } from "../../services/serviceProviderService";


const ProviderDashboard = () => {

    const navigate =
        useNavigate();


    const [
        dashboard,
        setDashboard,
    ] = useState(null);


    const [
        loading,
        setLoading,
    ] = useState(true);


    const [
        error,
        setError,
    ] = useState("");


    const loadDashboard =
        useCallback(
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
                        requestError
                            ?.response
                            ?.data
                            ?.message ||
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

                    <RefreshCw
                        size={28}
                        className="provider-dashboard-spin"
                    />

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

                    <h2>
                        Unable to load dashboard
                    </h2>

                    <p>
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={loadDashboard}
                    >
                        Try Again
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


    return (

        <div className="provider-dashboard-page">

            {/* HEADER */}

            <div className="provider-dashboard-header">

                <div>

                    <span className="provider-dashboard-eyebrow">
                        Provider Workspace
                    </span>

                    <h1>
                        Welcome back
                    </h1>

                    <p>
                        Manage your services,
                        requests and appointments
                        from one place.
                    </p>

                </div>


                <div className="provider-dashboard-status">

                    <span
                        className={
                            provider.isActive
                                ? "provider-dashboard-status-active"
                                : "provider-dashboard-status-inactive"
                        }
                    />

                    <span>
                        {provider.availability ||
                            "AVAILABLE"}
                    </span>

                </div>

            </div>


            {/* STAT CARDS */}

            <section className="provider-dashboard-stats">

                <div className="provider-dashboard-stat-card">

                    <div className="provider-dashboard-stat-icon">

                        <ClipboardList
                            size={20}
                        />

                    </div>

                    <div>

                        <span>
                            Pending Requests
                        </span>

                        <strong>
                            {counts.pending || 0}
                        </strong>

                    </div>

                </div>


                <div className="provider-dashboard-stat-card">

                    <div className="provider-dashboard-stat-icon">

                        <CalendarDays
                            size={20}
                        />

                    </div>

                    <div>

                        <span>
                            Scheduled
                        </span>

                        <strong>
                            {counts.scheduled || 0}
                        </strong>

                    </div>

                </div>


                <div className="provider-dashboard-stat-card">

                    <div className="provider-dashboard-stat-icon">

                        <Clock
                            size={20}
                        />

                    </div>

                    <div>

                        <span>
                            In Progress
                        </span>

                        <strong>
                            {counts.inProgress || 0}
                        </strong>

                    </div>

                </div>


                <div className="provider-dashboard-stat-card">

                    <div className="provider-dashboard-stat-icon">

                        <CheckCircle2
                            size={20}
                        />

                    </div>

                    <div>

                        <span>
                            Completed
                        </span>

                        <strong>
                            {counts.completed || 0}
                        </strong>

                    </div>

                </div>

            </section>


            {/* MAIN GRID */}

            <div className="provider-dashboard-content">

                {/* TODAY */}

                <section className="provider-dashboard-card">

                    <div className="provider-dashboard-card-header">

                        <div>

                            <h2>
                                Today's Services
                            </h2>

                            <p>
                                Your scheduled services for today.
                            </p>

                        </div>

                        <CalendarDays
                            size={20}
                        />

                    </div>


                    {todayServices.length === 0 ? (

                        <div className="provider-dashboard-empty">

                            <CalendarDays
                                size={28}
                            />

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

                            {todayServices.map(
                                (service) => (

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

                                            <Wrench
                                                size={18}
                                            />

                                        </div>


                                        <div className="provider-dashboard-service-info">

                                            <strong>
                                                {
                                                    service.asset
                                                        ?.name ||
                                                    "Service"
                                                }
                                            </strong>

                                            <span>
                                                {
                                                    service.serviceType
                                                }
                                                {" · "}
                                                {
                                                    service.scheduling
                                                        ?.scheduledTime ||
                                                    "Time not specified"
                                                }
                                            </span>

                                        </div>


                                        <span className="provider-dashboard-service-status">

                                            {
                                                service.status
                                            }

                                        </span>

                                    </button>

                                )
                            )}

                        </div>

                    )}

                </section>


                {/* UPCOMING */}

                <section className="provider-dashboard-card">

                    <div className="provider-dashboard-card-header">

                        <div>

                            <h2>
                                Upcoming Services
                            </h2>

                            <p>
                                Your next scheduled appointments.
                            </p>

                        </div>

                        <CalendarDays
                            size={20}
                        />

                    </div>


                    {upcomingServices.length === 0 ? (

                        <div className="provider-dashboard-empty">

                            <CalendarDays
                                size={28}
                            />

                            <strong>
                                No upcoming services
                            </strong>

                            <span>
                                Your upcoming appointments
                                will appear here.
                            </span>

                        </div>

                    ) : (

                        <div className="provider-dashboard-service-list">

                            {upcomingServices.map(
                                (service) => (

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

                                            <CalendarDays
                                                size={18}
                                            />

                                        </div>


                                        <div className="provider-dashboard-service-info">

                                            <strong>
                                                {
                                                    service.asset
                                                        ?.name ||
                                                    "Service"
                                                }
                                            </strong>

                                            <span>
                                                {
                                                    service.scheduling
                                                        ?.scheduledDate
                                                        ? new Date(
                                                            service.scheduling.scheduledDate
                                                        ).toLocaleDateString()
                                                        : "Date not specified"
                                                }
                                                {" · "}
                                                {
                                                    service.scheduling
                                                        ?.scheduledTime ||
                                                    ""
                                                }
                                            </span>

                                        </div>

                                    </button>

                                )
                            )}

                        </div>

                    )}

                </section>

            </div>


            {/* RECENT REQUESTS */}

            <section className="provider-dashboard-card">

                <div className="provider-dashboard-card-header">

                    <div>

                        <h2>
                            Recent Requests
                        </h2>

                        <p>
                            Latest service requests assigned
                            to your business.
                        </p>

                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/provider/requests"
                            )
                        }
                    >
                        View all
                    </button>

                </div>


                {recentRequests.length === 0 ? (

                    <div className="provider-dashboard-empty">

                        <ClipboardList
                            size={28}
                        />

                        <strong>
                            No requests yet
                        </strong>

                        <span>
                            New customer requests
                            will appear here.
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

                                    <div>

                                        <strong>
                                            {
                                                service.asset
                                                    ?.name ||
                                                "Service Request"
                                            }
                                        </strong>

                                        <span>
                                            {
                                                service.serviceType
                                            }
                                            {" · "}
                                            {
                                                service.user
                                                    ?.name ||
                                                "Customer"
                                            }
                                        </span>

                                    </div>


                                    <span className="provider-dashboard-request-status">

                                        {
                                            service.status
                                        }

                                    </span>

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
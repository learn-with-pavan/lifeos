import {
    ArrowRight,
    CalendarDays,
    Clock,
    RefreshCw,
    UserRound,
    Wrench,
} from "lucide-react";

import {
    useCallback,
    useEffect,
    useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
    getProviderSchedule,
} from "../../services/serviceProviderService";

import "../../styles/provider/providerSchedule.css";


const STATUS_LABELS = {
    SCHEDULED: "Scheduled",
    IN_PROGRESS: "In Progress",
    COMPLETED: "Completed",
};


const getStatusLabel = (status) =>
    STATUS_LABELS[status] || status;


const formatDate = (value) => {
    if (!value) {
        return "Date not specified";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Date not specified";
    }

    return date.toLocaleDateString(
        undefined,
        {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric",
        }
    );
};


const formatTime = (value) =>
    value || "Time not specified";


const ProviderSchedule = () => {
    const navigate = useNavigate();

    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [refreshing, setRefreshing] = useState(false);


    const loadSchedule = useCallback(
        async (isRefresh = false) => {
            try {
                isRefresh
                    ? setRefreshing(true)
                    : setLoading(true);

                setError("");

                const response =
                    await getProviderSchedule();

                setSchedule(
                    response?.data?.schedule || []
                );
            } catch (requestError) {
                console.error(
                    "Failed to load provider schedule:",
                    requestError
                );

                setError(
                    requestError?.response?.data?.message ||
                    "Unable to load your schedule."
                );
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        []
    );


    useEffect(() => {
        loadSchedule();
    }, [loadSchedule]);


    if (loading) {
        return (
            <div className="provider-schedule-page">

                <div className="provider-schedule-state">
                    <RefreshCw
                        size={28}
                        className="provider-schedule-spin"
                    />

                    <h2>
                        Loading schedule
                    </h2>

                    <p>
                        We're retrieving your appointments.
                    </p>
                </div>

            </div>
        );
    }


    if (error) {
        return (
            <div className="provider-schedule-page">

                <div className="provider-schedule-state">

                    <div className="provider-schedule-state-icon">
                        <CalendarDays size={26} />
                    </div>

                    <h2>
                        Unable to load schedule
                    </h2>

                    <p>
                        {error}
                    </p>

                    <button
                        type="button"
                        className="provider-schedule-retry"
                        onClick={() => loadSchedule()}
                    >
                        Try again
                    </button>

                </div>

            </div>
        );
    }


    return (
        <div className="provider-schedule-page">

            {/* HEADER */}

            <header className="provider-schedule-header">

                <div>
                    <span className="provider-schedule-eyebrow">
                        Provider Workspace
                    </span>

                    <h1>
                        Schedule
                    </h1>

                    <p>
                        Manage your upcoming service
                        appointments.
                    </p>
                </div>


                <button
                    type="button"
                    className="provider-schedule-refresh"
                    onClick={() => loadSchedule(true)}
                    disabled={refreshing}
                >
                    <RefreshCw
                        size={16}
                        className={
                            refreshing
                                ? "provider-schedule-refresh-spin"
                                : ""
                        }
                    />

                    {refreshing
                        ? "Refreshing..."
                        : "Refresh"}
                </button>

            </header>


            {/* EMPTY */}

            {schedule.length === 0 ? (

                <section className="provider-schedule-empty">

                    <div className="provider-schedule-empty-icon">
                        <CalendarDays size={30} />
                    </div>

                    <h2>
                        No scheduled services
                    </h2>

                    <p>
                        Your upcoming appointments
                        will appear here once a service
                        is scheduled.
                    </p>

                </section>

            ) : (

                <section className="provider-schedule-list">

                    {schedule.map((request) => {

                        const status =
                            request.status?.toLowerCase() ||
                            "scheduled";

                        const duration =
                            request.scheduling
                                ?.durationMinutes;

                        return (
                            <button
                                type="button"
                                key={request._id}
                                className="provider-schedule-item"
                                onClick={() =>
                                    navigate(
                                        `/provider/requests/${request._id}`
                                    )
                                }
                            >

                                {/* DATE */}

                                <div className="provider-schedule-date">

                                    <div className="provider-schedule-date-icon">
                                        <CalendarDays size={18} />
                                    </div>

                                    <div>
                                        <span>
                                            Appointment
                                        </span>

                                        <strong>
                                            {formatDate(
                                                request
                                                    .scheduling
                                                    ?.scheduledDate
                                            )}
                                        </strong>
                                    </div>

                                </div>


                                {/* SERVICE */}

                                <div className="provider-schedule-service">

                                    <div className="provider-schedule-service-icon">
                                        <Wrench size={19} />
                                    </div>

                                    <div className="provider-schedule-service-info">

                                        <strong>
                                            {
                                                request.asset?.name ||
                                                "Service"
                                            }
                                        </strong>

                                        <span>
                                            {
                                                request.serviceType ||
                                                "Service request"
                                            }

                                            {request.asset?.category && (
                                                <>
                                                    {" · "}
                                                    {
                                                        request.asset.category
                                                    }
                                                </>
                                            )}
                                        </span>

                                    </div>

                                </div>


                                {/* CUSTOMER */}

                                <div className="provider-schedule-customer">

                                    <UserRound size={16} />

                                    <div>
                                        <span>
                                            Customer
                                        </span>

                                        <strong>
                                            {
                                                request.user?.name ||
                                                "Customer"
                                            }
                                        </strong>
                                    </div>

                                </div>


                                {/* TIME */}

                                <div className="provider-schedule-time">

                                    <Clock size={17} />

                                    <div>
                                        <strong>
                                            {formatTime(
                                                request
                                                    .scheduling
                                                    ?.scheduledTime
                                            )}
                                        </strong>

                                        <span>
                                            {duration || 0}
                                            {" "}
                                            min
                                        </span>
                                    </div>

                                </div>


                                {/* STATUS */}

                                <span
                                    className={`provider-schedule-status provider-schedule-status-${status}`}
                                >
                                    {getStatusLabel(
                                        request.status
                                    )}
                                </span>


                                {/* ARROW */}

                                <ArrowRight
                                    size={18}
                                    className="provider-schedule-arrow"
                                />

                            </button>
                        );
                    })}

                </section>

            )}

        </div>
    );
};


export default ProviderSchedule;
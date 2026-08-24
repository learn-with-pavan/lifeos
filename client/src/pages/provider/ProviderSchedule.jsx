import {
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

import {
    useNavigate,
} from "react-router-dom";

import {
    getProviderSchedule,
} from "../../services/serviceProviderService";

import "../../styles/provider/providerSchedule.css";


const getStatusLabel = (status) => {

    const labels = {
        SCHEDULED: "Scheduled",
        IN_PROGRESS: "In Progress",
        COMPLETED: "Completed",
    };

    return labels[status] || status;
};


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


const formatTime = (value) => {

    if (!value) {
        return "Time not specified";
    }

    return value;
};


const ProviderSchedule = () => {

    const navigate = useNavigate();


    const [
        schedule,
        setSchedule,
    ] = useState([]);


    const [
        loading,
        setLoading,
    ] = useState(true);


    const [
        error,
        setError,
    ] = useState("");


    const loadSchedule =
        useCallback(
            async () => {

                try {

                    setLoading(true);
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
                        requestError
                            ?.response
                            ?.data
                            ?.message ||
                        "Unable to load your schedule."
                    );

                } finally {

                    setLoading(false);

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

                    <h2>
                        Unable to load schedule
                    </h2>

                    <p>
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={loadSchedule}
                    >
                        Try Again
                    </button>

                </div>

            </div>
        );
    }


    return (
        <div className="provider-schedule-page">

            {/* HEADER */}

            <div className="provider-schedule-header">

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
                    onClick={loadSchedule}
                >
                    <RefreshCw size={16} />

                    Refresh
                </button>

            </div>


            {/* EMPTY */}

            {schedule.length === 0 ? (

                <section className="provider-schedule-empty">

                    <CalendarDays size={42} />

                    <h2>
                        No scheduled services
                    </h2>

                    <p>
                        Your upcoming appointments
                        will appear here.
                    </p>

                </section>

            ) : (

                <section className="provider-schedule-list">

                    {schedule.map((request) => (

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

                                <CalendarDays size={19} />

                                <strong>
                                    {formatDate(
                                        request
                                            .scheduling
                                            ?.scheduledDate
                                    )}
                                </strong>

                            </div>


                            {/* SERVICE */}

                            <div className="provider-schedule-service">

                                <div className="provider-schedule-service-icon">

                                    <Wrench size={19} />

                                </div>


                                <div>

                                    <strong>
                                        {
                                            request.asset?.name ||
                                            "Service"
                                        }
                                    </strong>

                                    <span>
                                        {
                                            request.serviceType
                                        }

                                        {" · "}

                                        {
                                            request.asset?.category ||
                                            "Asset"
                                        }
                                    </span>

                                </div>

                            </div>


                            {/* CUSTOMER */}

                            <div className="provider-schedule-customer">

                                <UserRound size={17} />

                                <span>
                                    {
                                        request.user?.name ||
                                        "Customer"
                                    }
                                </span>

                            </div>


                            {/* TIME */}

                            <div className="provider-schedule-time">

                                <Clock size={17} />

                                <div>

                                    <strong>
                                        {
                                            formatTime(
                                                request
                                                    .scheduling
                                                    ?.scheduledTime
                                            )
                                        }
                                    </strong>

                                    <span>
                                        {
                                            request
                                                .scheduling
                                                ?.durationMinutes ||
                                            0
                                        }{" "}
                                        minutes
                                    </span>

                                </div>

                            </div>


                            {/* STATUS */}

                            <span
                                className={`provider-schedule-status provider-schedule-status-${request.status.toLowerCase()}`}
                            >
                                {
                                    getStatusLabel(
                                        request.status
                                    )
                                }
                            </span>

                        </button>

                    ))}

                </section>

            )}

        </div>
    );
};


export default ProviderSchedule;
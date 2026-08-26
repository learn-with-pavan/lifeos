import {
    ArrowLeft,
    CalendarDays,
    ChevronRight,
    Clock,
    FileText,
    RefreshCw,
    Wrench,
    XCircle
} from "lucide-react";

import {
    useEffect,
    useState,
} from "react";

import {
    useNavigate,
} from "react-router-dom";

import {
    getMyServiceRequests,
} from "../services/serviceRequestService";

import LoadingState from "../components/LoadingState";

import "../styles/myServiceRequests.css";


const STATUS_CONFIG = {

    PENDING: {
        label: "Pending",
        className: "status-pending",
    },

    ACCEPTED: {
        label: "Accepted",
        className: "status-accepted",
    },

    REJECTED: {
        label: "Rejected",
        className: "status-rejected",
    },

    SCHEDULED: {
        label: "Scheduled",
        className: "status-scheduled",
    },

    IN_PROGRESS: {
        label: "In Progress",
        className: "status-progress",
    },

    COMPLETED: {
        label: "Completed",
        className: "status-completed",
    },

    CANCELLED: {
        label: "Cancelled",
        className: "status-cancelled",
    },

};


const formatDate = (
    value
) => {

    if (!value) {
        return "Date not selected";
    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return value;
    }


    return date.toLocaleDateString(
        undefined,
        {
            day: "numeric",
            month: "short",
            year: "numeric",
        }
    );
};


const getStatusConfig = (
    status
) => {

    return (
        STATUS_CONFIG[
        status
        ] || {
            label:
                status ||
                "Pending",

            className:
                "status-pending",
        }
    );
};


const MyServiceRequests = () => {

    const navigate =
        useNavigate();


    const [
        requests,
        setRequests,
    ] = useState([]);


    const [
        loading,
        setLoading,
    ] = useState(true);


    const [
        error,
        setError,
    ] = useState("");


    const loadRequests =
        async () => {

            try {

                setLoading(true);
                setError("");


                const response =
                    await getMyServiceRequests();


                /*
                 * Support both:
                 *
                 * response.data
                 *
                 * and
                 *
                 * response.data.requests
                 */

                const responseData =
                    response?.data;


                const requestList =
                    Array.isArray(
                        responseData
                    )
                        ? responseData
                        : Array.isArray(
                            responseData?.requests
                        )
                            ? responseData.requests
                            : [];


                setRequests(
                    requestList
                );

            } catch (
            requestError
            ) {

                console.error(
                    "Failed to load service requests:",
                    requestError
                );


                setError(
                    requestError
                        ?.response
                        ?.data
                        ?.message ||
                    "Unable to load your service requests."
                );

            } finally {

                setLoading(false);

            }
        };


    useEffect(() => {

        loadRequests();

    }, []);


    return (
        <div className="my-service-requests-page">

            {/* HEADER */}

            <div className="my-requests-header">

                <div className="my-requests-title-wrapper">

                    <div>

                        <h1>
                            My Service Requests
                        </h1>

                        <p>
                            Track and manage your
                            service requests.
                        </p>

                    </div>

                </div>

            </div>


            {/* LOADING */}

            {loading && (

                <LoadingState
                    title="Loading requests"
                    message="We're checking for your latest service requests."
                />

            )}


            {/* ERROR */}

            {!loading &&
                error && (

                    <div className="my-requests-state-card">

                        <div className="my-requests-state-icon error-icon">

                            <FileText
                                size={27}
                            />

                        </div>

                        <h2>
                            Unable to load requests
                        </h2>

                        <p>
                            {error}
                        </p>


                        <button
                            type="button"
                            className="my-requests-secondary-button"
                            onClick={
                                loadRequests
                            }
                        >

                            <RefreshCw
                                size={16}
                            />

                            Try Again

                        </button>

                    </div>

                )}


            {/* EMPTY */}

            {!loading &&
                !error &&
                requests.length === 0 && (

                    <div className="my-requests-state-card">

                        <div className="my-requests-state-icon">

                            <Wrench
                                size={28}
                            />

                        </div>


                        <h2>
                            No service requests yet
                        </h2>


                        <p>
                            When you request a service
                            from a technician, your
                            requests will appear here.
                        </p>


                        <button
                            type="button"
                            className="my-requests-primary-button"
                            onClick={() =>
                                navigate(
                                    "/assets"
                                )
                            }
                        >
                            Find a Service
                        </button>

                    </div>

                )}


            {/* REQUEST LIST */}

            {!loading &&
                !error &&
                requests.length > 0 && (

                    <div className="my-requests-content">

                        <div className="my-requests-list-header">

                            <div>

                                <h2>
                                    Service requests
                                </h2>

                                <p>
                                    {requests.length}
                                    {" "}
                                    {requests.length === 1
                                        ? "request"
                                        : "requests"}
                                </p>

                            </div>

                        </div>


                        <div className="my-requests-list">

                            {requests.map(
                                (request) => {

                                    const status =
                                        getStatusConfig(
                                            request.status
                                        );


                                    const asset =
                                        request.asset;


                                    const provider =
                                        request.serviceProvider;


                                    const assetName =
                                        asset?.name ||
                                        "Asset";


                                    const providerName =
                                        provider
                                            ?.businessName ||
                                        provider
                                            ?.name ||
                                        "Service Provider";


                                    const serviceType =
                                        request.serviceType ||
                                        "SERVICE";


                                    return (

                                        <button
                                            type="button"
                                            key={
                                                request._id
                                            }
                                            className="service-request-card"
                                            onClick={() =>
                                                navigate(
                                                    `/service-requests/${request._id}`
                                                )
                                            }
                                        >

                                            {/* ICON */}

                                            <div className="service-request-icon">

                                                <Wrench
                                                    size={22}
                                                />

                                            </div>


                                            {/* CONTENT */}

                                            <div className="service-request-content">

                                                <div className="service-request-title-row">

                                                    <div>

                                                        <h3>
                                                            {assetName}
                                                        </h3>

                                                        <p>
                                                            {
                                                                providerName
                                                            }
                                                        </p>

                                                    </div>


                                                    <span
                                                        className={`service-request-status ${status.className}`}
                                                    >
                                                        {
                                                            status.label
                                                        }
                                                    </span>

                                                </div>


                                                <div className="service-request-meta">

                                                    <span>

                                                        <Wrench
                                                            size={14}
                                                        />

                                                        {
                                                            serviceType
                                                        }

                                                    </span>


                                                    <span>

                                                        <CalendarDays
                                                            size={14}
                                                        />

                                                        {
                                                            formatDate(
                                                                request.preferredDate
                                                            )
                                                        }

                                                    </span>


                                                    {request.preferredTime && (

                                                        <span>

                                                            <Clock
                                                                size={14}
                                                            />

                                                            {
                                                                request.preferredTime
                                                            }

                                                        </span>

                                                    )}

                                                </div>

                                                {request.description && (

                                                    <p className="service-request-description">

                                                        {
                                                            request.description
                                                        }

                                                    </p>

                                                )}

                                                {request.status === "CANCELLED" && (

                                                    <div className="service-request-cancelled-note">

                                                        <XCircle
                                                            size={14}
                                                        />

                                                        <span>
                                                            Appointment cancelled
                                                        </span>

                                                    </div>

                                                )}

                                            </div>

                                            {/* ARROW */}

                                            <div className="service-request-arrow">

                                                <ChevronRight
                                                    size={20}
                                                />

                                            </div>

                                        </button>

                                    );
                                }
                            )}

                        </div>

                    </div>

                )}

        </div>
    );
};


export default MyServiceRequests;
import {
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    Clock,
    FileText,
    MapPin,
    Phone,
    RefreshCw,
    UserRound,
    Wrench,
    XCircle,
    Star
} from "lucide-react";

import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    useNavigate,
    useParams,
} from "react-router-dom";

import {
    cancelServiceRequest,
    getServiceRequestById,
} from "../services/serviceRequestService";
import LoadingState from "../components/LoadingState";

import "../styles/serviceRequestDetails.css";
import { createReview, getReviewForServiceRequest } from "../services/reviewService";
import { getPaymentForServiceRequest } from "../services/paymentService";
import ServiceRequestPaymentCard from "../components/ServiceRequestPaymentCard";


const STATUS_CONFIG = {

    PENDING: {
        label: "Pending",
        className: "request-status-pending",
    },

    ACCEPTED: {
        label: "Accepted",
        className: "request-status-accepted",
    },

    REJECTED: {
        label: "Rejected",
        className: "request-status-rejected",
    },

    SCHEDULED: {
        label: "Scheduled",
        className: "request-status-scheduled",
    },

    IN_PROGRESS: {
        label: "In Progress",
        className: "request-status-progress",
    },

    COMPLETED: {
        label: "Completed",
        className: "request-status-completed",
    },

    CANCELLED: {
        label: "Cancelled",
        className: "request-status-cancelled",
    },

};

const formatDate = (value) => {

    if (!value) {
        return "Not scheduled";
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
            month: "long",
            year: "numeric",
        }
    );
};

const getStatusConfig = (status) => {

    return (
        STATUS_CONFIG[status] || {
            label:
                status ||
                "Pending",

            className:
                "request-status-pending",
        }
    );
};


const getServiceTypeLabel = (serviceType) => {

    const labels = {
        REPAIR: "Repair",
        SERVICE: "Service",
        INSPECTION: "Inspection",
    };


    return (
        labels[
        serviceType
        ] ||
        serviceType ||
        "Service"
    );
};


const ServiceRequestDetails = () => {

    const {
        requestId,
    } = useParams();


    const navigate =
        useNavigate();


    const [
        request,
        setRequest,
    ] = useState(null);


    const [
        loading,
        setLoading,
    ] = useState(true);


    const [
        error,
        setError,
    ] = useState("");

    const [
        cancelling,
        setCancelling,
    ] = useState(false);

    const [payment, setPayment] =
        useState(null);

    const [paymentLoading, setPaymentLoading] =
        useState(false);

    const loadRequest = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response =
                await getServiceRequestById(
                    requestId
                );


            const data =
                response?.data;


            setRequest(
                data?.request ||
                data?.data ||
                data
            );

        } catch (
        requestError
        ) {

            console.error(
                "Failed to load service request:",
                requestError
            );


            setError(
                requestError
                    ?.response
                    ?.data
                    ?.message ||
                "Unable to load this service request."
            );

        } finally {

            setLoading(false);

        }

    },
        [requestId]
    );

    const loadPayment = async () => {

        if (!requestId) {
            return;
        }

        try {

            setPaymentLoading(true);

            const response =
                await getPaymentForServiceRequest(
                    requestId
                );

            setPayment(
                response?.payment || null
            );

        } catch (error) {
            setPayment(null);

        } finally {

            setPaymentLoading(false);

        }
    };

    useEffect(() => {
        loadRequest();
        loadPayment();
    }, [loadRequest]);


    const handleCancelRequest = async () => {

        try {

            setCancelling(true);


            await cancelServiceRequest(
                requestId
            );


            await loadRequest();

        } catch (error) {

            console.error(
                "Failed to cancel service request:",
                error
            );

        } finally {

            setCancelling(false);

        }
    };

    if (loading) {

        return (
            <LoadingState
                title="Loading request"
                message="We're retrieving your service request details."
            />
        );
    }

    if (error || !request) {

        return (
            <div className="service-request-details-page">

                <button
                    type="button"
                    className="request-details-back-button"
                    onClick={() =>
                        navigate(
                            "/service-requests"
                        )
                    }
                >
                    <ArrowLeft
                        size={18}
                    />

                    Back to requests
                </button>


                <div className="service-request-details-state">

                    <XCircle
                        size={30}
                    />

                    <h2>
                        Request not found
                    </h2>

                    <p>
                        {error ||
                            "This service request could not be found."}
                    </p>

                    <button
                        type="button"
                        className="request-details-primary-button"
                        onClick={() =>
                            navigate(
                                "/service-requests"
                            )
                        }
                    >
                        View My Requests
                    </button>

                </div>

            </div>
        );
    }

    const asset =
        request.asset || {};

    const provider =
        request.serviceProvider || {};

    const status =
        getStatusConfig(
            request.status
        );

    const serviceType =
        getServiceTypeLabel(
            request.serviceType
        );

    return (
        <div className="service-request-details-page">

            {/* HEADER */}

            <div className="request-details-header">

                <button
                    type="button"
                    className="request-details-back-button"
                    onClick={() =>
                        navigate(
                            "/service-requests"
                        )
                    }
                >
                    <ArrowLeft
                        size={18}
                    />

                    Back to requests
                </button>


                <div className="request-details-title-row">

                    <div className="request-details-title-icon">

                        <Wrench
                            size={24}
                        />

                    </div>


                    <div>

                        <h1>
                            Service Request
                        </h1>

                        <p>
                            Track the progress of
                            your service request.
                        </p>

                    </div>

                </div>

            </div>


            {/* STATUS */}

            <div className="request-details-status-card">

                <div>

                    <span className="request-status-label">
                        Current status
                    </span>

                    <div
                        className={`request-details-status ${status.className}`}
                    >
                        {status.label}
                    </div>

                </div>


                <div className="request-status-icon">

                    {request.status ===
                        "COMPLETED" ? (

                        <CheckCircle2
                            size={28}
                        />

                    ) : request.status ===
                        "REJECTED" ||
                        request.status ===
                        "CANCELLED" ? (

                        <XCircle
                            size={28}
                        />

                    ) : (

                        <Clock
                            size={28}
                        />

                    )}

                </div>

            </div>


            {/* ASSET + PROVIDER */}

            <div className="request-details-grid">

                {/* ASSET */}

                <section className="request-details-card">

                    <div className="request-card-heading">

                        <div className="request-card-icon">

                            <Wrench
                                size={19}
                            />

                        </div>

                        <div>

                            <span>
                                Asset
                            </span>

                            <h2>
                                {asset.name ||
                                    "Selected asset"}
                            </h2>

                        </div>

                    </div>


                    <div className="request-info-list">

                        {asset.category && (

                            <div className="request-info-row">

                                <span>
                                    Category
                                </span>

                                <strong>
                                    {
                                        asset.category
                                    }
                                </strong>

                            </div>

                        )}


                        {asset.brand && (

                            <div className="request-info-row">

                                <span>
                                    Brand
                                </span>

                                <strong>
                                    {
                                        asset.brand
                                    }
                                </strong>

                            </div>

                        )}


                        {asset.model && (

                            <div className="request-info-row">

                                <span>
                                    Model
                                </span>

                                <strong>
                                    {
                                        asset.model
                                    }
                                </strong>

                            </div>

                        )}

                    </div>

                </section>


                {/* PROVIDER */}

                <section className="request-details-card">

                    <div className="request-card-heading">

                        <div className="request-card-icon">

                            <UserRound
                                size={19}
                            />

                        </div>

                        <div>

                            <span>
                                Service Provider
                            </span>

                            <h2>
                                {
                                    provider.businessName ||
                                    provider.name ||
                                    "Service Provider"
                                }
                            </h2>

                        </div>

                    </div>


                    <div className="request-provider-details">

                        {provider.phone && (

                            <div className="request-provider-line">

                                <Phone
                                    size={16}
                                />

                                <span>
                                    {
                                        provider.phone
                                    }
                                </span>

                            </div>

                        )}


                        {provider.location?.city && (

                            <div className="request-provider-line">

                                <MapPin
                                    size={16}
                                />

                                <span>
                                    {
                                        provider.location.city
                                    }
                                    {provider.location.state &&
                                        `, ${provider.location.state}`}
                                </span>

                            </div>

                        )}

                    </div>

                </section>

            </div>


            {/* REQUEST INFORMATION */}

            <section className="request-details-card">

                <div className="request-section-heading">

                    <div>

                        <h2>
                            Request Information
                        </h2>

                        <p>
                            Details provided when
                            the service was requested.
                        </p>

                    </div>

                </div>


                <div className="request-information-grid">

                    <div className="request-information-item">

                        <div className="request-information-icon">

                            <Wrench
                                size={17}
                            />

                        </div>

                        <div>

                            <span>
                                Service type
                            </span>

                            <strong>
                                {
                                    serviceType
                                }
                            </strong>

                        </div>

                    </div>


                    <div className="request-information-item">

                        <div className="request-information-icon">

                            <CalendarDays
                                size={17}
                            />

                        </div>

                        <div>

                            <span>
                                Requested date
                            </span>

                            <strong>
                                {
                                    formatDate(
                                        request.preferredDate
                                    )
                                }
                            </strong>

                        </div>

                    </div>

                    <div className="request-information-item">

                        <div className="request-information-icon">

                            <Clock
                                size={17}
                            />

                        </div>

                        <div>

                            <span>
                                Requested time
                            </span>

                            <strong>
                                {
                                    formatDate(
                                        request.preferredTime
                                    )
                                }
                            </strong>
                        </div>
                    </div>

                </div>

            </section>


            {/* DESCRIPTION */}

            {(request.description || request.notes) && (

                <section className="request-details-card">

                    <div className="request-section-heading">

                        <div>

                            <h2>
                                Problem Description
                            </h2>

                        </div>

                    </div>


                    <div className="request-description-box">

                        <FileText
                            size={18}
                        />

                        <p>
                            {
                                request.description ||
                                request.notes
                            }
                        </p>

                    </div>

                </section>

            )}

            {/* APPOINTMENT */}
            {request.status === "SCHEDULED" && request.scheduling && (

                <section className="request-appointment-card">

                    <div className="request-appointment-header">

                        <div>

                            <span className="request-appointment-eyebrow">
                                Appointment
                            </span>

                            <h2>
                                Confirmed Appointment
                            </h2>

                            <p>
                                Your service provider has scheduled
                                an appointment for this request.
                            </p>

                        </div>

                        <div className="request-appointment-icon">

                            <CalendarDays
                                size={22}
                            />

                        </div>

                    </div>


                    <div className="request-appointment-grid">

                        <div className="request-appointment-item">

                            <CalendarDays
                                size={17}
                            />

                            <div>

                                <span>
                                    Scheduled date
                                </span>

                                <strong>
                                    {formatDate(
                                        request.scheduling.scheduledDate
                                    )}
                                </strong>

                            </div>

                        </div>


                        <div className="request-appointment-item">

                            <Clock
                                size={17}
                            />

                            <div>

                                <span>
                                    Scheduled time
                                </span>

                                <strong>
                                    {
                                        request.scheduling
                                            .scheduledTime ||
                                        "Not specified"
                                    }
                                </strong>

                            </div>

                        </div>


                        {request.scheduling.durationMinutes && (

                            <div className="request-appointment-item">

                                <Clock
                                    size={17}
                                />

                                <div>

                                    <span>
                                        Duration
                                    </span>

                                    <strong>
                                        {
                                            request.scheduling
                                                .durationMinutes
                                        }{" "}
                                        minutes
                                    </strong>

                                </div>

                            </div>

                        )}

                    </div>


                    <div className="request-appointment-actions">

                        <button
                            type="button"
                            className="request-cancel-button"
                            disabled={cancelling}
                            onClick={
                                handleCancelRequest
                            }
                        >

                            {cancelling ? (
                                <>
                                    <RefreshCw
                                        size={16}
                                        className="request-loading-icon"
                                    />

                                    Cancelling...
                                </>
                            ) : (
                                <>
                                    <XCircle
                                        size={16}
                                    />

                                    Cancel Appointment
                                </>
                            )}

                        </button>

                    </div>

                </section>

            )}

            {/* PENDING CANCELLATION */}
            {request.status === "PENDING" && (

                <section className="request-cancellation-card">

                    <div>

                        <h3>
                            Need to change your mind?
                        </h3>

                        <p>
                            You can cancel this request while
                            it is still waiting for the provider.
                        </p>

                    </div>


                    <button
                        type="button"
                        className="request-cancel-button"
                        disabled={cancelling}
                        onClick={
                            handleCancelRequest
                        }
                    >

                        {cancelling ? (
                            <>
                                <RefreshCw
                                    size={16}
                                    className="request-loading-icon"
                                />

                                Cancelling...
                            </>
                        ) : (
                            <>
                                <XCircle
                                    size={16}
                                />

                                Cancel Request
                            </>
                        )}

                    </button>

                </section>

            )}

            {/* CANCELLED APPOINTMENT */}
            {request.status === "CANCELLED" && (

                <section className="request-cancelled-appointment-card">

                    <div className="request-cancelled-appointment-icon">

                        <XCircle
                            size={22}
                        />

                    </div>


                    <div>

                        <span className="request-cancelled-appointment-eyebrow">
                            Appointment status
                        </span>

                        <h2>
                            Appointment Cancelled
                        </h2>

                        <p>
                            This service appointment has been cancelled.
                            No further action is required.
                        </p>

                    </div>

                </section>

            )}

            {/* COMPLETION DETAILS */}
            {request.status === "COMPLETED" && request.completion && (

                <section className="request-details-card">

                    <div className="request-section-heading">

                        <div>

                            <h2>
                                Service Completed
                            </h2>

                            <p>
                                Final details provided by
                                the service provider.
                            </p>

                        </div>

                        <div className="request-completion-icon">

                            <CheckCircle2
                                size={22}
                            />

                        </div>

                    </div>


                    <div className="request-completion-grid">

                        {/* COMPLETED DATE */}

                        <div className="request-completion-item">

                            <div className="request-information-icon">

                                <CalendarDays
                                    size={17}
                                />

                            </div>

                            <div>

                                <span>
                                    Completed on
                                </span>

                                <strong>
                                    {
                                        formatDate(
                                            request
                                                .completion
                                                .completedAt
                                        )
                                    }
                                </strong>

                            </div>

                        </div>


                        {/* SERVICE COST */}

                        <div className="request-completion-item">

                            <div className="request-information-icon">

                                <span className="request-currency-icon">
                                    ₹
                                </span>

                            </div>

                            <div>

                                <span>
                                    Service cost
                                </span>

                                <strong>
                                    ₹
                                    {Number(
                                        request
                                            .completion
                                            .serviceCost ||
                                        0
                                    ).toLocaleString(
                                        "en-IN"
                                    )}
                                </strong>

                            </div>

                        </div>


                        {/* PARTS USED */}

                        {request
                            .completion
                            .partsUsed && (

                                <div className="request-completion-item">

                                    <div className="request-information-icon">

                                        <Wrench
                                            size={17}
                                        />

                                    </div>

                                    <div>

                                        <span>
                                            Parts used
                                        </span>

                                        <strong>
                                            {
                                                request
                                                    .completion
                                                    .partsUsed
                                            }
                                        </strong>

                                    </div>

                                </div>

                            )}

                    </div>


                    {/* PROVIDER NOTES */}

                    {request
                        .completion
                        .notes && (

                            <div className="request-completion-notes">

                                <div className="request-completion-notes-header">

                                    <FileText
                                        size={17}
                                    />

                                    <span>
                                        Provider notes
                                    </span>

                                </div>


                                <p>
                                    {
                                        request
                                            .completion
                                            .notes
                                    }
                                </p>

                            </div>

                        )}

                </section>

            )}

            {request.status === "COMPLETED" &&
                payment && (
                    <ServiceRequestPaymentCard
                        payment={payment}
                        onPay={() => {
                            // Real payment gateway
                            // will be connected here.
                        }}
                    />
                )}

            {/* TIMELINE */}
            {request.status !== 'CANCELLED' && (
                <section className="request-details-card">

                    <div className="request-section-heading">

                        <div>

                            <h2>
                                Request Timeline
                            </h2>

                            <p>
                                Track the progress of
                                your service request.
                            </p>

                        </div>

                    </div>


                    {/* CANCELLED */}

                    {request.status === "CANCELLED" && (

                        <div className="request-terminal-message cancelled">

                            <XCircle
                                size={20}
                            />

                            <div>

                                <strong>
                                    Request cancelled
                                </strong>

                                <span>
                                    This service request was cancelled.
                                </span>

                            </div>

                        </div>

                    )}


                    {/* REJECTED */}

                    {request.status === "REJECTED" && (

                        <div className="request-terminal-message rejected">

                            <XCircle
                                size={20}
                            />

                            <div>

                                <strong>
                                    Request declined
                                </strong>

                                <span>
                                    The service provider was unable
                                    to accept this request.
                                </span>

                            </div>

                        </div>

                    )}


                    {/* NORMAL SERVICE TIMELINE */}

                    {![
                        "CANCELLED",
                        "REJECTED",
                    ].includes(request.status) && (

                            <div className="request-timeline">


                                {/* REQUEST SUBMITTED */}

                                <div className="timeline-item active">

                                    <div className="timeline-marker">

                                        <CheckCircle2
                                            size={17}
                                        />

                                    </div>

                                    <div>

                                        <strong>
                                            Request submitted
                                        </strong>

                                        <span>
                                            Your service request
                                            has been submitted.
                                        </span>

                                    </div>

                                </div>


                                {/* PROVIDER RESPONSE */}

                                <div
                                    className={`timeline-item ${[
                                        "ACCEPTED",
                                        "SCHEDULED",
                                        "IN_PROGRESS",
                                        "COMPLETED",
                                    ].includes(request.status)
                                        ? "active"
                                        : ""
                                        }`}
                                >

                                    <div className="timeline-marker">

                                        {request.status === "REJECTED" ? (

                                            <XCircle
                                                size={17}
                                            />

                                        ) : (

                                            <CheckCircle2
                                                size={17}
                                            />

                                        )}

                                    </div>


                                    <div>

                                        <strong>
                                            Provider response
                                        </strong>


                                        <span>

                                            {request.status === "PENDING" && (
                                                "Waiting for the provider to respond."
                                            )}


                                            {[
                                                "ACCEPTED",
                                                "SCHEDULED",
                                                "IN_PROGRESS",
                                                "COMPLETED",
                                            ].includes(request.status) && (
                                                    "The provider has accepted your request."
                                                )}


                                            {request.status === "REJECTED" && (
                                                "The provider was unable to accept your request."
                                            )}

                                        </span>

                                    </div>

                                </div>


                                {/* SERVICE SCHEDULED */}

                                <div
                                    className={`timeline-item ${[
                                        "SCHEDULED",
                                        "IN_PROGRESS",
                                        "COMPLETED",
                                    ].includes(
                                        request.status
                                    )
                                        ? "active"
                                        : ""
                                        }`}
                                >

                                    <div className="timeline-marker">

                                        <CalendarDays
                                            size={17}
                                        />

                                    </div>

                                    <div>

                                        <strong>
                                            Service scheduled
                                        </strong>

                                        <span>
                                            {[
                                                "SCHEDULED",
                                                "IN_PROGRESS",
                                                "COMPLETED",
                                            ].includes(
                                                request.status
                                            )
                                                ? "Your service appointment has been scheduled."
                                                : "The service appointment will appear here."
                                            }
                                        </span>

                                    </div>

                                </div>


                                {/* SERVICE IN PROGRESS */}

                                <div
                                    className={`timeline-item ${[
                                        "IN_PROGRESS",
                                        "COMPLETED",
                                    ].includes(
                                        request.status
                                    )
                                        ? "active"
                                        : ""
                                        }`}
                                >

                                    <div className="timeline-marker">

                                        <Wrench
                                            size={17}
                                        />

                                    </div>

                                    <div>

                                        <strong>
                                            Service in progress
                                        </strong>

                                        <span>
                                            {[
                                                "IN_PROGRESS",
                                                "COMPLETED",
                                            ].includes(
                                                request.status
                                            )
                                                ? "The technician is working on your asset."
                                                : "The technician will start working on your asset here."
                                            }
                                        </span>

                                    </div>

                                </div>


                                {/* SERVICE COMPLETED */}

                                <div
                                    className={`timeline-item ${request.status ===
                                        "COMPLETED"
                                        ? "active"
                                        : ""
                                        }`}
                                >

                                    <div className="timeline-marker">

                                        <CheckCircle2
                                            size={17}
                                        />

                                    </div>

                                    <div>

                                        <strong>
                                            Service completed
                                        </strong>

                                        <span>
                                            {request.status === "COMPLETED"
                                                ? request.completion?.completedAt
                                                    ? `Service completed on ${formatDate(
                                                        request.completion.completedAt
                                                    )}.`
                                                    : "The service has been completed successfully."
                                                : "The completion of your service will appear here."
                                            }
                                        </span>

                                    </div>

                                </div>


                            </div>

                        )}

                </section>
            )}

        </div>
    );
};


export default ServiceRequestDetails;
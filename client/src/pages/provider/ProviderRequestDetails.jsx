import {
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    Clock,
    FileText,
    MapPin,
    RefreshCw,
    UserRound,
    Wrench,
    XCircle,
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


import "../../styles/provider/providerRequestDetails.css";
import { acceptProviderRequest, getProviderRequestById, rejectProviderRequest, scheduleServiceRequest } from "../../services/serviceRequestService";
import { completeProviderService, startProviderService } from "../../services/serviceProviderService";

const STATUS_CONFIG = {

    PENDING: {
        label: "Pending",
        className:
            "provider-details-status-pending",
    },

    ACCEPTED: {
        label: "Accepted",
        className:
            "provider-details-status-accepted",
    },

    REJECTED: {
        label: "Rejected",
        className:
            "provider-details-status-rejected",
    },

    SCHEDULED: {
        label: "Scheduled",
        className:
            "provider-details-status-scheduled",
    },

    IN_PROGRESS: {
        label: "In Progress",
        className:
            "provider-details-status-progress",
    },

    COMPLETED: {
        label: "Completed",
        className:
            "provider-details-status-completed",
    },

    CANCELLED: {
        label: "Cancelled",
        className:
            "provider-details-status-cancelled",
    },

};


const getStatusConfig = (
    status
) => {

    return (
        STATUS_CONFIG[status] || {
            label:
                status ||
                "Unknown",

            className:
                "provider-details-status-pending",
        }
    );
};


const getServiceTypeLabel = (
    serviceType
) => {

    const labels = {
        REPAIR: "Repair",
        SERVICE: "Service",
        INSPECTION: "Inspection",
    };

    return (
        labels[serviceType] ||
        serviceType ||
        "Service"
    );
};


const formatDate = (
    value
) => {

    if (!value) {
        return "Not specified";
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


const formatShortDate = (
    value
) => {

    if (!value) {
        return "";
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "";
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


const ProviderRequestDetails = () => {

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
        processing,
        setProcessing,
    ] = useState(false);


    const [
        scheduling,
        setScheduling,
    ] = useState(false);


    const [
        actionError,
        setActionError,
    ] = useState("");


    const [
        form,
        setForm,
    ] = useState({
        scheduledDate: "",
        scheduledTime: "",
        durationMinutes: 60,
        notes: "",
    });

    const [
        completionForm,
        setCompletionForm,
    ] = useState({
        completionNotes: "",
        serviceCost: "",
        partsUsed: "",
    });

    const [
        completing,
        setCompleting,
    ] = useState(false);

    const loadRequest =
        useCallback(
            async () => {

                try {

                    setLoading(true);
                    setError("");

                    const response =
                        await getProviderRequestById(
                            requestId
                        );

                    const data =
                        response?.data;

                    const requestData =
                        data?.request ||
                        data;

                    setRequest(
                        requestData
                    );


                    /*
                     * Populate scheduling form
                     * if scheduling data already exists.
                     */
                    if (
                        requestData?.scheduling
                    ) {

                        setForm({
                            scheduledDate:
                                requestData
                                    .scheduling
                                    .scheduledDate
                                    ? new Date(
                                        requestData
                                            .scheduling
                                            .scheduledDate
                                    )
                                        .toISOString()
                                        .split("T")[0]
                                    : "",

                            scheduledTime:
                                requestData
                                    .scheduling
                                    .scheduledTime ||
                                "",

                            durationMinutes:
                                requestData
                                    .scheduling
                                    .durationMinutes ||
                                60,

                            notes:
                                requestData
                                    .scheduling
                                    .notes ||
                                "",
                        });

                    }

                } catch (
                requestError
                ) {

                    console.error(
                        "Failed to load provider request:",
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


    useEffect(() => {

        loadRequest();

    }, [loadRequest]);


    const handleAccept =
        async () => {

            try {

                setProcessing(true);
                setActionError("");

                await acceptProviderRequest(
                    requestId
                );

                await loadRequest();

            } catch (
            requestError
            ) {

                setActionError(
                    requestError
                        ?.response
                        ?.data
                        ?.message ||
                    "Unable to accept this request."
                );

            } finally {

                setProcessing(false);

            }
        };


    const handleReject =
        async () => {

            try {

                setProcessing(true);
                setActionError("");

                await rejectProviderRequest(
                    requestId
                );

                await loadRequest();

            } catch (
            requestError
            ) {

                setActionError(
                    requestError
                        ?.response
                        ?.data
                        ?.message ||
                    "Unable to reject this request."
                );

            } finally {

                setProcessing(false);

            }
        };


    const handleFormChange =
        (event) => {

            const {
                name,
                value,
            } = event.target;

            setForm(
                (current) => ({
                    ...current,
                    [name]: value,
                })
            );
        };


    const handleSchedule = async (event) => {

            event.preventDefault();

            try {

                setScheduling(true);
                setActionError("");

                await scheduleServiceRequest(
                    requestId,
                    {
                        scheduledDate:
                            form.scheduledDate,

                        scheduledTime:
                            form.scheduledTime,

                        durationMinutes:
                            Number(
                                form.durationMinutes
                            ),

                        notes:
                            form.notes,
                    }
                );

                await loadRequest();

            } catch (
            requestError
            ) {

                setActionError(
                    requestError
                        ?.response
                        ?.data
                        ?.message ||
                    "Unable to schedule this service."
                );

            } finally {

                setScheduling(false);

            }
        };


    const handleStartService =
        async () => {

            try {

                setProcessing(true);
                setActionError("");

                await startProviderService(
                    requestId
                );

                await loadRequest();

            } catch (requestError) {
                setActionError(
                    requestError
                        ?.response
                        ?.data
                        ?.message ||
                    "Unable to start this service."
                );

            } finally {

                setProcessing(false);

            }
        };

    const handleCompletionFormChange =
        (event) => {

            const {
                name,
                value,
            } = event.target;

            setCompletionForm(
                (current) => ({
                    ...current,
                    [name]: value,
                })
            );
        };

    const handleCompleteService =
        async (
            event
        ) => {

            event.preventDefault();

            try {

                setCompleting(true);
                setActionError("");

                await completeProviderService(
                    requestId,
                    {
                        completionNotes:
                            completionForm
                                .completionNotes
                                .trim(),

                        serviceCost:
                            completionForm
                                .serviceCost === ""
                                ? 0
                                : Number(
                                    completionForm
                                        .serviceCost
                                ),

                        partsUsed:
                            completionForm
                                .partsUsed
                                .trim(),
                    }
                );

                await loadRequest();

            } catch (
            requestError
            ) {

                setActionError(
                    requestError
                        ?.response
                        ?.data
                        ?.message ||
                    "Unable to complete this service."
                );

            } finally {

                setCompleting(false);

            }
        };

    if (loading) {

        return (

            <div className="provider-request-details-page">

                <div className="provider-details-state">

                    <RefreshCw
                        size={28}
                        className="provider-details-spin"
                    />

                    <h2>
                        Loading request
                    </h2>

                    <p>
                        We're retrieving the
                        service request details.
                    </p>

                </div>

            </div>
        );
    }


    if (
        error ||
        !request
    ) {

        return (

            <div className="provider-request-details-page">

                <button
                    type="button"
                    className="provider-details-back-button"
                    onClick={() =>
                        navigate(
                            "/provider/requests"
                        )
                    }
                >
                    <ArrowLeft
                        size={18}
                    />

                    Back to requests
                </button>


                <div className="provider-details-state">

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
                        className="provider-details-primary-button"
                        onClick={() =>
                            navigate(
                                "/provider/requests"
                            )
                        }
                    >
                        View Requests
                    </button>

                </div>

            </div>
        );
    }


    const asset =
        request.asset || {};


    const customer =
        request.user || {};


    const status =
        getStatusConfig(
            request.status
        );


    const serviceType =
        getServiceTypeLabel(
            request.serviceType
        );


    const isPending =
        request.status === "PENDING";

    const isAccepted =
        request.status === "ACCEPTED";

    const isScheduled =
        request.status === "SCHEDULED";

    const isInProgress =
        request.status === "IN_PROGRESS";

    const isCompleted =
        request.status === "COMPLETED";


    const isTerminal =
        [
            "REJECTED",
            "CANCELLED",
            "COMPLETED",
        ].includes(
            request.status
        );


    return (

        <div className="provider-request-details-page">

            {/* HEADER */}

            <div className="provider-details-header">

                <button
                    type="button"
                    className="provider-details-back-button"
                    onClick={() =>
                        navigate(
                            "/provider/requests"
                        )
                    }
                >
                    <ArrowLeft
                        size={18}
                    />

                    Back to requests
                </button>


                <div className="provider-details-title-row">

                    <div className="provider-details-title-icon">

                        <Wrench
                            size={24}
                        />

                    </div>


                    <div>

                        <h1>
                            Service Request
                        </h1>

                        <p>
                            Review the customer
                            request and manage the
                            service.
                        </p>

                    </div>

                </div>

            </div>


            {/* STATUS */}

            <section className="provider-details-status-card">

                <div>

                    <span>
                        Current status
                    </span>

                    <div
                        className={`provider-details-status ${status.className}`}
                    >
                        {status.label}
                    </div>

                </div>


                <div className="provider-details-status-icon">

                    {[
                        "COMPLETED",
                        "REJECTED",
                        "CANCELLED",
                    ].includes(
                        request.status
                    ) ? (

                        <XCircle
                            size={28}
                        />

                    ) : (

                        <Clock
                            size={28}
                        />

                    )}

                </div>

            </section>


            {/* CUSTOMER + ASSET */}

            <div className="provider-details-grid">

                {/* CUSTOMER */}

                <section className="provider-details-card">

                    <div className="provider-card-heading">

                        <div className="provider-card-icon">

                            <UserRound
                                size={19}
                            />

                        </div>

                        <div>

                            <span>
                                Customer
                            </span>

                            <h2>
                                {
                                    customer.name ||
                                    "Customer"
                                }
                            </h2>

                        </div>

                    </div>


                    <div className="provider-info-list">

                        {customer.email && (

                            <div className="provider-info-row">

                                <span>
                                    Email
                                </span>

                                <strong>
                                    {
                                        customer.email
                                    }
                                </strong>

                            </div>

                        )}

                    </div>

                </section>


                {/* ASSET */}

                <section className="provider-details-card">

                    <div className="provider-card-heading">

                        <div className="provider-card-icon">

                            <Wrench
                                size={19}
                            />

                        </div>

                        <div>

                            <span>
                                Asset
                            </span>

                            <h2>
                                {
                                    asset.name ||
                                    "Asset"
                                }
                            </h2>

                        </div>

                    </div>


                    <div className="provider-info-list">

                        {asset.category && (

                            <div className="provider-info-row">

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

                            <div className="provider-info-row">

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

                            <div className="provider-info-row">

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

            </div>


            {/* REQUEST INFORMATION */}

            <section className="provider-details-card">

                <div className="provider-section-heading">

                    <div>

                        <h2>
                            Request Information
                        </h2>

                        <p>
                            Details provided by the
                            customer when requesting
                            the service.
                        </p>

                    </div>

                </div>


                <div className="provider-information-grid">

                    <div className="provider-information-item">

                        <div className="provider-information-icon">

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


                    <div className="provider-information-item">

                        <div className="provider-information-icon">

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
                                        request.date ||
                                        request.createdAt
                                    )
                                }
                            </strong>

                        </div>

                    </div>


                    {request.time && (

                        <div className="provider-information-item">

                            <div className="provider-information-icon">

                                <Clock
                                    size={17}
                                />

                            </div>

                            <div>

                                <span>
                                    Preferred time
                                </span>

                                <strong>
                                    {
                                        request.time
                                    }
                                </strong>

                            </div>

                        </div>

                    )}

                </div>

            </section>


            {/* LOCATION */}

            {request.location && (

                <section className="provider-details-card">

                    <div className="provider-section-heading">

                        <div>

                            <h2>
                                Service Location
                            </h2>

                            <p>
                                Customer's requested
                                service location.
                            </p>

                        </div>

                    </div>


                    <div className="provider-location-box">

                        <div className="provider-location-icon">

                            <MapPin
                                size={20}
                            />

                        </div>


                        <div>

                            <strong>
                                {
                                    request.location.address ||
                                    request.location.city ||
                                    "Customer location"
                                }
                            </strong>


                            <span>

                                {request.location.city}

                                {request.location.state &&
                                    `, ${request.location.state}`}

                                {request.location.pincode &&
                                    ` - ${request.location.pincode}`}

                            </span>

                        </div>

                    </div>

                </section>

            )}


            {/* DESCRIPTION */}

            {(request.description ||
                request.notes) && (

                    <section className="provider-details-card">

                        <div className="provider-section-heading">

                            <div>

                                <h2>
                                    Customer Message
                                </h2>

                            </div>

                        </div>


                        <div className="provider-description-box">

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


            {/* ACTION ERROR */}

            {actionError && (

                <div className="provider-details-action-error">

                    <XCircle
                        size={18}
                    />

                    <span>
                        {actionError}
                    </span>

                </div>

            )}


            {/* PENDING ACTIONS */}

            {isPending && (

                <section className="provider-details-action-card">

                    <div>

                        <h3>
                            Respond to this request
                        </h3>

                        <p>
                            Accept the request to arrange
                            a service appointment, or
                            reject it if you are unable
                            to provide the service.
                        </p>

                    </div>


                    <div className="provider-details-actions">

                        <button
                            type="button"
                            className="provider-details-reject-button"
                            disabled={processing}
                            onClick={
                                handleReject
                            }
                        >

                            <XCircle
                                size={16}
                            />

                            {processing
                                ? "Processing..."
                                : "Reject"}

                        </button>


                        <button
                            type="button"
                            className="provider-details-accept-button"
                            disabled={processing}
                            onClick={
                                handleAccept
                            }
                        >

                            <CheckCircle2
                                size={16}
                            />

                            {processing
                                ? "Processing..."
                                : "Accept Request"}

                        </button>

                    </div>

                </section>

            )}


            {/* SCHEDULE */}

            {isAccepted && (

                <section className="provider-details-card provider-schedule-card">

                    <div className="provider-section-heading">

                        <div>

                            <h2>
                                Schedule Service
                            </h2>

                            <p>
                                Choose when the technician
                                will visit the customer.
                            </p>

                        </div>

                    </div>


                    <form
                        className="provider-schedule-form"
                        onSubmit={
                            handleSchedule
                        }
                    >

                        <div className="provider-schedule-grid">

                            <div className="provider-form-group">

                                <label htmlFor="scheduledDate">
                                    Service date
                                </label>

                                <input
                                    id="scheduledDate"
                                    name="scheduledDate"
                                    type="date"
                                    value={
                                        form.scheduledDate
                                    }
                                    onChange={
                                        handleFormChange
                                    }
                                    required
                                />

                            </div>


                            <div className="provider-form-group">

                                <label htmlFor="scheduledTime">
                                    Service time
                                </label>

                                <input
                                    id="scheduledTime"
                                    name="scheduledTime"
                                    type="time"
                                    value={
                                        form.scheduledTime
                                    }
                                    onChange={
                                        handleFormChange
                                    }
                                    required
                                />

                            </div>


                            <div className="provider-form-group">

                                <label htmlFor="durationMinutes">
                                    Duration
                                </label>

                                <div className="provider-input-with-suffix">

                                    <input
                                        id="durationMinutes"
                                        name="durationMinutes"
                                        type="number"
                                        min="1"
                                        value={
                                            form.durationMinutes
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                        required
                                    />

                                    <span>
                                        minutes
                                    </span>

                                </div>

                            </div>

                        </div>


                        <div className="provider-form-group">

                            <label htmlFor="notes">
                                Appointment notes
                            </label>

                            <textarea
                                id="notes"
                                name="notes"
                                rows="4"
                                value={
                                    form.notes
                                }
                                onChange={
                                    handleFormChange
                                }
                                placeholder="Add any instructions or notes for the customer..."
                            />

                        </div>


                        <div className="provider-schedule-actions">

                            <button
                                type="submit"
                                className="provider-details-schedule-button"
                                disabled={
                                    scheduling
                                }
                            >

                                {scheduling ? (

                                    <>
                                        <RefreshCw
                                            size={16}
                                            className="provider-details-spin"
                                        />

                                        Scheduling...

                                    </>

                                ) : (

                                    <>
                                        <CalendarDays
                                            size={16}
                                        />

                                        Schedule Service
                                    </>

                                )}

                            </button>

                        </div>

                    </form>

                </section>

            )}


            {/* APPOINTMENT */}

            {isScheduled && (

                <section className="request-details-card request-appointment-card">

                    <div className="request-section-heading">

                        <div>

                            <h2>
                                Service Appointment
                            </h2>

                            <p>
                                Your service appointment
                                details.
                            </p>

                        </div>


                        <div className="request-appointment-icon">

                            <CheckCircle2
                                size={22}
                            />

                        </div>

                    </div>


                    <div className="request-appointment-grid">

                        <div className="request-appointment-item">

                            <div className="request-information-icon">

                                <CalendarDays
                                    size={17}
                                />

                            </div>

                            <div>

                                <span>
                                    Service date
                                </span>

                                <strong>
                                    {
                                        formatDate(
                                            request.scheduling.scheduledDate
                                        )
                                    }
                                </strong>

                            </div>

                        </div>


                        <div className="request-appointment-item">

                            <div className="request-information-icon">

                                <Clock
                                    size={17}
                                />

                            </div>

                            <div>

                                <span>
                                    Service time
                                </span>

                                <strong>
                                    {
                                        request.scheduling.scheduledTime ||
                                        "Not specified"
                                    }
                                </strong>

                            </div>

                        </div>


                        <div className="request-appointment-item">

                            <div className="request-information-icon">

                                <Clock
                                    size={17}
                                />

                            </div>

                            <div>

                                <span>
                                    Duration
                                </span>

                                <strong>
                                    {
                                        request.scheduling.durationMinutes ||
                                        0
                                    }{" "}
                                    minutes
                                </strong>

                            </div>

                        </div>

                    </div>


                    {scheduling.notes && (

                        <div className="request-appointment-notes">

                            <span>
                                Appointment notes
                            </span>

                            <p>
                                {
                                    scheduling.notes
                                }
                            </p>

                        </div>

                    )}

                </section>

            )}

            {/* START SERVICE */}

            {isScheduled && (

                <section className="provider-details-action-card">

                    <div>

                        <h3>
                            Ready to start the service?
                        </h3>

                        <p>
                            Confirm that the technician has
                            arrived and service work is ready
                            to begin.
                        </p>

                    </div>


                    <div className="provider-details-actions">

                        <button
                            type="button"
                            className="provider-details-start-button"
                            disabled={processing}
                            onClick={
                                handleStartService
                            }
                        >

                            {processing ? (

                                <>
                                    <RefreshCw
                                        size={16}
                                        className="provider-details-spin"
                                    />

                                    Starting...

                                </>

                            ) : (

                                <>
                                    <Wrench
                                        size={16}
                                    />

                                    Start Service
                                </>

                            )}

                        </button>

                    </div>

                </section>

            )}

            {/* COMPLETE SERVICE */}

            {isInProgress && (

                <section className="provider-details-card provider-completion-card">

                    <div className="provider-section-heading">

                        <div>

                            <h2>
                                Complete Service
                            </h2>

                            <p>
                                Record the final service details
                                before completing this request.
                            </p>

                        </div>

                    </div>


                    <form
                        className="provider-completion-form"
                        onSubmit={
                            handleCompleteService
                        }
                    >

                        <div className="provider-completion-grid">

                            {/* SERVICE COST */}

                            <div className="provider-form-group">

                                <label htmlFor="serviceCost">
                                    Final service cost
                                </label>

                                <div className="provider-input-with-prefix">

                                    <span>
                                        ₹
                                    </span>

                                    <input
                                        id="serviceCost"
                                        name="serviceCost"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={
                                            completionForm
                                                .serviceCost
                                        }
                                        onChange={
                                            handleCompletionFormChange
                                        }
                                        placeholder="0"
                                    />

                                </div>

                            </div>


                            {/* PARTS */}

                            <div className="provider-form-group">

                                <label htmlFor="partsUsed">
                                    Parts / materials used
                                </label>

                                <input
                                    id="partsUsed"
                                    name="partsUsed"
                                    type="text"
                                    value={
                                        completionForm
                                            .partsUsed
                                    }
                                    onChange={
                                        handleCompletionFormChange
                                    }
                                    placeholder="Example: Filter, screws"
                                />

                            </div>

                        </div>


                        {/* COMPLETION NOTES */}

                        <div className="provider-form-group">

                            <label htmlFor="completionNotes">
                                Completion notes
                            </label>

                            <textarea
                                id="completionNotes"
                                name="completionNotes"
                                rows="4"
                                value={
                                    completionForm
                                        .completionNotes
                                }
                                onChange={
                                    handleCompletionFormChange
                                }
                                placeholder="Describe the work completed, findings, or recommendations..."
                            />

                        </div>


                        <div className="provider-schedule-actions">

                            <button
                                type="submit"
                                className="provider-details-complete-button"
                                disabled={
                                    completing
                                }
                            >

                                {completing ? (

                                    <>
                                        <RefreshCw
                                            size={16}
                                            className="provider-details-spin"
                                        />

                                        Completing...

                                    </>

                                ) : (

                                    <>
                                        <CheckCircle2
                                            size={16}
                                        />

                                        Complete Service

                                    </>

                                )}

                            </button>

                        </div>

                    </form>

                </section>

            )}
            {/* TERMINAL MESSAGE */}

            {isTerminal && (

                <section className="provider-details-terminal-card">

                    {request.status === "COMPLETED" ? (

                        <CheckCircle2
                            size={20}
                        />

                    ) : (

                        <XCircle
                            size={20}
                        />

                    )}


                    <div>

                        <strong>
                            {request.status === "REJECTED"
                                ? "Request rejected"
                                : request.status === "CANCELLED"
                                    ? "Request cancelled"
                                    : "Service completed"}
                        </strong>


                        <span>
                            {request.status === "REJECTED"
                                ? "This request was declined and no appointment can be scheduled."
                                : request.status === "CANCELLED"
                                    ? "This service request was cancelled by the customer."
                                    : "This service request has been completed successfully."}
                        </span>

                    </div>

                </section>

            )}

        </div>
    );
};


export default ProviderRequestDetails;
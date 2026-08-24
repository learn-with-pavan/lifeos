import {
    BellRing,
    CalendarDays,
    Clock,
    MapPin,
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
    acceptProviderRequest,
    getProviderIncomingRequests,
} from "../../services/serviceRequestService";

import "../../styles/provider/providerRequests.css";

const SERVICE_TYPE_LABELS = {

    REPAIR:
        "Repair",

    SERVICE:
        "Service",

    INSPECTION:
        "Inspection",

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
            month: "short",
            year: "numeric",
        }
    );
};


const ProviderRequests = () => {

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


    const [
        actionLoading,
        setActionLoading,
    ] = useState(null);

    const navigate = useNavigate();

    const loadRequests =
        useCallback(
            async () => {

                try {

                    setLoading(true);

                    setError("");


                    const response =
                        await getProviderIncomingRequests();


                    setRequests(
                        Array.isArray(
                            response?.data?.requests
                        )
                            ? response.data.requests
                            : []
                    );

                } catch (requestError) {

                    console.error(
                        "Failed to load provider requests:",
                        requestError
                    );


                    setError(
                        requestError
                            ?.response
                            ?.data
                            ?.message ||
                        "Unable to load incoming requests."
                    );

                } finally {

                    setLoading(false);

                }

            },
            []
        );


    useEffect(() => {

        loadRequests();

    }, [loadRequests]);

    const handleViewRequest = (
        requestId
    ) => {

        navigate(
            `/provider/requests/${requestId}`
        );

    };

    const handleAcceptRequest = async (
        requestId
    ) => {

        try {

            setActionLoading(requestId);

            await acceptProviderRequest(requestId);

            await loadRequests();

        } catch (requestError) {

            console.error(
                "Failed to accept provider request:",
                requestError
            );

            setError(
                requestError
                    ?.response
                    ?.data
                    ?.message ||
                "Unable to accept service request."
            );

        } finally {

            setActionLoading(null);

        }
    };

    const handleRejectRequest = async (
        requestId
    ) => {

        try {

            setActionLoading(requestId);

            await rejectProviderRequest(requestId);

            await loadRequests();

        } catch (requestError) {

            console.error(
                "Failed to reject provider request:",
                requestError
            );

            setError(
                requestError
                    ?.response
                    ?.data
                    ?.message ||
                "Unable to reject service request."
            );

        } finally {

            setActionLoading(null);

        }
    };

    return (

        <div className="provider-requests-page">

            {/* HEADER */}

            <div className="provider-requests-header">

                <div className="provider-requests-title">

                    <div className="provider-requests-title-icon">

                        <BellRing
                            size={24}
                        />

                    </div>


                    <div>

                        <h1>
                            Service Requests
                        </h1>

                        <p>
                            Manage incoming service
                            requests from customers.
                        </p>

                    </div>

                </div>


                <button
                    type="button"
                    className="provider-refresh-button"
                    onClick={loadRequests}
                    disabled={loading}
                >

                    <RefreshCw
                        size={16}
                        className={
                            loading
                                ? "provider-refresh-spinning"
                                : ""
                        }
                    />

                    Refresh

                </button>

            </div>


            {/* LOADING */}

            {loading && (

                <div className="provider-request-state">

                    <RefreshCw
                        size={28}
                        className="provider-refresh-spinning"
                    />

                    <h2>
                        Loading requests
                    </h2>

                    <p>
                        We're checking for new
                        service requests.
                    </p>

                </div>

            )}


            {/* ERROR */}

            {!loading && error && (

                <div className="provider-request-state">

                    <Wrench
                        size={30}
                    />

                    <h2>
                        Unable to load requests
                    </h2>

                    <p>
                        {error}
                    </p>

                    <button
                        type="button"
                        className="provider-primary-button"
                        onClick={loadRequests}
                    >
                        Try Again
                    </button>

                </div>

            )}


            {/* EMPTY */}

            {!loading &&
                !error &&
                requests.length === 0 && (

                    <div className="provider-request-state">

                        <BellRing
                            size={32}
                        />

                        <h2>
                            No incoming requests
                        </h2>

                        <p>
                            New customer service
                            requests assigned to you
                            will appear here.
                        </p>

                    </div>

                )}


            {/* REQUESTS */}

            {!loading &&
                !error &&
                requests.length > 0 && (

                    <div className="provider-request-list">

                        {requests.map(
                            (request) => {

                                const asset =
                                    request.asset ||
                                    {};

                                const customer =
                                    request.user ||
                                    {};


                                return (

                                    <div
                                        className="provider-request-card"
                                        key={
                                            request._id
                                        }
                                    >

                                        {/* CARD HEADER */}

                                        <div className="provider-request-card-header">

                                            <div className="provider-request-customer">

                                                <div className="provider-customer-avatar">

                                                    <UserRound
                                                        size={19}
                                                    />

                                                </div>


                                                <div>

                                                    <span>
                                                        Customer
                                                    </span>

                                                    <strong>
                                                        {
                                                            customer.name ||
                                                            customer.email ||
                                                            "Customer"
                                                        }
                                                    </strong>

                                                </div>

                                            </div>


                                            <span className="provider-pending-badge">

                                                Pending

                                            </span>

                                        </div>


                                        {/* ASSET */}

                                        <div className="provider-request-asset">

                                            <div className="provider-request-asset-icon">

                                                <Wrench
                                                    size={20}
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

                                                <p>
                                                    {
                                                        asset.brand ||
                                                        asset.category ||
                                                        "Asset"
                                                    }

                                                    {asset.model &&
                                                        ` · ${asset.model}`}
                                                </p>

                                            </div>

                                        </div>


                                        {/* DETAILS */}

                                        <div className="provider-request-details">

                                            <div className="provider-request-detail">

                                                <CalendarDays
                                                    size={16}
                                                />

                                                <div>

                                                    <span>
                                                        Requested
                                                    </span>

                                                    <strong>
                                                        {
                                                            formatDate(
                                                                request.createdAt
                                                            )
                                                        }
                                                    </strong>

                                                </div>

                                            </div>


                                            <div className="provider-request-detail">

                                                <Wrench
                                                    size={16}
                                                />

                                                <div>

                                                    <span>
                                                        Service
                                                    </span>

                                                    <strong>
                                                        {
                                                            SERVICE_TYPE_LABELS[
                                                            request.serviceType
                                                            ] ||
                                                            request.serviceType ||
                                                            "Service"
                                                        }
                                                    </strong>

                                                </div>

                                            </div>


                                            {request.location && (

                                                <div className="provider-request-detail">

                                                    <MapPin
                                                        size={16}
                                                    />

                                                    <div>

                                                        <span>
                                                            Location
                                                        </span>

                                                        <strong>
                                                            {
                                                                request.location.city ||
                                                                request.location.address ||
                                                                "Customer location"
                                                            }
                                                        </strong>

                                                    </div>

                                                </div>

                                            )}


                                            {request.preferredTime && (

                                                <div className="provider-request-detail">

                                                    <Clock
                                                        size={16}
                                                    />

                                                    <div>

                                                        <span>
                                                            Preferred time
                                                        </span>

                                                        <strong>
                                                            {
                                                                request.preferredTime
                                                            }
                                                        </strong>

                                                    </div>

                                                </div>

                                            )}

                                        </div>


                                        {/* DESCRIPTION */}

                                        {request.description && (

                                            <div className="provider-request-description">

                                                <span>
                                                    Customer message
                                                </span>

                                                <p>
                                                    {
                                                        request.description
                                                    }
                                                </p>

                                            </div>

                                        )}


                                        {/* ACTIONS */}

                                        <div className="provider-request-actions">

                                            <button
                                                type="button"
                                                className="provider-view-button"
                                                onClick={() =>
                                                    handleViewRequest(
                                                        request._id
                                                    )
                                                }
                                            >
                                                View Request
                                            </button>


                                            <button
                                                type="button"
                                                className="provider-reject-button"
                                                onClick={() =>
                                                    handleRejectRequest(
                                                        request._id
                                                    )
                                                }
                                                disabled={
                                                    actionLoading === request._id
                                                }
                                            >
                                                {actionLoading === request._id
                                                    ? "Processing..."
                                                    : "Reject"}
                                            </button>


                                            <button
                                                type="button"
                                                className="provider-accept-button"
                                                onClick={() =>
                                                    handleAcceptRequest(
                                                        request._id
                                                    )
                                                }
                                                disabled={
                                                    actionLoading === request._id
                                                }
                                            >
                                                {actionLoading === request._id
                                                    ? "Processing..."
                                                    : "Accept Request"}
                                            </button>

                                        </div>

                                    </div>

                                );

                            }
                        )}

                    </div>

                )}

        </div>

    );
};


export default ProviderRequests;
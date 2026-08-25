import {
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    Clock,
    ClipboardCheck,
    MapPin,
    Settings,
    ShieldCheck,
    Wrench,
} from "lucide-react";

import {
    useState,
} from "react";

import {
    useLocation,
    useNavigate,
} from "react-router-dom";

import {
    createServiceRequest,
} from "../services/serviceRequestService";

import "../styles/requestService.css";


const SERVICE_TYPES = {
    REPAIR: {
        label: "Repair",
        description: "Fix a problem with your asset",
        icon: Wrench,
    },

    SERVICE: {
        label: "Service",
        description: "Regular maintenance or servicing",
        icon: Settings,
    },

    INSPECTION: {
        label: "Inspection",
        description: "Check the condition of your asset",
        icon: ClipboardCheck,
    },
};


const RequestService = () => {

    const location =
        useLocation();

    const navigate =
        useNavigate();


    const {
        provider,
        serviceType,
        asset,
    } = location.state || {};


    const [
        description,
        setDescription,
    ] = useState("");


    const [
        date,
        setDate,
    ] = useState("");


    const [
        time,
        setTime,
    ] = useState("");


    const [
        notes,
        setNotes,
    ] = useState("");


    const [
        submitting,
        setSubmitting,
    ] = useState(false);


    const [
        error,
        setError,
    ] = useState("");


    const [
        success,
        setSuccess,
    ] = useState(false);


    /*
     * If user directly opens this URL
     * without selecting a provider,
     * send them back.
     */

    if (!provider || !asset) {

        return (
            <div className="request-service-page">

                <div className="request-invalid-state">

                    <div className="request-invalid-icon">

                        <Wrench
                            size={28}
                        />

                    </div>

                    <h2>
                        Service provider not selected
                    </h2>

                    <p>
                        Please select a service provider
                        before requesting a service.
                    </p>

                    <button
                        type="button"
                        className="request-secondary-button"
                        onClick={() =>
                            navigate(-1)
                        }
                    >
                        Go Back
                    </button>

                </div>

            </div>
        );
    }


    const service =
        SERVICE_TYPES[serviceType] ||
        SERVICE_TYPES.REPAIR;


    const ServiceIcon =
        service.icon;


    const providerName =
        provider.businessName ||
        provider.name ||
        "Service Provider";


    const rating =
        provider.rating?.average;


    const reviewCount =
        provider.rating?.count;


    const handleSubmit = async (
        event
    ) => {

        event.preventDefault();

        setError("");


        if (!description.trim()) {

            setError(
                "Please describe the service you need."
            );

            return;
        }


        if (!date) {

            setError(
                "Please select a preferred date."
            );

            return;
        }


        try {

            setSubmitting(true);


            const payload = {

                asset:
                    asset._id,

                serviceProvider:
                    provider._id,

                serviceType,

                description:
                    description.trim(),

                preferredDate: date,

                preferredTime:
                    time || undefined,

                notes:
                    notes.trim() ||
                    undefined,

            };


            await createServiceRequest(
                payload
            );


            setSuccess(true);

        } catch (requestError) {

            console.error(
                "Failed to create service request:",
                requestError
            );


            const message =
                requestError?.response?.data?.message ||
                "Unable to submit your service request. Please try again.";


            setError(message);

        } finally {

            setSubmitting(false);

        }
    };


    if (success) {

        return (
            <div className="request-service-page">

                <div className="request-success-card">

                    <div className="request-success-icon">

                        <CheckCircle2
                            size={42}
                        />

                    </div>


                    <h1>
                        Service Request Submitted
                    </h1>


                    <p>
                        Your request has been sent to{" "}
                        <strong>
                            {providerName}
                        </strong>
                        .
                    </p>


                    <p className="request-success-subtext">

                        You can track the status of
                        your request from your
                        service requests.

                    </p>


                    <div className="request-success-actions">

                        <button
                            type="button"
                            className="request-primary-button"
                            onClick={() =>
                                navigate(
                                    "/service-requests"
                                )
                            }
                        >
                            View My Requests
                        </button>


                        <button
                            type="button"
                            className="request-secondary-button"
                            onClick={() =>
                                navigate(
                                    "/"
                                )
                            }
                        >
                            Back to Dashboard
                        </button>

                    </div>

                </div>

            </div>
        );
    }


    return (
        <div className="request-service-page">

            {/* HEADER */}

            <div className="request-page-header">

                <button
                    type="button"
                    className="request-back-button"
                    onClick={() =>
                        navigate(-1)
                    }
                >
                    <ArrowLeft
                        size={18}
                    />

                    <span>
                        Back to technicians
                    </span>
                </button>


                <div className="request-title-wrapper">

                    <div className="request-title-icon">

                        <Wrench
                            size={24}
                        />

                    </div>


                    <div>

                        <h1>
                            Request Service
                        </h1>

                        <p>
                            Tell us what you need
                            help with.
                        </p>

                    </div>

                </div>

            </div>


            {/* MAIN */}

            <div className="request-content">

                {/* LEFT SIDE */}

                <div className="request-main-column">

                    {/* PROVIDER */}

                    <section className="request-section">

                        <div className="request-section-heading">

                            <div>

                                <h2>
                                    Your technician
                                </h2>

                                <p>
                                    The service request
                                    will be sent to this
                                    provider.
                                </p>

                            </div>

                        </div>


                        <div className="request-provider-card">

                            <div className="request-provider-avatar">

                                <Wrench
                                    size={24}
                                />

                            </div>


                            <div className="request-provider-info">

                                <div className="request-provider-name">

                                    <h3>
                                        {providerName}
                                    </h3>


                                    {provider.verified && (

                                        <span className="request-verified-badge">

                                            <ShieldCheck
                                                size={14}
                                            />

                                            Verified

                                        </span>

                                    )}

                                </div>


                                <div className="request-provider-rating">

                                    <span className="rating-star">
                                        ★
                                    </span>

                                    <strong>
                                        {rating ?? "New"}
                                    </strong>


                                    {reviewCount !==
                                        undefined && (

                                            <span>
                                                
                                                {reviewCount}
                                                {" reviews)"}
                                            </span>

                                        )}

                                </div>


                                <div className="request-provider-meta">

                                    <span>

                                        <MapPin
                                            size={14}
                                        />

                                        {provider.distanceKm ??
                                            "-"}
                                        {" km away"}

                                    </span>


                                    <span>

                                        <Clock
                                            size={14}
                                        />

                                        {provider.experienceYears ??
                                            0}
                                        {" years experience"}

                                    </span>

                                </div>

                            </div>

                        </div>

                    </section>


                    {/* ASSET */}

                    <section className="request-section">

                        <div className="request-section-heading">

                            <div>

                                <h2>
                                    Asset
                                </h2>

                                <p>
                                    The asset that needs
                                    service.
                                </p>

                            </div>

                        </div>


                        <div className="request-asset-card">

                            <div className="request-asset-icon">

                                <Wrench
                                    size={21}
                                />

                            </div>


                            <div>

                                <span>
                                    Asset
                                </span>

                                <h3>
                                    {asset.name}
                                </h3>

                                <p>
                                    {asset.category ||
                                        "Asset"}
                                    {asset.brand
                                        ? ` • ${asset.brand}`
                                        : ""}
                                    {asset.model
                                        ? ` • ${asset.model}`
                                        : ""}
                                </p>

                            </div>

                        </div>

                    </section>


                    {/* SERVICE TYPE */}

                    <section className="request-section">

                        <div className="request-section-heading">

                            <div>

                                <h2>
                                    Service type
                                </h2>

                                <p>
                                    What type of help
                                    do you need?
                                </p>

                            </div>

                        </div>


                        <div className="request-selected-service">

                            <div className="request-service-type-icon">

                                <ServiceIcon
                                    size={21}
                                />

                            </div>


                            <div>

                                <strong>
                                    {service.label}
                                </strong>

                                <span>
                                    {service.description}
                                </span>

                            </div>


                            <div className="request-selected-check">

                                <CheckCircle2
                                    size={20}
                                />

                            </div>

                        </div>

                    </section>


                    {/* FORM */}

                    <form
                        className="request-form"
                        onSubmit={handleSubmit}
                    >

                        <section className="request-section">

                            <div className="request-section-heading">

                                <div>

                                    <h2>
                                        Service details
                                    </h2>

                                    <p>
                                        Give the technician
                                        enough information
                                        to understand the
                                        request.
                                    </p>

                                </div>

                            </div>


                            <div className="request-field">

                                <label htmlFor="description">

                                    What's the problem?

                                    <span>
                                        *
                                    </span>

                                </label>


                                <textarea
                                    id="description"
                                    value={
                                        description
                                    }
                                    onChange={(event) =>
                                        setDescription(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Describe the issue or service you need..."
                                    rows={5}
                                    required
                                />

                                <div className="request-field-hint">

                                    Include symptoms,
                                    error messages,
                                    or anything the
                                    technician should know.

                                </div>

                            </div>


                            <div className="request-date-time-grid">

                                <div className="request-field">

                                    <label htmlFor="date">

                                        Preferred date

                                        <span>
                                            *
                                        </span>

                                    </label>


                                    <div className="request-input-icon">

                                        <CalendarDays
                                            size={18}
                                        />

                                        <input
                                            id="date"
                                            type="date"
                                            value={date}
                                            min={
                                                new Date()
                                                    .toISOString()
                                                    .split("T")[0]
                                            }
                                            onChange={(event) =>
                                                setDate(
                                                    event.target.value
                                                )
                                            }
                                            required
                                        />

                                    </div>

                                </div>


                                <div className="request-field">

                                    <label htmlFor="time">

                                        Preferred time

                                    </label>


                                    <div className="request-input-icon">

                                        <Clock
                                            size={18}
                                        />

                                        <input
                                            id="time"
                                            type="time"
                                            value={time}
                                            onChange={(event) =>
                                                setTime(
                                                    event.target.value
                                                )
                                            }
                                        />

                                    </div>

                                </div>

                            </div>


                            <div className="request-field">

                                <label htmlFor="notes">

                                    Additional notes

                                </label>


                                <textarea
                                    id="notes"
                                    value={notes}
                                    onChange={(event) =>
                                        setNotes(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Anything else the technician should know?"
                                    rows={4}
                                />

                            </div>


                            {/* ERROR */}

                            {error && (

                                <div className="request-error">

                                    <span>
                                        {error}
                                    </span>

                                </div>

                            )}


                            {/* SUBMIT */}

                            <div className="request-submit-area">

                                <div className="request-submit-info">

                                    <ShieldCheck
                                        size={18}
                                    />

                                    <span>
                                        Your request will
                                        be securely sent to
                                        the selected provider.
                                    </span>

                                </div>


                                <button
                                    type="submit"
                                    className="request-primary-button request-submit-button"
                                    disabled={
                                        submitting
                                    }
                                >

                                    {submitting
                                        ? "Submitting..."
                                        : "Request Service"}

                                </button>

                            </div>

                        </section>

                    </form>

                </div>


                {/* RIGHT SUMMARY */}

                <aside className="request-summary">

                    <div className="request-summary-card">

                        <div className="request-summary-heading">

                            <h2>
                                Request summary
                            </h2>

                            <span>
                                {service.label}
                            </span>

                        </div>


                        <div className="request-summary-item">

                            <div className="request-summary-icon">

                                <Wrench
                                    size={17}
                                />

                            </div>

                            <div>

                                <span>
                                    Asset
                                </span>

                                <strong>
                                    {asset.name}
                                </strong>

                            </div>

                        </div>


                        <div className="request-summary-divider" />


                        <div className="request-summary-item">

                            <div className="request-summary-icon">

                                <ShieldCheck
                                    size={17}
                                />

                            </div>

                            <div>

                                <span>
                                    Technician
                                </span>

                                <strong>
                                    {providerName}
                                </strong>

                            </div>

                        </div>


                        <div className="request-summary-divider" />


                        <div className="request-summary-item">

                            <div className="request-summary-icon">

                                <CalendarDays
                                    size={17}
                                />

                            </div>

                            <div>

                                <span>
                                    Preferred date
                                </span>

                                <strong>
                                    {date
                                        ? new Date(
                                            `${date}T00:00:00`
                                        ).toLocaleDateString(
                                            undefined,
                                            {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                            }
                                        )
                                        : "Not selected"}
                                </strong>

                            </div>

                        </div>


                        <div className="request-summary-divider" />


                        <div className="request-summary-note">

                            <ShieldCheck
                                size={17}
                            />

                            <p>
                                You are requesting a
                                service appointment.
                                The provider will review
                                your request and respond.
                            </p>

                        </div>

                    </div>

                </aside>

            </div>

        </div>
    );
};


export default RequestService;
import {
    Check,
    ClipboardCheck,
    RefreshCw,
    Save,
    Wrench,
} from "lucide-react";

import {
    useEffect,
    useState,
} from "react";

import {
    getMyProvider,
    updateProviderProfile,
} from "../../services/serviceProviderService";

import "../../styles/provider/providerServices.css";


const SERVICE_OPTIONS = [
    {
        value: "REPAIR",
        label: "Repair",
        description:
            "Diagnose and repair damaged or malfunctioning assets.",
        icon: Wrench,
    },
    {
        value: "SERVICE",
        label: "Service",
        description:
            "Routine servicing, maintenance and preventive care.",
        icon: RefreshCw,
    },
    {
        value: "INSPECTION",
        label: "Inspection",
        description:
            "Inspect assets and identify potential problems.",
        icon: ClipboardCheck,
    },
];


const ProviderServices = () => {

    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");


    const loadProvider = async () => {

        try {

            setLoading(true);
            setError("");

            const response =
                await getMyProvider();

            const provider =
                response?.data?.data ||
                response?.data?.provider ||
                response?.data;

            setServices(
                provider?.services || []
            );

        } catch (requestError) {

            console.error(
                "Failed to load provider services:",
                requestError
            );

            setError(
                requestError
                    ?.response
                    ?.data
                    ?.message ||
                "Unable to load your services."
            );

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {

        loadProvider();

    }, []);


    const toggleService = (serviceValue) => {

        setSuccess("");
        setError("");

        setServices((current) =>
            current.includes(serviceValue)
                ? current.filter(
                    (service) =>
                        service !== serviceValue
                )
                : [...current, serviceValue]
        );
    };


    const handleSave = async () => {

        if (services.length === 0) {

            setError(
                "Please select at least one service."
            );

            return;
        }

        try {

            setSaving(true);
            setError("");
            setSuccess("");

            await updateProviderProfile({
                services,
            });

            setSuccess(
                "Your services have been updated successfully."
            );

        } catch (requestError) {

            console.error(
                "Failed to update services:",
                requestError
            );

            setError(
                requestError
                    ?.response
                    ?.data
                    ?.message ||
                "Unable to update your services."
            );

        } finally {

            setSaving(false);

        }
    };


    if (loading) {

        return (

            <div className="provider-services-page">

                <div className="provider-services-state">

                    <div className="provider-services-loading-icon">
                        <RefreshCw
                            size={24}
                        />
                    </div>

                    <h2>
                        Loading services
                    </h2>

                    <p>
                        We're retrieving your service
                        offerings.
                    </p>

                </div>

            </div>
        );
    }


    return (

        <div className="provider-services-page">

            {/* HEADER */}

            <header className="provider-services-header">

                <div>

                    <span className="provider-services-eyebrow">
                        Provider Workspace
                    </span>

                    <h1>
                        Services
                    </h1>

                    <p>
                        Choose the services customers
                        can request from your business.
                    </p>

                </div>

                <div className="provider-services-summary">

                    <span className="provider-services-summary-number">
                        {services.length}
                    </span>

                    <span>
                        {services.length === 1
                            ? "service active"
                            : "services active"}
                    </span>

                </div>

            </header>


            {/* ERROR */}

            {error && (

                <div
                    className="provider-services-message provider-services-error"
                    role="alert"
                >
                    {error}
                </div>

            )}


            {/* SUCCESS */}

            {success && (

                <div
                    className="provider-services-message provider-services-success"
                    role="status"
                >

                    <Check size={17} />

                    {success}

                </div>

            )}


            {/* MAIN CARD */}

            <section className="provider-services-card">

                <div className="provider-services-card-header">

                    <div>

                        <h2>
                            Service offerings
                        </h2>

                        <p>
                            Select all services your business
                            is currently equipped to provide.
                        </p>

                    </div>

                    <span className="provider-services-selection-count">

                        {services.length} /{" "}
                        {SERVICE_OPTIONS.length}

                    </span>

                </div>


                {/* SERVICES */}

                <div className="provider-services-list">

                    {SERVICE_OPTIONS.map(
                        (service) => {

                            const selected =
                                services.includes(
                                    service.value
                                );

                            const Icon =
                                service.icon;

                            return (

                                <button
                                    key={
                                        service.value
                                    }
                                    type="button"
                                    aria-pressed={
                                        selected
                                    }
                                    className={`provider-service-option ${
                                        selected
                                            ? "provider-service-option-selected"
                                            : ""
                                    }`}
                                    onClick={() =>
                                        toggleService(
                                            service.value
                                        )
                                    }
                                >

                                    <div
                                        className={`provider-service-icon ${
                                            selected
                                                ? "provider-service-icon-selected"
                                                : ""
                                        }`}
                                    >

                                        <Icon
                                            size={20}
                                        />

                                    </div>


                                    <div className="provider-service-option-content">

                                        <div className="provider-service-option-title">

                                            <strong>
                                                {
                                                    service.label
                                                }
                                            </strong>

                                            {selected && (

                                                <span className="provider-service-active">

                                                    <Check
                                                        size={12}
                                                    />

                                                    Active

                                                </span>

                                            )}

                                        </div>

                                        <span>
                                            {
                                                service.description
                                            }
                                        </span>

                                    </div>


                                    <div
                                        className={`provider-service-checkbox ${
                                            selected
                                                ? "provider-service-checkbox-selected"
                                                : ""
                                        }`}
                                    >

                                        {selected && (
                                            <Check
                                                size={15}
                                            />
                                        )}

                                    </div>

                                </button>
                            );
                        }
                    )}

                </div>


                {/* FOOTER */}

                <div className="provider-services-footer">

                    <div className="provider-services-footer-info">

                        <span className="provider-services-footer-title">
                            Service availability
                        </span>

                        <span className="provider-services-footer-description">
                            Customers can only request
                            services you have enabled.
                        </span>

                    </div>


                    <button
                        type="button"
                        className="provider-services-save-button"
                        disabled={
                            saving ||
                            services.length === 0
                        }
                        onClick={handleSave}
                    >

                        {saving ? (

                            <>
                                <RefreshCw
                                    size={16}
                                    className="provider-services-spin"
                                />

                                Saving...

                            </>

                        ) : (

                            <>
                                <Save
                                    size={16}
                                />

                                Save changes
                            </>

                        )}

                    </button>

                </div>

            </section>

        </div>
    );
};


export default ProviderServices;
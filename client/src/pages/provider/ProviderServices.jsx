import {
    Check,
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
    },
    {
        value: "SERVICE",
        label: "Service",
        description:
            "Routine servicing, maintenance and preventive care.",
    },
    {
        value: "INSPECTION",
        label: "Inspection",
        description:
            "Inspect assets and identify potential problems.",
    },
];


const ProviderServices = () => {

    const [
        services,
        setServices,
    ] = useState([]);

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        saving,
        setSaving,
    ] = useState(false);

    const [
        error,
        setError,
    ] = useState("");

    const [
        success,
        setSuccess,
    ] = useState("");


    const loadProvider =
        async () => {

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


    const toggleService =
        (serviceValue) => {

            setSuccess("");
            setError("");

            setServices(
                (current) => {

                    if (
                        current.includes(
                            serviceValue
                        )
                    ) {

                        return current.filter(
                            (service) =>
                                service !==
                                serviceValue
                        );

                    }

                    return [
                        ...current,
                        serviceValue,
                    ];
                }
            );
        };


    const handleSave =
        async () => {

            if (
                services.length === 0
            ) {

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
                    "Services updated successfully."
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

                    <RefreshCw
                        size={26}
                        className="provider-services-spin"
                    />

                    <h2>
                        Loading services
                    </h2>

                    <p>
                        We're retrieving your
                        service offerings.
                    </p>

                </div>

            </div>
        );
    }


    return (

        <div className="provider-services-page">

            <div className="provider-services-header">

                <div className="provider-services-title">

                    <div className="provider-services-title-icon">

                        <Wrench
                            size={23}
                        />

                    </div>

                    <div>

                        <h1>
                            Services
                        </h1>

                        <p>
                            Manage the services you
                            provide to customers.
                        </p>

                    </div>

                </div>

            </div>


            {error && (

                <div className="provider-services-message provider-services-error">

                    {error}

                </div>

            )}


            {success && (

                <div className="provider-services-message provider-services-success">

                    <Check size={17} />

                    {success}

                </div>

            )}


            <section className="provider-services-card">

                <div className="provider-services-card-heading">

                    <div>

                        <h2>
                            Services you offer
                        </h2>

                        <p>
                            Select the services that
                            customers can request from
                            your business.
                        </p>

                    </div>

                </div>


                <div className="provider-services-list">

                    {SERVICE_OPTIONS.map(
                        (service) => {

                            const selected =
                                services.includes(
                                    service.value
                                );

                            return (

                                <button
                                    key={
                                        service.value
                                    }
                                    type="button"
                                    className={`provider-service-option ${selected
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
                                        className={`provider-service-checkbox ${selected
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


                                    <div className="provider-service-option-content">

                                        <strong>
                                            {
                                                service.label
                                            }
                                        </strong>

                                        <span>
                                            {
                                                service.description
                                            }
                                        </span>

                                    </div>

                                </button>
                            );
                        }
                    )}

                </div>


                <div className="provider-services-footer">

                    <span>

                        {services.length}{" "}

                        {services.length === 1
                            ? "service"
                            : "services"}{" "}
                        selected

                    </span>


                    <button
                        type="button"
                        className="provider-services-save-button"
                        disabled={saving}
                        onClick={
                            handleSave
                        }
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

                                Save Services
                            </>

                        )}

                    </button>

                </div>

            </section>

        </div>
    );
};


export default ProviderServices;
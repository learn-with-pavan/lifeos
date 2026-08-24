import {
    ArrowLeft,
    MapPin,
    Star,
    Wrench,
    ShieldCheck,
    Clock,
    Search,
    Settings,
    ClipboardCheck,
} from "lucide-react";

import {
    useEffect,
    useState,
} from "react";

import {
    useNavigate,
    useParams,
} from "react-router-dom";

import {
    getProvidersForAsset,
} from "../services/serviceProviderService";

import "../styles/serviceProvider.css";


const SERVICE_TYPES = [
    {
        value: "REPAIR",
        label: "Repair",
        description: "Fix a problem with your asset",
        icon: Wrench,
    },
    {
        value: "SERVICE",
        label: "Service",
        description: "Regular maintenance or servicing",
        icon: Settings,
    },
    {
        value: "INSPECTION",
        label: "Inspection",
        description: "Check the condition of your asset",
        icon: ClipboardCheck,
    },
];


const ServiceProviders = () => {

    const {
        assetId,
    } = useParams();

    const navigate =
        useNavigate();


    const [
        data,
        setData,
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
        selectedService,
        setSelectedService,
    ] = useState("REPAIR");


    const [
        selectedProvider,
        setSelectedProvider,
    ] = useState(null);


    const loadProviders = async (
        latitude,
        longitude
    ) => {

        try {

            setLoading(true);
            setError("");


            const response =
                await getProvidersForAsset(
                    assetId,
                    latitude,
                    longitude
                );


            /*
             * Axios response is expected
             * to contain:
             *
             * {
             *   asset: {},
             *   providers: []
             * }
             */

            setData(
                response.data
            );

        } catch (requestError) {

            console.error(
                "Failed to load service providers:",
                requestError
            );

            setError(
                "Unable to find technicians near you."
            );

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {

        if (!navigator.geolocation) {

            setError(
                "Location is not supported by your browser."
            );

            setLoading(false);

            return;
        }


        navigator.geolocation.getCurrentPosition(

            (position) => {

                loadProviders(
                    position.coords.latitude,
                    position.coords.longitude
                );

            },

            () => {

                setError(
                    "Location permission is required to find technicians near you."
                );

                setLoading(false);

            },

            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000,
            }

        );

    }, [assetId]);

    const handleRequestService = (provider) => {
        setSelectedProvider(
            provider
        );
        
        navigate(
            `/service-providers/${assetId}/request`,
            {
                state: {
                    provider,
                    serviceType: selectedService,
                    asset: data?.asset,
                },
            }
        );
    };

    const providers =
        Array.isArray(
            data?.providers
        )
            ? data.providers
            : [];


    return (
        <div className="service-providers-page">

            {/* HEADER */}

            <div className="service-page-header">

                <button
                    type="button"
                    className="service-back-button"
                    onClick={() =>
                        navigate(-1)
                    }
                >
                    <ArrowLeft
                        size={18}
                    />

                    <span>
                        Back to asset
                    </span>
                </button>


                <div className="service-title-wrapper">

                    <div className="service-title-icon">

                        <Wrench
                            size={24}
                        />

                    </div>


                    <div>

                        <h1>
                            Find a Technician
                        </h1>

                        <p>
                            Get professional help
                            for your asset.
                        </p>

                    </div>

                </div>

            </div>


            {/* LOADING */}

            {loading && (

                <div className="service-state-card">

                    <div className="service-state-icon loading-icon">

                        <Search
                            size={28}
                        />

                    </div>

                    <h2>
                        Finding technicians
                    </h2>

                    <p>
                        We're looking for
                        available technicians
                        near your location.
                    </p>

                </div>

            )}


            {/* ERROR */}

            {!loading && error && (

                <div className="service-state-card">

                    <div className="service-state-icon">

                        <MapPin
                            size={28}
                        />

                    </div>

                    <h2>
                        Location required
                    </h2>

                    <p>
                        {error}
                    </p>

                    <button
                        type="button"
                        className="secondary-button"
                        onClick={() =>
                            window.location.reload()
                        }
                    >
                        Try Again
                    </button>

                </div>

            )}


            {/* MAIN CONTENT */}

            {!loading &&
                !error && (
                    <>

                        {/* ASSET SUMMARY */}

                        <div className="service-asset-card">

                            <div className="service-asset-left">

                                <div className="service-asset-icon">

                                    <Wrench
                                        size={22}
                                    />

                                </div>


                                <div className="service-asset-details">

                                    <span>
                                        Asset
                                    </span>

                                    <h2>
                                        {data?.asset?.name ||
                                            "Selected asset"}
                                    </h2>

                                    <p>
                                        {data?.asset?.category ||
                                            "Asset"}
                                    </p>

                                </div>

                            </div>


                            <div className="service-location">

                                <MapPin
                                    size={17}
                                />

                                <span>
                                    Technicians near you
                                </span>

                            </div>

                        </div>


                        {/* SERVICE TYPE */}

                        <section className="service-section">

                            <div className="section-heading">

                                <div>

                                    <h2>
                                        What do you need?
                                    </h2>

                                    <p>
                                        Select the type of
                                        service you need.
                                    </p>

                                </div>

                            </div>


                            <div className="service-type-grid">

                                {SERVICE_TYPES.map(
                                    (service) => {

                                        const Icon =
                                            service.icon;

                                        const isSelected =
                                            selectedService ===
                                            service.value;


                                        return (
                                            <button
                                                type="button"
                                                key={
                                                    service.value
                                                }
                                                className={`service-type-card ${isSelected
                                                        ? "selected"
                                                        : ""
                                                    }`}
                                                onClick={() =>
                                                    setSelectedService(
                                                        service.value
                                                    )
                                                }
                                            >

                                                <div className="service-type-icon">

                                                    <Icon
                                                        size={22}
                                                    />

                                                </div>


                                                <div className="service-type-content">

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


                                                <div className="service-type-radio">

                                                    {isSelected && (
                                                        <div />
                                                    )}

                                                </div>

                                            </button>
                                        );
                                    }
                                )}

                            </div>

                        </section>


                        {/* PROVIDERS HEADER */}

                        <section className="service-section">

                            <div className="providers-heading">

                                <div>

                                    <h2>
                                        Available technicians
                                    </h2>

                                    <p>
                                        Choose a technician
                                        based on rating,
                                        distance and
                                        experience.
                                    </p>

                                </div>


                                <div className="provider-count">

                                    {providers.length}

                                    <span>
                                        available
                                    </span>

                                </div>

                            </div>


                            {/* NO PROVIDERS */}

                            {providers.length === 0 && (

                                <div className="service-state-card no-provider-state">

                                    <div className="service-state-icon">

                                        <Wrench
                                            size={28}
                                        />

                                    </div>

                                    <h2>
                                        No technicians found
                                    </h2>

                                    <p>
                                        We couldn't find a
                                        technician for this
                                        service near your
                                        location.
                                    </p>

                                    <button
                                        type="button"
                                        className="secondary-button"
                                        onClick={() =>
                                            window.location.reload()
                                        }
                                    >
                                        Try Again
                                    </button>

                                </div>

                            )}


                            {/* PROVIDER LIST */}

                            {providers.length > 0 && (

                                <div className="provider-list">

                                    {providers.map(
                                        (provider) => {

                                            const rating =
                                                provider
                                                    .rating
                                                    ?.average;


                                            const reviewCount =
                                                provider
                                                    .rating
                                                    ?.count;


                                            const isSelected =
                                                selectedProvider?._id ===
                                                provider._id;


                                            return (
                                                <div
                                                    className={`provider-card ${isSelected
                                                            ? "provider-selected"
                                                            : ""
                                                        }`}
                                                    key={
                                                        provider._id
                                                    }
                                                >

                                                    {/* ICON */}

                                                    <div className="provider-avatar">

                                                        <Wrench
                                                            size={24}
                                                        />

                                                    </div>


                                                    {/* INFO */}

                                                    <div className="provider-information">

                                                        <div className="provider-name-row">

                                                            <h3>
                                                                {
                                                                    provider.businessName ||
                                                                    provider.name ||
                                                                    "Service Provider"
                                                                }
                                                            </h3>


                                                            {provider.verified && (

                                                                <span className="verified-badge">

                                                                    <ShieldCheck
                                                                        size={14}
                                                                    />

                                                                    Verified

                                                                </span>

                                                            )}

                                                        </div>


                                                        {/* RATING */}

                                                        <div className="provider-rating">

                                                            <Star
                                                                size={15}
                                                                fill="currentColor"
                                                            />


                                                            <strong>
                                                                {rating ??
                                                                    "New"}
                                                            </strong>


                                                            {reviewCount !==
                                                                undefined && (

                                                                    <span>
                                                                        (
                                                                        {
                                                                            reviewCount
                                                                        }
                                                                        {" reviews)"}
                                                                    </span>
                                                                )}

                                                        </div>


                                                        {/* SERVICES */}

                                                        <div className="provider-services">

                                                            {Array.isArray(
                                                                provider.services
                                                            ) &&
                                                                provider.services
                                                                    .map(
                                                                        (
                                                                            service
                                                                        ) => (
                                                                            <span
                                                                                key={
                                                                                    service
                                                                                }
                                                                            >
                                                                                {
                                                                                    service
                                                                                }
                                                                            </span>
                                                                        )
                                                                    )}

                                                        </div>


                                                        {/* META */}

                                                        <div className="provider-meta">

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


                                                    {/* ACTION */}

                                                    <div className="provider-action">

                                                        <button
                                                            type="button"
                                                            className="primary-button"
                                                            onClick={() =>
                                                                handleRequestService(
                                                                    provider
                                                                )
                                                            }
                                                        >
                                                            Request Service
                                                        </button>

                                                    </div>

                                                </div>
                                            );
                                        }
                                    )}

                                </div>

                            )}

                        </section>

                    </>
                )}

        </div>
    );
};


export default ServiceProviders;
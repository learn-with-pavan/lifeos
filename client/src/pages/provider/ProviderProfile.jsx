import {
    Building2,
    Check,
    CheckCircle2,
    Clock,
    Mail,
    MapPin,
    Phone,
    Save,
    ShieldCheck,
    UserRound,
    Wrench,
} from "lucide-react";

import {
    useEffect,
    useState,
} from "react";

import "../../styles/provider/providerProfile.css";

import {
    getMyProvider,
    updateProvider,
    updateProviderAvailability,
    updateProviderLocation,
} from "../../services/serviceProviderService";


const AVAILABILITY_OPTIONS = [
    {
        value: "AVAILABLE",
        label: "Available",
    },
    {
        value: "BUSY",
        label: "Busy",
    },
    {
        value: "UNAVAILABLE",
        label: "Unavailable",
    },
];


const CATEGORY_OPTIONS = [
    {
        value: "Electronics",
        label: "Electronics",
        description:
            "Phones, laptops, TVs and other electronic devices.",
    },
    {
        value: "Appliance",
        label: "Appliances",
        description:
            "Refrigerators, washing machines, ACs and home appliances.",
    },
    {
        value: "Vehicle",
        label: "Vehicles",
        description:
            "Cars, bikes and other vehicles.",
    },
    {
        value: "Furniture",
        label: "Furniture",
        description:
            "Beds, sofas, tables and other furniture.",
    },
    {
        value: "Other",
        label: "Other",
        description:
            "Other asset types you support.",
    },
];


const ProviderProfile = () => {

    const [provider, setProvider] = useState(null);
    const [supportedCategories, setSupportedCategories] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [availabilitySaving, setAvailabilitySaving] = useState(false);
    const [locationSaving, setLocationSaving] = useState(false);

    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [locationMessage, setLocationMessage] = useState("");

    const [form, setForm] = useState({
        businessName: "",
        description: "",
        phone: "",
        email: "",
        serviceRadiusKm: "",
        experienceYears: "",
        address: "",
        city: "",
        state: "",
        country: "",
        pincode: "",
    });


    const loadProvider = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await getMyProvider();

            const data =
                response?.data?.provider ||
                response?.data?.data ||
                response?.data;

            setProvider(data);
            setSupportedCategories(
                data?.supportedCategories || []
            );

            setForm({
                businessName: data?.businessName || "",
                description: data?.description || "",
                phone: data?.phone || "",
                email: data?.email || "",
                serviceRadiusKm: data?.serviceRadiusKm ?? "",
                experienceYears: data?.experienceYears ?? "",
                address: data?.location?.address || "",
                city: data?.location?.city || "",
                state: data?.location?.state || "",
                country: data?.location?.country || "",
                pincode: data?.location?.pincode || "",
            });

        } catch (requestError) {

            console.error(
                "Failed to load provider profile:",
                requestError
            );

            setError(
                requestError?.response?.data?.message ||
                "Unable to load provider profile."
            );

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {
        loadProvider();
    }, []);


    const handleChange = (event) => {

        const {
            name,
            value,
        } = event.target;

        setForm((current) => ({
            ...current,
            [name]: value,
        }));
    };


    const toggleCategory = (categoryValue) => {

        setError("");
        setSuccessMessage("");

        setSupportedCategories((current) =>
            current.includes(categoryValue)
                ? current.filter(
                    (category) => category !== categoryValue
                )
                : [...current, categoryValue]
        );
    };


    const handleSave = async (event) => {

        event.preventDefault();

        if (!supportedCategories.length) {
            setError(
                "Please select at least one supported asset category."
            );
            return;
        }

        try {

            setSaving(true);
            setError("");
            setSuccessMessage("");

            const payload = {
                businessName: form.businessName.trim(),
                description: form.description.trim(),
                phone: form.phone.trim(),
                email: form.email.trim(),
                serviceRadiusKm:
                    Number(form.serviceRadiusKm) || 0,
                experienceYears:
                    Number(form.experienceYears) || 0,
                supportedCategories,
                location: {
                    address: form.address.trim(),
                    city: form.city.trim(),
                    state: form.state.trim(),
                    country: form.country.trim(),
                    pincode: form.pincode.trim(),
                },
            };

            const response = await updateProvider(payload);

            const updatedProvider =
                response?.data?.provider ||
                response?.data?.data ||
                response?.data;

            setProvider(updatedProvider);

            setSupportedCategories(
                updatedProvider?.supportedCategories ||
                supportedCategories
            );

            setSuccessMessage(
                "Provider profile updated successfully."
            );

        } catch (requestError) {

            console.error(
                "Failed to update provider profile:",
                requestError
            );

            setError(
                requestError?.response?.data?.message ||
                "Unable to update provider profile."
            );

        } finally {

            setSaving(false);

        }
    };


    const handleAvailabilityChange = async (event) => {

        const availability = event.target.value;

        try {

            setAvailabilitySaving(true);
            setError("");
            setSuccessMessage("");

            const response =
                await updateProviderAvailability(
                    availability
                );

            const updatedProvider =
                response?.data?.provider ||
                response?.data?.data ||
                response?.data;

            setProvider(updatedProvider);

            setSuccessMessage(
                "Availability updated successfully."
            );

        } catch (requestError) {

            console.error(
                "Failed to update availability:",
                requestError
            );

            setError(
                requestError?.response?.data?.message ||
                "Unable to update availability."
            );

        } finally {

            setAvailabilitySaving(false);

        }
    };


    const handleUseCurrentLocation = () => {

        setError("");
        setSuccessMessage("");
        setLocationMessage("");

        if (!navigator.geolocation) {

            setError(
                "Location services are not supported by your browser."
            );

            return;
        }

        setLocationSaving(true);

        navigator.geolocation.getCurrentPosition(

            async (position) => {

                try {

                    const {
                        latitude,
                        longitude,
                    } = position.coords;

                    await updateProviderLocation(
                        latitude,
                        longitude
                    );

                    setLocationMessage(
                        "Your service location has been saved successfully."
                    );

                } catch (requestError) {

                    console.error(
                        "Failed to update provider location:",
                        requestError
                    );

                    setError(
                        requestError?.response?.data?.message ||
                        "Unable to save your location."
                    );

                } finally {

                    setLocationSaving(false);
                }
            },

            (locationError) => {

                console.error(
                    "Browser location error:",
                    locationError
                );

                const messages = {
                    [locationError.PERMISSION_DENIED]:
                        "Location permission was denied. Please allow location access in your browser.",
                    [locationError.POSITION_UNAVAILABLE]:
                        "Your current location could not be determined.",
                    [locationError.TIMEOUT]:
                        "Location request timed out. Please try again.",
                };

                setError(
                    messages[locationError.code] ||
                    "Unable to get your current location."
                );

                setLocationSaving(false);
            },

            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000,
            }
        );
    };


    if (loading) {

        return (
            <div className="provider-profile-page">

                <div className="provider-profile-state">

                    <div className="provider-profile-loading-icon">
                        <Clock size={26} />
                    </div>

                    <h2>Loading profile</h2>

                    <p>
                        Retrieving your provider profile.
                    </p>

                </div>

            </div>
        );
    }


    if (error && !provider) {

        return (
            <div className="provider-profile-page">

                <div className="provider-profile-state provider-profile-state-error">

                    <div className="provider-profile-error-icon">
                        <ShieldCheck size={28} />
                    </div>

                    <h2>Unable to load profile</h2>

                    <p>{error}</p>

                    <button
                        type="button"
                        onClick={loadProvider}
                    >
                        Try Again
                    </button>

                </div>

            </div>
        );
    }


    const hasSavedLocation =
        provider?.location?.coordinates?.length === 2 &&
        provider.location.coordinates.some(
            (coordinate) => Number(coordinate) !== 0
        );


    return (

        <div className="provider-profile-page">

            {/* PAGE HEADER */}

            <header className="provider-profile-header">

                <div className="provider-profile-header-icon">
                    <UserRound size={24} />
                </div>

                <div className="provider-profile-header-content">

                    <span className="provider-profile-eyebrow">
                        Provider Workspace
                    </span>

                    <h1>Provider Profile</h1>

                    <p>
                        Manage your business information,
                        services and coverage.
                    </p>

                </div>

            </header>


            {/* MESSAGES */}

            {error && (

                <div className="provider-profile-message provider-profile-message-error">

                    <span>{error}</span>

                </div>
            )}


            {successMessage && (

                <div className="provider-profile-message provider-profile-message-success">

                    <CheckCircle2 size={17} />

                    <span>{successMessage}</span>

                </div>
            )}


            <form
                className="provider-profile-form"
                onSubmit={handleSave}
            >

                {/* BUSINESS INFORMATION */}

                <section className="provider-profile-card">

                    <div className="provider-profile-section-heading">

                        <div className="provider-profile-section-icon">
                            <Building2 size={19} />
                        </div>

                        <div>
                            <h2>Business Information</h2>

                            <p>
                                Tell customers about your
                                service business.
                            </p>
                        </div>

                    </div>


                    <div className="provider-profile-form-grid">

                        <div className="provider-profile-field provider-profile-field-full">

                            <label htmlFor="businessName">
                                Business Name
                            </label>

                            <input
                                id="businessName"
                                name="businessName"
                                type="text"
                                value={form.businessName}
                                onChange={handleChange}
                                placeholder="Your business name"
                                required
                            />

                        </div>


                        <div className="provider-profile-field provider-profile-field-full">

                            <label htmlFor="description">
                                Business Description
                            </label>

                            <textarea
                                id="description"
                                name="description"
                                rows="4"
                                value={form.description}
                                onChange={handleChange}
                                placeholder="Describe your services, expertise and experience..."
                            />

                            <span className="provider-profile-field-hint">
                                A clear description helps customers
                                understand what you offer.
                            </span>

                        </div>

                    </div>

                </section>


                {/* CONTACT */}

                <section className="provider-profile-card">

                    <div className="provider-profile-section-heading">

                        <div className="provider-profile-section-icon">
                            <Phone size={19} />
                        </div>

                        <div>
                            <h2>Contact Information</h2>

                            <p>
                                Contact details customers can use
                                when necessary.
                            </p>
                        </div>

                    </div>


                    <div className="provider-profile-form-grid">

                        <div className="provider-profile-field">

                            <label htmlFor="phone">
                                Phone
                            </label>

                            <div className="provider-profile-input-icon">

                                <Phone size={16} />

                                <input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    value={form.phone}
                                    onChange={handleChange}
                                    placeholder="Phone number"
                                />

                            </div>

                        </div>


                        <div className="provider-profile-field">

                            <label htmlFor="email">
                                Business Email
                            </label>

                            <div className="provider-profile-input-icon">

                                <Mail size={16} />

                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="Business email"
                                />

                            </div>

                        </div>

                    </div>

                </section>


                {/* CATEGORIES */}

                <section className="provider-profile-card">

                    <div className="provider-profile-section-heading">

                        <div className="provider-profile-section-icon">
                            <Wrench size={19} />
                        </div>

                        <div>
                            <h2>Supported Asset Categories</h2>

                            <p>
                                Select the types of assets your
                                business can service.
                            </p>
                        </div>

                    </div>


                    <div className="provider-category-grid">

                        {CATEGORY_OPTIONS.map((category) => {

                            const selected =
                                supportedCategories.includes(
                                    category.value
                                );

                            return (

                                <button
                                    key={category.value}
                                    type="button"
                                    className={`provider-category-option ${selected
                                            ? "provider-category-option-selected"
                                            : ""
                                        }`}
                                    onClick={() =>
                                        toggleCategory(
                                            category.value
                                        )
                                    }
                                >

                                    <div className="provider-category-top">

                                        <div
                                            className={`provider-category-checkbox ${selected
                                                    ? "provider-category-checkbox-selected"
                                                    : ""
                                                }`}
                                        >
                                            {selected && (
                                                <Check size={14} />
                                            )}
                                        </div>

                                        {selected && (
                                            <span className="provider-category-selected-label">
                                                Selected
                                            </span>
                                        )}

                                    </div>


                                    <div className="provider-category-content">

                                        <strong>
                                            {category.label}
                                        </strong>

                                        <span>
                                            {category.description}
                                        </span>

                                    </div>

                                </button>
                            );
                        })}

                    </div>


                    <div className="provider-category-summary">

                        <span>
                            {supportedCategories.length}{" "}
                            {supportedCategories.length === 1
                                ? "category"
                                : "categories"}{" "}
                            selected
                        </span>

                    </div>

                </section>


                {/* PROFESSIONAL INFORMATION */}

                <section className="provider-profile-card">

                    <div className="provider-profile-section-heading">

                        <div className="provider-profile-section-icon">
                            <Wrench size={19} />
                        </div>

                        <div>
                            <h2>Professional Information</h2>

                            <p>
                                Configure your experience and
                                service coverage.
                            </p>
                        </div>

                    </div>


                    <div className="provider-profile-form-grid">

                        <div className="provider-profile-field">

                            <label htmlFor="experienceYears">
                                Experience
                            </label>

                            <div className="provider-profile-input-with-suffix">

                                <input
                                    id="experienceYears"
                                    name="experienceYears"
                                    type="number"
                                    min="0"
                                    value={form.experienceYears}
                                    onChange={handleChange}
                                    placeholder="0"
                                />

                                <span>years</span>

                            </div>

                        </div>


                        <div className="provider-profile-field">

                            <label htmlFor="serviceRadiusKm">
                                Service Radius
                            </label>

                            <div className="provider-profile-input-with-suffix">

                                <input
                                    id="serviceRadiusKm"
                                    name="serviceRadiusKm"
                                    type="number"
                                    min="0"
                                    value={form.serviceRadiusKm}
                                    onChange={handleChange}
                                    placeholder="0"
                                />

                                <span>km</span>

                            </div>

                        </div>

                    </div>

                </section>


                {/* LOCATION */}

                <section className="provider-profile-card">

                    <div className="provider-profile-section-heading">

                        <div className="provider-profile-section-icon">
                            <MapPin size={19} />
                        </div>

                        <div>
                            <h2>Business Location</h2>

                            <p>
                                Where your service business
                                operates from.
                            </p>
                        </div>

                    </div>


                    <div className="provider-profile-form-grid">

                        <div className="provider-profile-field provider-profile-field-full">

                            <label htmlFor="address">
                                Address
                            </label>

                            <input
                                id="address"
                                name="address"
                                type="text"
                                value={form.address}
                                onChange={handleChange}
                                placeholder="Business address"
                            />

                        </div>


                        {[
                            ["city", "City"],
                            ["state", "State"],
                            ["country", "Country"],
                            ["pincode", "Pincode"],
                        ].map(([name, label]) => (

                            <div
                                className="provider-profile-field"
                                key={name}
                            >

                                <label htmlFor={name}>
                                    {label}
                                </label>

                                <input
                                    id={name}
                                    name={name}
                                    type="text"
                                    value={form[name]}
                                    onChange={handleChange}
                                    placeholder={label}
                                />

                            </div>

                        ))}


                        <div className="provider-location-capture">

                            <div className="provider-location-capture-content">

                                <div className="provider-location-capture-icon">
                                    <MapPin size={18} />
                                </div>

                                <div>

                                    <strong>
                                        Service Location
                                    </strong>

                                    <p>
                                        Use your current location
                                        to help LifeOS find nearby
                                        customer requests.
                                    </p>

                                    {hasSavedLocation && (

                                        <span className="provider-location-saved">
                                            <CheckCircle2 size={14} />
                                            Location saved
                                        </span>
                                    )}

                                    {locationMessage && (

                                        <span className="provider-location-message">
                                            {locationMessage}
                                        </span>
                                    )}

                                </div>

                            </div>


                            <button
                                type="button"
                                className="provider-location-button"
                                onClick={
                                    handleUseCurrentLocation
                                }
                                disabled={locationSaving}
                            >

                                <MapPin size={16} />

                                {locationSaving
                                    ? "Getting location..."
                                    : "Use current location"}

                            </button>

                        </div>

                    </div>

                </section>


                {/* STATUS + AVAILABILITY */}

                <section className="provider-profile-card">

                    <div className="provider-profile-section-heading">

                        <div className="provider-profile-section-icon">
                            <ShieldCheck size={19} />
                        </div>

                        <div>
                            <h2>Provider Status</h2>

                            <p>
                                Manage your current provider
                                availability and account status.
                            </p>
                        </div>

                    </div>


                    <div className="provider-profile-status-grid">

                        <div className="provider-profile-status-item">

                            <span>Verification</span>

                            <strong className="provider-profile-verification">
                                <ShieldCheck size={16} />

                                {provider?.verificationStatus ||
                                    "PENDING"}
                            </strong>

                        </div>


                        <div className="provider-profile-status-item">

                            <span>Account</span>

                            <strong
                                className={
                                    provider?.isActive
                                        ? "provider-profile-active"
                                        : "provider-profile-inactive"
                                }
                            >

                                <span className="provider-profile-status-dot" />

                                {provider?.isActive
                                    ? "Active"
                                    : "Inactive"}

                            </strong>

                        </div>


                        <div className="provider-profile-status-item provider-profile-availability-item">

                            <div>

                                <span>
                                    Availability
                                </span>

                                <strong
                                    className={`provider-profile-availability-value provider-profile-availability-${(
                                        provider?.availability ||
                                        "UNAVAILABLE"
                                    ).toLowerCase()}`}
                                >
                                    <span className="provider-profile-status-dot" />

                                    {provider?.availability ||
                                        "UNAVAILABLE"}
                                </strong>

                            </div>


                            <select
                                value={
                                    provider?.availability ||
                                    "UNAVAILABLE"
                                }
                                onChange={
                                    handleAvailabilityChange
                                }
                                disabled={
                                    availabilitySaving
                                }
                            >

                                {AVAILABILITY_OPTIONS.map(
                                    (option) => (

                                        <option
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </option>

                                    )
                                )}

                            </select>

                        </div>

                    </div>

                </section>


                {/* SAVE */}

                <div className="provider-profile-actions">

                    <div className="provider-profile-save-info">

                        <span>
                            {supportedCategories.length}{" "}
                            {supportedCategories.length === 1
                                ? "category"
                                : "categories"}{" "}
                            configured
                        </span>

                    </div>


                    <button
                        type="submit"
                        className="provider-profile-save-button"
                        disabled={saving}
                    >

                        <Save size={17} />

                        {saving
                            ? "Saving changes..."
                            : "Save Changes"}

                    </button>

                </div>

            </form>

        </div>
    );
};


export default ProviderProfile;
import {
    Bell,
    Check,
    RefreshCw,
    Save,
    Settings,
    Zap,
} from "lucide-react";

import {
    useEffect,
    useState,
} from "react";

import {
    getMyProvider,
    updateProviderSettings,
} from "../../services/serviceProviderService";

import "../../styles/provider/providerSettings.css";


const DEFAULT_SETTINGS = {
    notifications: {
        serviceRequests: true,
        appointmentReminders: true,
        serviceUpdates: true,
    },

    requestPreferences: {
        autoAcceptRequests: false,
    },
};


const NOTIFICATION_OPTIONS = [
    {
        key: "serviceRequests",
        title: "Service requests",
        description:
            "Get notified when customers send new service requests.",
    },
    {
        key: "appointmentReminders",
        title: "Appointment reminders",
        description:
            "Receive reminders about upcoming service appointments.",
    },
    {
        key: "serviceUpdates",
        title: "Service updates",
        description:
            "Stay informed about important service status changes.",
    },
];


const ProviderSettings = () => {

    const [
        settings,
        setSettings,
    ] = useState(DEFAULT_SETTINGS);


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


    const loadSettings = async () => {

        try {

            setLoading(true);
            setError("");

            const response =
                await getMyProvider();

            const provider =
                response?.data?.data ||
                response?.data?.provider ||
                response?.data;

            const providerSettings =
                provider?.settings || {};


            setSettings({
                notifications: {
                    ...DEFAULT_SETTINGS.notifications,
                    ...providerSettings.notifications,
                },

                requestPreferences: {
                    ...DEFAULT_SETTINGS.requestPreferences,
                    ...providerSettings.requestPreferences,
                },
            });

        } catch (requestError) {

            console.error(
                "Failed to load provider settings:",
                requestError
            );

            setError(
                requestError
                    ?.response
                    ?.data
                    ?.message ||
                "Unable to load your settings."
            );

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {

        loadSettings();

    }, []);


    const clearMessages = () => {

        setError("");
        setSuccess("");

    };


    const handleNotificationChange =
        (field) => {

            clearMessages();

            setSettings(
                (current) => ({
                    ...current,

                    notifications: {
                        ...current.notifications,

                        [field]:
                            !current.notifications[field],
                    },
                })
            );
        };


    const handleAutoAcceptChange = () => {

        clearMessages();

        setSettings(
            (current) => ({
                ...current,

                requestPreferences: {
                    ...current.requestPreferences,

                    autoAcceptRequests:
                        !current
                            .requestPreferences
                            .autoAcceptRequests,
                },
            })
        );
    };


    const handleSave = async () => {

        try {

            setSaving(true);
            setError("");
            setSuccess("");

            await updateProviderSettings(
                settings
            );

            setSuccess(
                "Settings updated successfully."
            );

        } catch (requestError) {

            console.error(
                "Failed to update provider settings:",
                requestError
            );

            setError(
                requestError
                    ?.response
                    ?.data
                    ?.message ||
                "Unable to update your settings."
            );

        } finally {

            setSaving(false);

        }
    };


    if (loading) {

        return (
            <div className="provider-settings-page">

                <div className="provider-settings-state">

                    <RefreshCw
                        size={26}
                        className="provider-settings-spin"
                    />

                    <h2>
                        Loading settings
                    </h2>

                    <p>
                        Retrieving your provider preferences.
                    </p>

                </div>

            </div>
        );
    }


    return (

        <div className="provider-settings-page">

            {/* HEADER */}

            <header className="provider-settings-header">

                <div className="provider-settings-title-icon">
                    <Settings size={22} />
                </div>

                <div>

                    <span className="provider-settings-eyebrow">
                        Provider Workspace
                    </span>

                    <h1>
                        Settings
                    </h1>

                    <p>
                        Manage notifications and automate
                        how you handle customer requests.
                    </p>

                </div>

            </header>


            {/* MESSAGES */}

            {error && (

                <div
                    className="provider-settings-message provider-settings-message-error"
                    role="alert"
                >
                    {error}
                </div>

            )}


            {success && (

                <div
                    className="provider-settings-message provider-settings-message-success"
                    role="status"
                >

                    <Check size={17} />

                    <span>
                        {success}
                    </span>

                </div>

            )}


            {/* NOTIFICATIONS */}

            <section className="provider-settings-card">

                <div className="provider-settings-section-header">

                    <div className="provider-settings-section-icon">
                        <Bell size={19} />
                    </div>

                    <div>

                        <h2>
                            Notifications
                        </h2>

                        <p>
                            Choose which events you want
                            LifeOS to notify you about.
                        </p>

                    </div>

                </div>


                <div className="provider-settings-list">

                    {NOTIFICATION_OPTIONS.map(
                        (option) => {

                            const enabled =
                                settings
                                    .notifications
                                [option.key];


                            return (

                                <div
                                    key={option.key}
                                    className={`provider-settings-row ${enabled
                                            ? "provider-settings-row-enabled"
                                            : ""
                                        }`}
                                >

                                    <div className="provider-settings-row-content">

                                        <strong>
                                            {option.title}
                                        </strong>

                                        <span>
                                            {option.description}
                                        </span>

                                    </div>


                                    <button
                                        type="button"
                                        role="switch"
                                        aria-checked={enabled}
                                        aria-label={`Toggle ${option.title}`}
                                        className={`provider-settings-toggle ${enabled
                                                ? "provider-settings-toggle-on"
                                                : ""
                                            }`}
                                        onClick={() =>
                                            handleNotificationChange(
                                                option.key
                                            )
                                        }
                                    >

                                        <span />

                                    </button>

                                </div>

                            );
                        }
                    )}

                </div>

            </section>


            {/* REQUEST PREFERENCES */}

            <section className="provider-settings-card">

                <div className="provider-settings-section-header">

                    <div className="provider-settings-section-icon provider-settings-section-icon-automation">
                        <Zap size={19} />
                    </div>

                    <div>

                        <h2>
                            Request Preferences
                        </h2>

                        <p>
                            Control how LifeOS handles
                            incoming customer requests.
                        </p>

                    </div>

                </div>


                <div className="provider-settings-list">

                    <div
                        className={`provider-settings-row ${settings
                                .requestPreferences
                                .autoAcceptRequests
                                ? "provider-settings-row-enabled"
                                : ""
                            }`}
                    >

                        <div className="provider-settings-row-content">

                            <strong>
                                Automatically accept requests
                            </strong>

                            <span>
                                Automatically accept eligible
                                customer requests without
                                manual approval.
                            </span>

                        </div>


                        <button
                            type="button"
                            role="switch"
                            aria-checked={
                                settings
                                    .requestPreferences
                                    .autoAcceptRequests
                            }
                            aria-label="Toggle automatic request acceptance"
                            className={`provider-settings-toggle ${settings
                                    .requestPreferences
                                    .autoAcceptRequests
                                    ? "provider-settings-toggle-on"
                                    : ""
                                }`}
                            onClick={
                                handleAutoAcceptChange
                            }
                        >

                            <span />

                        </button>

                    </div>

                </div>

            </section>


            {/* SAVE AREA */}

            <div className="provider-settings-actions">

                <div className="provider-settings-save-info">

                    <span className="provider-settings-save-dot" />

                    <span>
                        Changes are saved when you click Save.
                    </span>

                </div>


                <button
                    type="button"
                    className="provider-settings-save-button"
                    disabled={saving}
                    onClick={handleSave}
                >

                    {saving ? (

                        <>
                            <RefreshCw
                                size={16}
                                className="provider-settings-spin"
                            />

                            Saving...
                        </>

                    ) : (

                        <>
                            <Save size={16} />

                            Save Settings
                        </>

                    )}

                </button>

            </div>

        </div>
    );
};


export default ProviderSettings;
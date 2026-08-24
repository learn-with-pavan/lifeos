import {
    Bell,
    Check,
    RefreshCw,
    Save,
    Settings,
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


const ProviderSettings = () => {

    const [
        settings,
        setSettings,
    ] = useState(
        DEFAULT_SETTINGS
    );

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


    const loadSettings =
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


    const handleNotificationChange =
        (field) => {

            setSuccess("");
            setError("");

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


    const handleAutoAcceptChange =
        () => {

            setSuccess("");
            setError("");

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


    const handleSave =
        async () => {

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
                        We're retrieving your
                        provider preferences.
                    </p>

                </div>

            </div>
        );
    }


    return (

        <div className="provider-settings-page">

            <div className="provider-settings-header">

                <div className="provider-settings-title">

                    <div className="provider-settings-title-icon">

                        <Settings
                            size={23}
                        />

                    </div>

                    <div>

                        <h1>
                            Settings
                        </h1>

                        <p>
                            Configure your provider
                            account preferences.
                        </p>

                    </div>

                </div>

            </div>


            {error && (

                <div className="provider-settings-message provider-settings-error">

                    {error}

                </div>

            )}


            {success && (

                <div className="provider-settings-message provider-settings-success">

                    <Check size={17} />

                    {success}

                </div>

            )}


            <section className="provider-settings-card">

                <div className="provider-settings-card-heading">

                    <div className="provider-settings-card-icon">

                        <Bell size={19} />

                    </div>

                    <div>

                        <h2>
                            Notifications
                        </h2>

                        <p>
                            Choose which provider
                            events you want to receive.
                        </p>

                    </div>

                </div>


                <div className="provider-settings-options">

                    <label className="provider-settings-option">

                        <div>

                            <strong>
                                Service requests
                            </strong>

                            <span>
                                Notify me when customers
                                send new service requests.
                            </span>

                        </div>

                        <input
                            type="checkbox"
                            checked={
                                settings
                                    .notifications
                                    .serviceRequests
                            }
                            onChange={() =>
                                handleNotificationChange(
                                    "serviceRequests"
                                )
                            }
                        />

                    </label>


                    <label className="provider-settings-option">

                        <div>

                            <strong>
                                Appointment reminders
                            </strong>

                            <span>
                                Notify me about upcoming
                                service appointments.
                            </span>

                        </div>

                        <input
                            type="checkbox"
                            checked={
                                settings
                                    .notifications
                                    .appointmentReminders
                            }
                            onChange={() =>
                                handleNotificationChange(
                                    "appointmentReminders"
                                )
                            }
                        />

                    </label>


                    <label className="provider-settings-option">

                        <div>

                            <strong>
                                Service updates
                            </strong>

                            <span>
                                Notify me about important
                                service status changes.
                            </span>

                        </div>

                        <input
                            type="checkbox"
                            checked={
                                settings
                                    .notifications
                                    .serviceUpdates
                            }
                            onChange={() =>
                                handleNotificationChange(
                                    "serviceUpdates"
                                )
                            }
                        />

                    </label>

                </div>

            </section>


            <section className="provider-settings-card">

                <div className="provider-settings-card-heading">

                    <div className="provider-settings-card-icon">

                        <Settings size={19} />

                    </div>

                    <div>

                        <h2>
                            Request Preferences
                        </h2>

                        <p>
                            Control how incoming
                            requests are handled.
                        </p>

                    </div>

                </div>


                <label className="provider-settings-option">

                    <div>

                        <strong>
                            Automatically accept requests
                        </strong>

                        <span>
                            Automatically accept eligible
                            customer requests.
                        </span>

                    </div>

                    <input
                        type="checkbox"
                        checked={
                            settings
                                .requestPreferences
                                .autoAcceptRequests
                        }
                        onChange={
                            handleAutoAcceptChange
                        }
                    />

                </label>

            </section>


            <div className="provider-settings-footer">

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
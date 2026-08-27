import React, { useEffect, useState } from "react";
import {
    ArrowLeft,
    Home as HomeIcon,
    Pencil,
    Trash2,
    Package,
    Wrench,
    FileText,
    Bell,
    History,
    X,
    MapPin,
} from "lucide-react";

import { useNavigate, useParams } from "react-router-dom";

import {
    getHomeDetails,
    updateHome,
    deleteHome,
} from "../services/homeService";

import { useToast } from "../context/ToastContext";
import LoadingState from "../components/LoadingState";

import "../styles/homeDetails.css";

const EMPTY_ADDRESS = {
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
};

const EMPTY_FORM = {
    name: "",
    type: "HOUSE",
    address: EMPTY_ADDRESS,
    description: "",
    purchaseDate: "",
};

const HomeDetails = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const toast = useToast();

    const [home, setHome] = useState(null);
    const [assets, setAssets] = useState([]);
    const [maintenance, setMaintenance] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [serviceHistory, setServiceHistory] = useState([]);
    const [reminders, setReminders] = useState([]);

    const [summary, setSummary] = useState({
        assets: 0,
        maintenance: 0,
        documents: 0,
        serviceHistory: 0,
        reminders: 0,
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showEditForm, setShowEditForm] = useState(false);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState(EMPTY_FORM);

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);

    /* ---------------------------------
       FETCH HOME DETAILS
    --------------------------------- */

    useEffect(() => {
        fetchHomeDetails();
    }, [id]);

    const fetchHomeDetails = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getHomeDetails(id);

            setHome(data.home);
            setAssets(data.assets || []);
            setMaintenance(data.maintenance || []);
            setDocuments(data.documents || []);
            setServiceHistory(data.serviceHistory || []);
            setReminders(data.reminders || []);

            setSummary(
                data.summary || {
                    assets: 0,
                    maintenance: 0,
                    documents: 0,
                    serviceHistory: 0,
                    reminders: 0,
                }
            );
        } catch (err) {
            console.error("Failed to load home details:", err);

            setError(
                err.response?.data?.message ||
                "Unable to load home details."
            );
        } finally {
            setLoading(false);
        }
    };

    /* ---------------------------------
       HELPERS
    --------------------------------- */

    const formatType = (type) => {
        const types = {
            HOUSE: "House",
            APARTMENT: "Apartment",
            VILLA: "Villa",
            OTHER: "Other",
        };

        return types[type] || type || "Not provided";
    };

    const formatDate = (date) => {
        if (!date) return "Not provided";

        return new Date(date).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    const formatAddress = (address) => {
        if (!address) return "Not provided";

        if (typeof address === "string") {
            return address;
        }

        return [
            address.line1,
            address.line2,
            address.city,
            address.state,
            address.pincode,
        ]
            .filter(Boolean)
            .join(", ") || "Not provided";
    };

    const updateAddress = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            address: {
                ...prev.address,
                [field]: value,
            },
        }));
    };

    /* ---------------------------------
       EDIT HOME
    --------------------------------- */

    const handleEdit = () => {
        if (!home) return;

        setFormData({
            name: home.name || "",
            type: home.type || "HOUSE",

            address:
                typeof home.address === "object" && home.address
                    ? {
                        line1: home.address.line1 || "",
                        line2: home.address.line2 || "",
                        city: home.address.city || "",
                        state: home.address.state || "",
                        pincode: home.address.pincode || "",
                    }
                    : {
                        ...EMPTY_ADDRESS,
                        line1: home.address || "",
                    },

            description: home.description || "",
            purchaseDate: home.purchaseDate
                ? home.purchaseDate.split("T")[0]
                : "",
        });

        setShowEditForm(true);
    };

    const closeEditForm = () => {
        setShowEditForm(false);
        setFormData(EMPTY_FORM);
    };

    const handleUpdate = async (event) => {
        event.preventDefault();

        try {
            setSaving(true);
            setError("");

            const response = await updateHome(home._id, {
                ...formData,
                purchaseDate: formData.purchaseDate || null,
            });

            setHome(response.home);

            toast.success("Home updated successfully");
            closeEditForm();
        } catch (err) {
            console.error("Failed to update home:", err);

            const message =
                err.response?.data?.message ||
                "Unable to update home.";

            setError(message);
            toast.error(message);
        } finally {
            setSaving(false);
        }
    };

    /* ---------------------------------
       DELETE HOME
    --------------------------------- */

    const handleDelete = async () => {
        if (!home) return;

        try {
            setDeleting(true);
            setError("");

            await deleteHome(home._id);

            toast.success("Home deleted successfully");

            navigate("/homes");
        } catch (err) {
            console.error("Failed to delete home:", err);

            const message =
                err.response?.data?.message ||
                "Unable to delete home.";

            setError(message);
            toast.error(message);

            setShowDeleteConfirm(false);
        } finally {
            setDeleting(false);
        }
    };

    /* ---------------------------------
       LOADING
    --------------------------------- */

    if (loading) {
        return (
            <div className="home-details-page">
                <LoadingState
                    title="Loading home"
                    message="Getting your home information and related assets."
                />
            </div>
        );
    }

    /* ---------------------------------
       ERROR
    --------------------------------- */

    if (error || !home) {
        return (
            <div className="home-details-page">
                <button
                    className="back-button"
                    onClick={() => navigate("/homes")}
                >
                    <ArrowLeft size={18} />
                    Back to homes
                </button>

                <div className="home-details-error">
                    <div className="home-error-icon">
                        <HomeIcon size={26} />
                    </div>

                    <h2>Home not found</h2>

                    <p>
                        {error || "We couldn't find this home."}
                    </p>

                    <button
                        className="primary-button"
                        onClick={() => navigate("/homes")}
                    >
                        Back to homes
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="home-details-page">

            {error && (
                <div className="home-details-error-message">
                    {error}
                </div>
            )}

            {/* BACK */}

            <button
                className="back-button"
                onClick={() => navigate("/homes")}
            >
                <ArrowLeft size={18} />
                Back to homes
            </button>

            {/* HEADER */}

            <div className="home-details-header">
                <div className="home-details-title">
                    <div className="home-details-icon">
                        <HomeIcon size={28} />
                    </div>

                    <div>
                        <span className="home-details-label">
                            HOME
                        </span>

                        <h1>{home.name}</h1>

                        {home.description && (
                            <p>{home.description}</p>
                        )}
                    </div>
                </div>

                <div className="home-header-actions">
                    <button
                        className="icon-button secondary-icon-button"
                        onClick={handleEdit}
                        title="Edit home"
                        aria-label="Edit home"
                    >
                        <Pencil size={18} />
                    </button>

                    <button
                        className="icon-button danger-icon-button"
                        onClick={() => setShowDeleteConfirm(true)}
                        title="Delete home"
                        aria-label="Delete home"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>

            {/* SUMMARY */}

            <div className="home-summary-grid">

                <SummaryCard
                    icon={<Package size={20} />}
                    value={summary.assets}
                    label="Assets"
                />

                <SummaryCard
                    icon={<Wrench size={20} />}
                    value={summary.maintenance}
                    label="Maintenance"
                />

                <SummaryCard
                    icon={<FileText size={20} />}
                    value={summary.documents}
                    label="Documents"
                />

                <SummaryCard
                    icon={<History size={20} />}
                    value={summary.serviceHistory}
                    label="Service history"
                />

                <SummaryCard
                    icon={<Bell size={20} />}
                    value={summary.reminders}
                    label="Reminders"
                />

            </div>

            {/* HOME INFORMATION */}

            <div className="home-info-card">

                <div className="home-section-header">
                    <div>
                        <h2>Home information</h2>
                        <p>Details about this home.</p>
                    </div>

                    <button
                        className="section-edit-button"
                        onClick={handleEdit}
                        type="button"
                    >
                        <Pencil size={15} />
                        Edit
                    </button>
                </div>

                <div className="home-info-grid">

                    <InfoItem
                        label="Home name"
                        value={home.name}
                    />

                    <InfoItem
                        label="Type"
                        value={formatType(home.type)}
                    />

                    <InfoItem
                        label="Address"
                        value={formatAddress(home.address)}
                        icon={<MapPin size={15} />}
                        className="home-info-address"
                    />

                    <InfoItem
                        label="Purchase date"
                        value={formatDate(home.purchaseDate)}
                    />

                </div>

                {home.notes && (
                    <div className="home-notes">
                        <span>Notes</span>
                        <p>{home.notes}</p>
                    </div>
                )}

            </div>

            {/* ASSETS */}

            <div className="home-section-card">

                <div className="home-section-header">
                    <div>
                        <h2>Assets</h2>
                        <p>Assets assigned to this home.</p>
                    </div>

                    <span className="section-count">
                        {assets.length}
                    </span>
                </div>

                {assets.length === 0 ? (
                    <EmptySection
                        icon={<Package size={24} />}
                        text="No assets are assigned to this home yet."
                    />
                ) : (
                    <div className="home-assets-list">
                        {assets.map((asset) => (
                            <div
                                className="home-asset-row"
                                key={asset._id}
                                onClick={() =>
                                    navigate(`/assets/${asset._id}`)
                                }
                            >
                                <div className="home-asset-icon">
                                    <Package size={19} />
                                </div>

                                <div className="home-asset-info">
                                    <strong>{asset.name}</strong>

                                    <span>
                                        {asset.category}

                                        {asset.brand
                                            ? ` · ${asset.brand}`
                                            : ""}

                                        {asset.model
                                            ? ` · ${asset.model}`
                                            : ""}
                                    </span>
                                </div>

                                <span className="home-asset-price">
                                    {asset.purchasePrice
                                        ? `₹${Number(
                                            asset.purchasePrice
                                        ).toLocaleString("en-IN")}`
                                        : "—"}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

            </div>

            {/* ACTIVITY */}

            <div className="home-activity-grid">

                <ActivitySection
                    title="Maintenance"
                    description="Upcoming maintenance."
                    icon={<Wrench size={19} />}
                    items={maintenance}
                    emptyText="No maintenance records."
                    renderTitle={(item) =>
                        item.asset?.name || "Asset"
                    }
                    renderDescription={(item) =>
                        item.title ||
                        item.description ||
                        "Maintenance"
                    }
                    renderDate={(item) => item.dueDate}
                />

                <ActivitySection
                    title="Reminders"
                    description="Pending reminders."
                    icon={<Bell size={19} />}
                    items={reminders}
                    emptyText="No pending reminders."
                    renderTitle={(item) =>
                        item.asset?.name || "Asset"
                    }
                    renderDescription={(item) =>
                        item.title || "Reminder"
                    }
                    renderDate={(item) => item.reminderDate}
                />

            </div>

            {/* DOCUMENTS */}

            <ActivitySection
                title="Documents"
                description="Recent documents related to assets in this home."
                icon={<FileText size={19} />}
                items={documents}
                emptyText="No documents available."
                renderTitle={(item) =>
                    item.name ||
                    item.fileName ||
                    "Document"
                }
                renderDescription={(item) =>
                    item.asset?.name || "Asset"
                }
                renderDate={(item) => item.createdAt}
            />

            {/* SERVICE HISTORY */}

            <ActivitySection
                title="Service history"
                description="Recent service activity."
                icon={<History size={19} />}
                items={serviceHistory}
                emptyText="No service history available."
                renderTitle={(item) =>
                    item.asset?.name || "Asset"
                }
                renderDescription={(item) =>
                    item.description ||
                    item.serviceType ||
                    "Service"
                }
                renderDate={(item) => item.serviceDate}
            />

            {/* EDIT MODAL */}

            {showEditForm && (
                <div
                    className="home-modal-overlay"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            closeEditForm();
                        }
                    }}
                >
                    <div
                        className="home-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="edit-home-title"
                    >
                        <div className="home-modal-header">
                            <div>
                                <span className="modal-eyebrow">
                                    HOME SETTINGS
                                </span>

                                <h2 id="edit-home-title">
                                    Edit home
                                </h2>

                                <p>
                                    Update your home information.
                                </p>
                            </div>

                            <button
                                className="home-modal-close"
                                onClick={closeEditForm}
                                type="button"
                                aria-label="Close"
                            >
                                <X size={19} />
                            </button>
                        </div>

                        <form
                            className="home-form"
                            onSubmit={handleUpdate}
                        >
                            <div className="home-form-body">

                                <div className="home-form-section">
                                    <div className="home-form-section-title">
                                        Basic information
                                    </div>

                                    <div className="home-form-row">
                                        <FormField
                                            label="Home name"
                                            required
                                        >
                                            <input
                                                type="text"
                                                required
                                                maxLength={100}
                                                placeholder="e.g. My Home"
                                                value={formData.name}
                                                onChange={(event) =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        name: event.target.value,
                                                    }))
                                                }
                                            />
                                        </FormField>

                                        <FormField label="Home type">
                                            <select
                                                value={formData.type}
                                                onChange={(event) =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        type: event.target.value,
                                                    }))
                                                }
                                            >
                                                <option value="HOUSE">
                                                    House
                                                </option>

                                                <option value="APARTMENT">
                                                    Apartment
                                                </option>

                                                <option value="VILLA">
                                                    Villa
                                                </option>

                                                <option value="OTHER">
                                                    Other
                                                </option>
                                            </select>
                                        </FormField>
                                    </div>

                                    <FormField label="Purchase date">
                                        <input
                                            type="date"
                                            value={formData.purchaseDate}
                                            onChange={(event) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    purchaseDate:
                                                        event.target.value,
                                                }))
                                            }
                                        />
                                    </FormField>
                                </div>

                                <div className="home-form-section">
                                    <div className="home-form-section-title">
                                        Address
                                    </div>

                                    <FormField label="Address line 1">
                                        <input
                                            type="text"
                                            placeholder="House / flat / street"
                                            value={formData.address.line1}
                                            onChange={(event) =>
                                                updateAddress(
                                                    "line1",
                                                    event.target.value
                                                )
                                            }
                                        />
                                    </FormField>

                                    <FormField label="Address line 2">
                                        <input
                                            type="text"
                                            placeholder="Area / landmark (optional)"
                                            value={formData.address.line2}
                                            onChange={(event) =>
                                                updateAddress(
                                                    "line2",
                                                    event.target.value
                                                )
                                            }
                                        />
                                    </FormField>

                                    <div className="home-form-row">
                                        <FormField label="City">
                                            <input
                                                type="text"
                                                placeholder="City"
                                                value={formData.address.city}
                                                onChange={(event) =>
                                                    updateAddress(
                                                        "city",
                                                        event.target.value
                                                    )
                                                }
                                            />
                                        </FormField>

                                        <FormField label="State">
                                            <input
                                                type="text"
                                                placeholder="State"
                                                value={formData.address.state}
                                                onChange={(event) =>
                                                    updateAddress(
                                                        "state",
                                                        event.target.value
                                                    )
                                                }
                                            />
                                        </FormField>
                                    </div>

                                    <FormField label="PIN code">
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={6}
                                            placeholder="e.g. 522001"
                                            value={formData.address.pincode}
                                            onChange={(event) =>
                                                updateAddress(
                                                    "pincode",
                                                    event.target.value.replace(
                                                        /\D/g,
                                                        ""
                                                    )
                                                )
                                            }
                                        />
                                    </FormField>
                                </div>

                                <div className="home-form-section">
                                    <div className="home-form-section-title">
                                        Additional information
                                    </div>

                                    <FormField label="Description">
                                        <textarea
                                            maxLength={500}
                                            placeholder="Add a short description about this home"
                                            value={formData.description}
                                            onChange={(event) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    description:
                                                        event.target.value,
                                                }))
                                            }
                                        />
                                    </FormField>
                                </div>

                            </div>

                            <div className="home-modal-actions">
                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={closeEditForm}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="primary-button"
                                    disabled={saving}
                                >
                                    {saving
                                        ? "Saving..."
                                        : "Save changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* DELETE MODAL */}

            {showDeleteConfirm && (
                <div
                    className="home-modal-overlay"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            if (!deleting) {
                                setShowDeleteConfirm(false);
                            }
                        }
                    }}
                >
                    <div
                        className="delete-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="delete-home-title"
                    >
                        <div className="delete-icon">
                            <Trash2 size={21} />
                        </div>

                        <h2 id="delete-home-title">
                            Delete home?
                        </h2>

                        <p>
                            You're about to delete{" "}
                            <strong>{home.name}</strong>.
                        </p>

                        <p className="delete-warning">
                            This action cannot be undone.
                        </p>

                        <div className="modal-actions">
                            <button
                                type="button"
                                className="secondary-button"
                                onClick={() =>
                                    setShowDeleteConfirm(false)
                                }
                                disabled={deleting}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="danger-button"
                                onClick={handleDelete}
                                disabled={deleting}
                            >
                                {deleting
                                    ? "Deleting..."
                                    : "Delete home"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

/* =========================================================
   REUSABLE COMPONENTS
========================================================= */

const SummaryCard = ({ icon, value, label }) => (
    <div className="home-summary-card">
        <div className="home-summary-icon">
            {icon}
        </div>

        <div>
            <strong>{value}</strong>
            <span>{label}</span>
        </div>
    </div>
);

const InfoItem = ({
    label,
    value,
    icon,
    className = "",
}) => (
    <div className={className}>
        <span>{label}</span>

        <strong className={icon ? "info-value-with-icon" : ""}>
            {icon}
            {value || "Not provided"}
        </strong>
    </div>
);

const FormField = ({
    label,
    required = false,
    children,
}) => (
    <div className="home-form-group">
        <label>
            {label}

            {required && (
                <span className="required-mark">*</span>
            )}
        </label>

        {children}
    </div>
);

const EmptySection = ({ icon, text }) => (
    <div className="section-empty">
        {icon}
        <p>{text}</p>
    </div>
);

const ActivitySection = ({
    title,
    description,
    icon,
    items,
    emptyText,
    renderTitle,
    renderDescription,
    renderDate,
}) => (
    <div className="home-section-card">
        <div className="home-section-header">
            <div>
                <h2>{title}</h2>
                <p>{description}</p>
            </div>

            {icon}
        </div>

        {items.length === 0 ? (
            <EmptySection text={emptyText} />
        ) : (
            <div className="activity-list">
                {items.map((item) => (
                    <div
                        className="activity-row"
                        key={item._id}
                    >
                        <div>
                            <strong>
                                {renderTitle(item)}
                            </strong>

                            <span>
                                {renderDescription(item)}
                            </span>
                        </div>

                        {renderDate(item) && (
                            <time>
                                {new Date(
                                    renderDate(item)
                                ).toLocaleDateString("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                })}
                            </time>
                        )}
                    </div>
                ))}
            </div>
        )}
    </div>
);

export default HomeDetails;
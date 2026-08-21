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
    MapPin,
    X,
} from "lucide-react";

import { useNavigate, useParams } from "react-router-dom";

import {
    getHomeDetails,
    updateHome,
    deleteHome,
} from "../services/homeService";
import { useToast } from "../context/ToastContext";

import "../styles/homeDetails.css";

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

    /* ---------------------------------
       EDIT HOME STATE
    --------------------------------- */

    const [showEditForm, setShowEditForm] =
        useState(false);

    const [saving, setSaving] =
        useState(false);

    const [formData, setFormData] = useState({
        name: "",
        type: "HOUSE",
        address: "",
        description: "",
        purchaseDate: "",
    });

    /* ---------------------------------
       DELETE HOME STATE
    --------------------------------- */

    const [showDeleteConfirm, setShowDeleteConfirm] =
        useState(false);

    const [deleting, setDeleting] =
        useState(false);

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
            console.error(
                "Failed to load home details:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Unable to load home details."
            );
        } finally {
            setLoading(false);
        }
    };

    /* ---------------------------------
       EDIT HOME
    --------------------------------- */

    const handleEdit = () => {
        if (!home) return;

        setFormData({
            name: home.name || "",
            type: home.type || "HOUSE",
            address: home.address || "",
            description: home.description || "",
            purchaseDate: home.purchaseDate
                ? home.purchaseDate.split("T")[0]
                : "",
        });

        setShowEditForm(true);
    };

    const closeEditForm = () => {
        setShowEditForm(false);

        setFormData({
            name: "",
            type: "HOUSE",
            address: "",
            description: "",
            purchaseDate: "",
        });
    };

    const handleUpdate = async (event) => {
        event.preventDefault();

        try {
            setSaving(true);
            setError("");

            const response = await updateHome(
                home._id,
                {
                    ...formData,
                    purchaseDate:
                        formData.purchaseDate || null,
                }
            );

            /*
             * Update the home displayed on this page
             * without navigating anywhere.
             */
            setHome(response.home);

            toast.success("Home updated successfully");
            closeEditForm();
        } catch (err) {
            console.error(
                "Failed to update home:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Unable to update home."
            );
            toast.error(err.response?.data?.message || "Unable to update home.");
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

            /*
             * After deleting the home,
             * return to Home Management.
             */
            navigate("/homes");
        } catch (err) {
            console.error(
                "Failed to delete home:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Unable to delete home."
            );
            toast.error(err.response?.data?.message || "Unable to delete home.");

            setShowDeleteConfirm(false);
        } finally {
            setDeleting(false);
        }
    };

    /* ---------------------------------
       FORMATTERS
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
        if (!date) {
            return "Not provided";
        }

        return new Date(date).toLocaleDateString(
            "en-IN",
            {
                day: "numeric",
                month: "short",
                year: "numeric",
            }
        );
    };

    /* ---------------------------------
       LOADING
    --------------------------------- */

    if (loading) {
        return (
            <div className="home-details-page">

                <div className="home-details-loading">

                    <div className="home-loading-icon">
                        <HomeIcon size={26} />
                    </div>

                    <h2>
                        Loading home...
                    </h2>

                    <p>
                        Getting your home information
                        and related assets.
                    </p>

                </div>

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
                    onClick={() =>
                        navigate("/homes")
                    }
                >
                    <ArrowLeft size={18} />
                    Back to homes
                </button>

                <div className="home-details-error">

                    <div className="home-error-icon">
                        <HomeIcon size={26} />
                    </div>

                    <h2>
                        Home not found
                    </h2>

                    <p>
                        {error ||
                            "We couldn't find this home."}
                    </p>

                    <button
                        className="primary-button"
                        onClick={() =>
                            navigate("/homes")
                        }
                    >
                        Back to homes
                    </button>

                </div>

            </div>
        );
    }

    /* ---------------------------------
       PAGE
    --------------------------------- */

    return (
        <div className="home-details-page">

            {/* ERROR MESSAGE */}

            {error && (
                <div className="home-details-error-message">
                    {error}
                </div>
            )}

            {/* BACK */}

            <button
                className="back-button"
                onClick={() =>
                    navigate("/homes")
                }
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

                        <h1>
                            {home.name}
                        </h1>

                        {home.description && (
                            <p>
                                {home.description}
                            </p>
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
                        onClick={() =>
                            setShowDeleteConfirm(true)
                        }
                        title="Delete home"
                        aria-label="Delete home"
                    >
                        <Trash2 size={18} />
                    </button>

                </div>

            </div>

            {/* SUMMARY */}

            <div className="home-summary-grid">

                <div className="home-summary-card">

                    <div className="home-summary-icon">
                        <Package size={20} />
                    </div>

                    <div>
                        <strong>
                            {summary.assets}
                        </strong>

                        <span>
                            Assets
                        </span>
                    </div>

                </div>

                <div className="home-summary-card">

                    <div className="home-summary-icon">
                        <Wrench size={20} />
                    </div>

                    <div>
                        <strong>
                            {summary.maintenance}
                        </strong>

                        <span>
                            Maintenance
                        </span>
                    </div>

                </div>

                <div className="home-summary-card">

                    <div className="home-summary-icon">
                        <FileText size={20} />
                    </div>

                    <div>
                        <strong>
                            {summary.documents}
                        </strong>

                        <span>
                            Documents
                        </span>
                    </div>

                </div>

                <div className="home-summary-card">

                    <div className="home-summary-icon">
                        <History size={20} />
                    </div>

                    <div>
                        <strong>
                            {summary.serviceHistory}
                        </strong>

                        <span>
                            Service history
                        </span>
                    </div>

                </div>

                <div className="home-summary-card">

                    <div className="home-summary-icon">
                        <Bell size={20} />
                    </div>

                    <div>
                        <strong>
                            {summary.reminders}
                        </strong>

                        <span>
                            Reminders
                        </span>
                    </div>

                </div>

            </div>

            {/* HOME INFORMATION */}

            <div className="home-info-card">

                <div className="home-section-header">

                    <div>
                        <h2>
                            Home information
                        </h2>

                        <p>
                            Details about this home.
                        </p>
                    </div>

                </div>

                <div className="home-info-grid">

                    <div>
                        <span>
                            Home name
                        </span>

                        <strong>
                            {home.name ||
                                "Not provided"}
                        </strong>
                    </div>

                    <div>
                        <span>
                            Type
                        </span>

                        <strong>
                            {formatType(home.type)}
                        </strong>
                    </div>

                    <div>
                        <span>
                            Address
                        </span>

                        <strong>
                            {home.address ||
                                "Not provided"}
                        </strong>
                    </div>

                    <div>
                        <span>
                            Purchase date
                        </span>

                        <strong>
                            {formatDate(
                                home.purchaseDate
                            )}
                        </strong>
                    </div>

                </div>

                {home.notes && (
                    <div className="home-notes">

                        <span>
                            Notes
                        </span>

                        <p>
                            {home.notes}
                        </p>

                    </div>
                )}

            </div>

            {/* ASSETS */}

            <div className="home-section-card">

                <div className="home-section-header">

                    <div>
                        <h2>
                            Assets
                        </h2>

                        <p>
                            Assets assigned to this home.
                        </p>
                    </div>

                    <span className="section-count">
                        {assets.length}
                    </span>

                </div>

                {assets.length === 0 ? (

                    <div className="section-empty">

                        <Package size={24} />

                        <p>
                            No assets are assigned
                            to this home yet.
                        </p>

                    </div>

                ) : (

                    <div className="home-assets-list">

                        {assets.map((asset) => (

                            <div
                                className="home-asset-row"
                                key={asset._id}
                                onClick={() =>
                                    navigate(
                                        `/assets/${asset._id}`
                                    )
                                }
                            >

                                <div className="home-asset-icon">
                                    <Package size={19} />
                                </div>

                                <div className="home-asset-info">

                                    <strong>
                                        {asset.name}
                                    </strong>

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
                                        ).toLocaleString()}`
                                        : "—"}

                                </span>

                            </div>

                        ))}

                    </div>

                )}

            </div>

            {/* ACTIVITY GRID */}

            <div className="home-activity-grid">

                {/* MAINTENANCE */}

                <div className="home-section-card">

                    <div className="home-section-header">

                        <div>
                            <h2>
                                Maintenance
                            </h2>

                            <p>
                                Upcoming maintenance.
                            </p>
                        </div>

                        <Wrench size={19} />

                    </div>

                    {maintenance.length === 0 ? (

                        <div className="section-empty">

                            <p>
                                No maintenance records.
                            </p>

                        </div>

                    ) : (

                        <div className="activity-list">

                            {maintenance.map((item) => (

                                <div
                                    className="activity-row"
                                    key={item._id}
                                >

                                    <div>

                                        <strong>
                                            {item.asset?.name ||
                                                "Asset"}
                                        </strong>

                                        <span>
                                            {item.title ||
                                                item.description ||
                                                "Maintenance"}
                                        </span>

                                    </div>

                                    {item.dueDate && (
                                        <time>
                                            {formatDate(
                                                item.dueDate
                                            )}
                                        </time>
                                    )}

                                </div>

                            ))}

                        </div>

                    )}

                </div>

                {/* REMINDERS */}

                <div className="home-section-card">

                    <div className="home-section-header">

                        <div>
                            <h2>
                                Reminders
                            </h2>

                            <p>
                                Pending reminders.
                            </p>
                        </div>

                        <Bell size={19} />

                    </div>

                    {reminders.length === 0 ? (

                        <div className="section-empty">

                            <p>
                                No pending reminders.
                            </p>

                        </div>

                    ) : (

                        <div className="activity-list">

                            {reminders.map((item) => (

                                <div
                                    className="activity-row"
                                    key={item._id}
                                >

                                    <div>

                                        <strong>
                                            {item.asset?.name ||
                                                "Asset"}
                                        </strong>

                                        <span>
                                            {item.title ||
                                                "Reminder"}
                                        </span>

                                    </div>

                                    {item.reminderDate && (
                                        <time>
                                            {formatDate(
                                                item.reminderDate
                                            )}
                                        </time>
                                    )}

                                </div>

                            ))}

                        </div>

                    )}

                </div>

            </div>

            {/* DOCUMENTS */}

            <div className="home-section-card">

                <div className="home-section-header">

                    <div>
                        <h2>
                            Documents
                        </h2>

                        <p>
                            Recent documents related
                            to assets in this home.
                        </p>
                    </div>

                    <FileText size={19} />

                </div>

                {documents.length === 0 ? (

                    <div className="section-empty">

                        <p>
                            No documents available.
                        </p>

                    </div>

                ) : (

                    <div className="activity-list">

                        {documents.map((document) => (

                            <div
                                className="activity-row"
                                key={document._id}
                            >

                                <div>

                                    <strong>
                                        {document.name ||
                                            document.fileName ||
                                            "Document"}
                                    </strong>

                                    <span>
                                        {document.asset?.name ||
                                            "Asset"}
                                    </span>

                                </div>

                                {document.createdAt && (
                                    <time>
                                        {formatDate(
                                            document.createdAt
                                        )}
                                    </time>
                                )}

                            </div>

                        ))}

                    </div>

                )}

            </div>

            {/* SERVICE HISTORY */}

            <div className="home-section-card">

                <div className="home-section-header">

                    <div>
                        <h2>
                            Service history
                        </h2>

                        <p>
                            Recent service activity.
                        </p>
                    </div>

                    <History size={19} />

                </div>

                {serviceHistory.length === 0 ? (

                    <div className="section-empty">

                        <p>
                            No service history available.
                        </p>

                    </div>

                ) : (

                    <div className="activity-list">

                        {serviceHistory.map((service) => (

                            <div
                                className="activity-row"
                                key={service._id}
                            >

                                <div>

                                    <strong>
                                        {service.asset?.name ||
                                            "Asset"}
                                    </strong>

                                    <span>
                                        {service.description ||
                                            service.serviceType ||
                                            "Service"}
                                    </span>

                                </div>

                                {service.serviceDate && (
                                    <time>
                                        {formatDate(
                                            service.serviceDate
                                        )}
                                    </time>
                                )}

                            </div>

                        ))}

                    </div>

                )}

            </div>

            {/* ==========================================
                EDIT HOME MODAL
            ========================================== */}

            {showEditForm && (

                <div className="home-modal-overlay">

                    <div className="home-modal">

                        <div className="home-modal-header">

                            <div>

                                <h2>
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
                            >
                                <X size={20} />
                            </button>

                        </div>

                        <form
                            className="home-form"
                            onSubmit={handleUpdate}
                        >

                            <div className="home-form-body">

                                {/* HOME NAME */}

                                <div className="home-form-group">

                                    <label>
                                        Home name
                                    </label>

                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. My Home"
                                        value={formData.name}
                                        onChange={(event) =>
                                            setFormData({
                                                ...formData,
                                                name: event.target.value,
                                            })
                                        }
                                    />

                                </div>

                                {/* HOME TYPE */}

                                <div className="home-form-group">

                                    <label>
                                        Home type
                                    </label>

                                    <select
                                        value={formData.type}
                                        onChange={(event) =>
                                            setFormData({
                                                ...formData,
                                                type: event.target.value,
                                            })
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

                                </div>

                                {/* ADDRESS */}

                                <div className="home-form-group">

                                    <label>
                                        Address
                                    </label>

                                    <textarea
                                        placeholder="Enter home address"
                                        value={formData.address}
                                        onChange={(event) =>
                                            setFormData({
                                                ...formData,
                                                address:
                                                    event.target.value,
                                            })
                                        }
                                    />

                                </div>

                                {/* PURCHASE DATE */}

                                <div className="home-form-group">

                                    <label>
                                        Purchase date
                                    </label>

                                    <input
                                        type="date"
                                        value={
                                            formData.purchaseDate
                                        }
                                        onChange={(event) =>
                                            setFormData({
                                                ...formData,
                                                purchaseDate:
                                                    event.target.value,
                                            })
                                        }
                                    />

                                </div>

                                {/* DESCRIPTION */}

                                <div className="home-form-group">

                                    <label>
                                        Description
                                    </label>

                                    <textarea
                                        placeholder="Additional details about this home"
                                        value={
                                            formData.description
                                        }
                                        onChange={(event) =>
                                            setFormData({
                                                ...formData,
                                                description:
                                                    event.target.value,
                                            })
                                        }
                                    />

                                </div>

                            </div>

                            {/* ACTIONS */}

                            <div className="home-modal-actions">

                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={closeEditForm}
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

            {/* ==========================================
                DELETE HOME MODAL
            ========================================== */}

            {showDeleteConfirm && (

                <div className="home-modal-overlay">

                    <div className="delete-modal">

                        <div className="delete-icon">
                            ⚠
                        </div>

                        <h2>
                            Delete home?
                        </h2>

                        <p>
                            You're about to delete{" "}
                            <strong>
                                {home.name}
                            </strong>
                            .
                        </p>

                        <p className="delete-warning">
                            This will remove the home from
                            your home management.
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

export default HomeDetails;
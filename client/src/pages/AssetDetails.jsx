import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    Package,
    X,
    Pencil,
    Trash2,
    Wrench
} from "lucide-react";

import { createWarranty, createWarrantyReminder, deleteAsset, deleteWarrantyReminder, getAssetById, getWarrantyByAsset, getWarrantyReminder, updateAsset, updateWarranty, updateWarrantyReminder } from "../services/assetService";
import { getWarrantyStatus } from "../utils/warrantyUtils";
import DocumentSection from "../components/DocumentSection";
import { getHomes } from "../services/homeService";
import { useToast } from "../context/ToastContext";

function AssetDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const toast = useToast();

    const [asset, setAsset] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showEditForm, setShowEditForm] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        category: "",
        brand: "",
        model: "",
        purchaseDate: "",
        purchasePrice: "",
        home: "",
        notes: "",
    });
    const [saving, setSaving] = useState(false);

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);


    const [warranty, setWarranty] = useState(null);
    const [loadingWarranty, setLoadingWarranty] = useState(true);

    const [showWarrantyForm, setShowWarrantyForm] =
        useState(false);

    const [savingWarranty, setSavingWarranty] =
        useState(false);

    const [warrantyForm, setWarrantyForm] =
        useState({
            provider: "",
            warrantyType: "Manufacturer",
            startDate: "",
            endDate: "",
            notes: "",
        });


    const [showEditWarranty, setShowEditWarranty] = useState(false);
    const [showDeleteWarranty, setShowDeleteWarranty] = useState(false);
    const [deletingWarranty, setDeletingWarranty] = useState(false);


    const [showReminderForm, setShowReminderForm] = useState(false);
    const [remindBeforeDays, setRemindBeforeDays] = useState(30);
    const [savingReminder, setSavingReminder] = useState(false);
    const [reminder, setReminder] = useState(null);

    const [showEditReminder, setShowEditReminder] = useState(false);
    const [deletingReminder, setDeletingReminder] = useState(false);

    const [homes, setHomes] = useState([]);
    const [loadingHomes, setLoadingHomes] = useState(true);

    useEffect(() => {
        const loadHomes = async () => {
            try {
                const data = await getHomes();

                setHomes(data.homes || []);
            } catch (error) {
                console.error(
                    "Failed to load homes",
                    error
                );
            } finally {
                setLoadingHomes(false);
            }
        };

        loadHomes();
    }, []);

    useEffect(() => {
        const loadAsset = async () => {
            try {
                const data = await getAssetById(id);

                setAsset(data.asset);
            } catch (error) {
                setError(
                    error.response?.data?.message ||
                    "Failed to load asset"
                );
            } finally {
                setLoading(false);
            }
        };

        loadAsset();
    }, [id]);

    useEffect(() => {
        const loadWarranty = async () => {
            try {
                const data = await getWarrantyByAsset(id);

                setWarranty(data.warranty);
            } catch (error) {
                console.error(
                    "Failed to load warranty",
                    error
                );
            } finally {
                setLoadingWarranty(false);
            }
        };

        loadWarranty();
    }, [id]);

    useEffect(() => {
        const loadReminder = async () => {
            try {
                const data = await getWarrantyReminder(id);

                setReminder(data.reminder);
            } catch (error) {
                console.error(
                    "Failed to load reminder",
                    error
                );
            }
        };

        loadReminder();
    }, [id]);

    if (loading) {
        return (
            <div className="asset-details-page">
                <p>Loading asset...</p>
            </div>
        );
    }

    if (error || !asset) {
        return (
            <div className="asset-details-page">
                <button
                    className="back-button"
                    onClick={() => navigate("/assets")}
                >
                    <ArrowLeft size={18} />
                    Back to assets
                </button>

                <div className="details-error">
                    <h2>Asset not found</h2>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    const warrantyStatus = warranty ? getWarrantyStatus(warranty.endDate) : null;

    const handleEdit = () => {
        setFormData({
            name: asset.name || "",
            category: asset.category || "",
            brand: asset.brand || "",
            model: asset.model || "",

            purchaseDate: asset.purchaseDate
                ? asset.purchaseDate.split("T")[0]
                : "",

            purchasePrice:
                asset.purchasePrice ?? "",

            home:
                asset.home?._id ||
                asset.home ||
                "",

            notes: asset.notes || "",
        });

        setShowEditForm(true);
    };

    const handleUpdate = async (event) => {
        event.preventDefault();

        try {
            setSaving(true);

            const payload = {
                name: formData.name,
                category: formData.category,
                brand: formData.brand,
                model: formData.model,
                purchaseDate: formData.purchaseDate || undefined,
                purchasePrice: formData.purchasePrice
                    ? Number(formData.purchasePrice)
                    : undefined,
                home: formData.home || null,
                notes: formData.notes,
            };

            console.log("Updating asset payload:", payload);

            const data = await updateAsset(id, payload);

            setAsset(data.asset);

            setShowEditForm(false);
            toast.success("Asset updated successfully");
        } catch (error) {
            console.error(
                "Failed to update asset",
                error
            );
            toast.error(error.response?.data?.message || "Failed to update asset");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        try {
            setDeleting(true);

            await deleteAsset(id);

            toast.success("Asset deleted successfully");
            navigate("/assets");
        } catch (error) {
            console.error(
                "Failed to delete asset",
                error
            );
            toast.error(error.response?.data?.message || "Failed to delete asset");
        } finally {
            setDeleting(false);
        }
    };

    const handleCreateWarranty = async (event) => {
        event.preventDefault();

        try {
            setSavingWarranty(true);

            const data = await createWarranty(
                id,
                warrantyForm
            );

            setWarranty(data.warranty);

            setShowWarrantyForm(false);

            setWarrantyForm({
                provider: "",
                warrantyType: "Manufacturer",
                startDate: "",
                endDate: "",
                notes: "",
            });
            toast.success("Warranty created successfully");
        } catch (error) {
            console.error(
                "Failed to create warranty",
                error
            );
            toast.error(error.response?.data?.message || "Failed to create warranty");
        } finally {
            setSavingWarranty(false);
        }
    };

    const handleEditWarranty = () => {
        setWarrantyForm({
            provider: warranty.provider || "",
            warrantyType:
                warranty.warrantyType || "Manufacturer",
            startDate: warranty.startDate
                ? warranty.startDate.split("T")[0]
                : "",
            endDate: warranty.endDate
                ? warranty.endDate.split("T")[0]
                : "",
            notes: warranty.notes || "",
        });

        setShowEditWarranty(true);
    };

    const handleUpdateWarranty = async (event) => {
        event.preventDefault();

        try {
            setSavingWarranty(true);
            const data = await updateWarranty(
                id,
                warrantyForm
            );
            setWarranty(data.warranty);
            setShowEditWarranty(false);
            toast.success("Warranty updated successfully");
        } catch (error) {
            console.error(
                "Failed to update warranty",
                error
            );
            toast.error(error.response?.data?.message || "Failed to update warranty");
        } finally {
            setSavingWarranty(false);
        }
    };

    const handleDeleteWarranty = async () => {
        try {
            setDeletingWarranty(true);

            await deleteWarranty(id);

            setWarranty(null);

            setShowDeleteWarranty(false);
            toast.success("Warranty deleted successfully");
        } catch (error) {
            console.error(
                "Failed to delete warranty",
                error
            );
            toast.error(error.response?.data?.message || "Failed to delete warranty");
        } finally {
            setDeletingWarranty(false);
        }
    };

    const handleCreateReminder = async (event) => {
        event.preventDefault();

        try {
            setSavingReminder(true);

            const data = await createWarrantyReminder(
                id,
                remindBeforeDays
            );

            setReminder(data.reminder);

            setShowReminderForm(false);
            toast.success("Warranty reminder created successfully");
        } catch (error) {
            console.error(
                "Failed to create reminder",
                error
            );
            toast.error(error.response?.data?.message || "Failed to create reminder");
        } finally {
            setSavingReminder(false);
        }
    };

    const handleUpdateReminder = async (event) => {
        event.preventDefault();

        try {
            setSavingReminder(true);

            const data = await updateWarrantyReminder(
                id,
                remindBeforeDays
            );

            setReminder(data.reminder);

            setShowEditReminder(false);
            toast.success("Warranty reminder updated successfully");
        } catch (error) {
            console.error(
                "Failed to update reminder",
                error
            );
            toast.error(error.response?.data?.message || "Failed to update reminder");
        } finally {
            setSavingReminder(false);
        }
    };

    const handleDeleteReminder = async () => {
        try {
            setDeletingReminder(true);

            await deleteWarrantyReminder(id);

            setReminder(null);
            toast.success("Warranty reminder deleted successfully");
        } catch (error) {
            console.error(
                "Failed to delete reminder",
                error
            );
            toast.error(error.response?.data?.message || "Failed to delete reminder");
        } finally {
            setDeletingReminder(false);
        }
    };

    const selectedHome =
        asset.home &&
            typeof asset.home === "object"
            ? asset.home
            : homes.find(
                (home) =>
                    home._id === asset.home
            );

    return (
        <div className="asset-details-page">

            <button
                className="back-button"
                onClick={() => navigate("/assets")}
            >
                <ArrowLeft size={18} />
                Back to assets
            </button>

            <div className="asset-details-header">

                <div className="asset-details-title">

                    <div className="asset-details-icon">
                        <Package size={28} />
                    </div>

                    <div>
                        <span className="asset-category">
                            {asset.category}
                        </span>

                        <h1>{asset.name}</h1>

                        {asset.brand && (
                            <p>
                                {asset.brand}
                                {asset.model
                                    ? ` · ${asset.model}`
                                    : ""}
                            </p>
                        )}
                    </div>

                </div>

                <div className="asset-header-actions">

                    <button
                        className="primary-button"
                        onClick={() =>
                            navigate(`/assets/${asset._id}/service`)
                        }
                    >
                        <Wrench size={18} />
                        Get Service
                    </button>

                    <button
                        className="icon-button secondary-icon-button"
                        onClick={handleEdit}
                        aria-label="Edit asset"
                        title="Edit asset"
                    >
                        <Pencil size={18} />
                    </button>

                    <button
                        className="icon-button danger-icon-button"
                        onClick={() =>
                            setShowDeleteConfirm(true)
                        }
                        aria-label="Delete asset"
                        title="Delete asset"
                    >
                        <Trash2 size={18} />
                    </button>

                </div>

            </div>

            {selectedHome ? <div className="home-info-card">

                <h2>Home information</h2>

                <div className="asset-info-grid">

                    <div>
                        <span>Home</span>

                        <strong>
                            {selectedHome?.name ||
                                "Not assigned"}
                        </strong>
                    </div>

                    <div>
                        <span>Home type</span>

                        <strong>
                            {selectedHome?.type
                                ? selectedHome.type
                                    .charAt(0)
                                    .toUpperCase() +
                                selectedHome.type
                                    .slice(1)
                                    .toLowerCase()
                                : "Not provided"}
                        </strong>
                    </div>

                    <div>
                        <span>Address</span>

                        <strong>
                            {selectedHome?.address ||
                                "Not provided"}
                        </strong>
                    </div>

                    <div>
                        <span>Purchase date</span>

                        <strong>
                            {selectedHome?.purchaseDate
                                ? new Date(
                                    selectedHome.purchaseDate
                                ).toLocaleDateString()
                                : "Not provided"}
                        </strong>
                    </div>

                </div>

                {selectedHome?.description && (
                    <div className="asset-notes">

                        <span>Description</span>

                        <p>
                            {selectedHome.description}
                        </p>

                    </div>
                )}

            </div> : ''}


            <div className="asset-info-card">

                <h2>Asset information</h2>

                <div className="asset-info-grid">

                    <div>
                        <span>Category</span>

                        <strong>
                            {asset.category ||
                                "Not provided"}
                        </strong>
                    </div>

                    <div>
                        <span>Brand</span>

                        <strong>
                            {asset.brand ||
                                "Not provided"}
                        </strong>
                    </div>

                    <div>
                        <span>Model</span>

                        <strong>
                            {asset.model ||
                                "Not provided"}
                        </strong>
                    </div>

                    <div>
                        <span>Purchase date</span>

                        <strong>
                            {asset.purchaseDate
                                ? new Date(
                                    asset.purchaseDate
                                ).toLocaleDateString()
                                : "Not provided"}
                        </strong>
                    </div>

                    <div>
                        <span>Purchase price</span>

                        <strong>
                            {asset.purchasePrice
                                ? `₹${Number(
                                    asset.purchasePrice
                                ).toLocaleString("en-IN")}`
                                : "Not provided"}
                        </strong>
                    </div>

                </div>

                {/* {asset.notes && (
                    <div className="asset-notes">

                        <span>Notes</span>

                        <p>{asset.notes}</p>

                    </div>
                )} */}

            </div>

            <div className="warranty-card">

                <div className="warranty-header">

                    <div>
                        <h2>Warranty</h2>

                        <p>
                            Coverage information for this asset.
                        </p>
                    </div>

                    {warranty && (
                        <div className="warranty-actions">

                            <button
                                className="icon-button secondary-icon-button"
                                onClick={handleEditWarranty}
                                aria-label="Edit warranty"
                                title="Edit warranty"
                            >
                                <Pencil size={18} />
                            </button>

                            <button
                                className="icon-button danger-icon-button"
                                onClick={() =>
                                    setShowDeleteWarranty(true)
                                }
                                aria-label="Delete warranty"
                                title="Delete warranty"
                            >
                                <Trash2 size={18} />
                            </button>

                        </div>
                    )}

                </div>

                {loadingWarranty ? (
                    <p className="warranty-loading">
                        Loading warranty...
                    </p>
                ) : warranty ? (
                    <div className="warranty-content">

                        <div
                            className={`warranty-status ${warrantyStatus.type}`}
                        >
                            <span className="status-dot"></span>

                            <span>
                                {warrantyStatus.label}
                            </span>

                            {warrantyStatus.daysRemaining >= 0 && (
                                <span className="warranty-days">
                                    {warrantyStatus.daysRemaining} days remaining
                                </span>
                            )}
                        </div>

                        <div className="warranty-grid">

                            <div>
                                <span>Provider</span>
                                <strong>
                                    {warranty.provider || "Not provided"}
                                </strong>
                            </div>

                            <div>
                                <span>Type</span>
                                <strong>
                                    {warranty.warrantyType}
                                </strong>
                            </div>

                            <div>
                                <span>Start date</span>
                                <strong>
                                    {new Date(
                                        warranty.startDate
                                    ).toLocaleDateString()}
                                </strong>
                            </div>

                            <div>
                                <span>End date</span>
                                <strong>
                                    {new Date(
                                        warranty.endDate
                                    ).toLocaleDateString()}
                                </strong>
                            </div>

                        </div>

                        {warranty.notes && (
                            <div className="warranty-notes">

                                <span>Notes</span>

                                <p>{warranty.notes}</p>

                            </div>
                        )}

                    </div>

                ) : (
                    <div className="no-warranty">

                        <p>
                            No warranty has been added for this asset.
                        </p>

                        <button
                            className="secondary-button"
                            onClick={() => setShowWarrantyForm(true)}
                        >
                            Add warranty
                        </button>

                    </div>
                )}

                {warranty && (
                    <div className="reminder-section">

                        <div className="reminder-header">

                            <div>
                                <h3>Warranty reminder</h3>

                                <p>
                                    Get notified before this warranty expires.
                                </p>
                            </div>

                            {!reminder && (
                                <button
                                    className="secondary-button"
                                    onClick={() =>
                                        setShowReminderForm(true)
                                    }
                                >
                                    Set reminder
                                </button>
                            )}

                        </div>

                        {reminder && (
                            <div className="reminder-active">

                                <div className="reminder-info">

                                    <strong>
                                        Reminder set
                                    </strong>

                                    <p>
                                        We'll remind you{" "}
                                        {reminder.remindBeforeDays} days
                                        before the warranty expires.
                                    </p>

                                </div>

                                <div className="reminder-actions">

                                    <button
                                        className="icon-button secondary-icon-button"
                                        onClick={() => {
                                            setRemindBeforeDays(
                                                reminder.remindBeforeDays
                                            );

                                            setShowEditReminder(true);
                                        }}
                                        aria-label="Edit warranty reminder"
                                        title="Edit warranty reminder"
                                    >
                                        <Pencil size={18} />
                                    </button>

                                    <button
                                        className="icon-button danger-icon-button"
                                        onClick={handleDeleteReminder}
                                        disabled={deletingReminder}
                                        aria-label="Delete warranty reminder"
                                        title={deletingReminder
                                            ? "Deleting warranty reminder"
                                            : "Delete warranty reminder"}
                                    >
                                        <Trash2 size={18} />
                                    </button>

                                </div>

                            </div>
                        )}

                    </div>
                )}
            </div>

            <DocumentSection assetId={id} />

            {showDeleteConfirm && (
                <div className="modal-overlay">

                    <div className="delete-modal">

                        <div className="delete-icon">
                            ⚠
                        </div>

                        <h2>Delete this asset?</h2>

                        <p>
                            You're about to permanently delete{" "}
                            <strong>{asset.name}</strong>.
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
                                    : "Delete asset"}
                            </button>

                        </div>

                    </div>

                </div>
            )}

            {showEditForm && (
                <div className="modal-overlay">

                    <div className="asset-modal">

                        <div className="modal-header">

                            <div>
                                <h2>Edit asset</h2>
                                <p>
                                    Update your asset information.
                                </p>
                            </div>

                            <button
                                className="modal-close"
                                onClick={() => setShowEditForm(false)}
                            >
                                <X size={20} />
                            </button>

                        </div>

                        <form
                            className="asset-form"
                            onSubmit={handleUpdate}
                        >

                            <div className="form-group">
                                <label>Asset name</label>

                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(event) =>
                                        setFormData({
                                            ...formData,
                                            name: event.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div className="form-group">
                                <label>Home</label>

                                <select
                                    value={formData.home}
                                    onChange={(event) =>
                                        setFormData({
                                            ...formData,
                                            home: event.target.value,
                                        })
                                    }
                                    disabled={loadingHomes}
                                >
                                    <option value="">
                                        {loadingHomes
                                            ? "Loading homes..."
                                            : "Select home"}
                                    </option>

                                    {homes.map((home) => (
                                        <option
                                            key={home._id}
                                            value={home._id}
                                        >
                                            {home.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Category</label>

                                <select
                                    value={formData.category}
                                    onChange={(event) =>
                                        setFormData({
                                            ...formData,
                                            category: event.target.value,
                                        })
                                    }
                                >
                                    <option value="Electronics">
                                        Electronics
                                    </option>

                                    <option value="Vehicle">
                                        Vehicle
                                    </option>

                                    <option value="Appliance">
                                        Appliance
                                    </option>

                                    <option value="Furniture">
                                        Furniture
                                    </option>

                                    <option value="Other">
                                        Other
                                    </option>
                                </select>
                            </div>

                            <div className="form-row">

                                <div className="form-group">
                                    <label>Brand</label>

                                    <input
                                        type="text"
                                        value={formData.brand}
                                        onChange={(event) =>
                                            setFormData({
                                                ...formData,
                                                brand: event.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Model</label>

                                    <input
                                        type="text"
                                        value={formData.model}
                                        onChange={(event) =>
                                            setFormData({
                                                ...formData,
                                                model: event.target.value,
                                            })
                                        }
                                    />
                                </div>

                            </div>

                            <div className="form-row">

                                <div className="form-group">
                                    <label>Purchase date</label>

                                    <input
                                        type="date"
                                        value={formData.purchaseDate}
                                        onChange={(event) =>
                                            setFormData({
                                                ...formData,
                                                purchaseDate: event.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Purchase price</label>

                                    <input
                                        type="number"
                                        value={formData.purchasePrice}
                                        onChange={(event) =>
                                            setFormData({
                                                ...formData,
                                                purchasePrice:
                                                    event.target.value,
                                            })
                                        }
                                    />
                                </div>

                            </div>

                            <div className="form-group">
                                <label>Notes</label>

                                <textarea
                                    rows="3"
                                    value={formData.notes}
                                    onChange={(event) =>
                                        setFormData({
                                            ...formData,
                                            notes: event.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div className="modal-actions">

                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={() =>
                                        setShowEditForm(false)
                                    }
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

            {showWarrantyForm && (
                <div className="modal-overlay">

                    <div className="asset-modal">

                        <div className="modal-header">

                            <div>
                                <h2>Add warranty</h2>

                                <p>
                                    Add warranty coverage for this asset.
                                </p>
                            </div>

                            <button
                                className="modal-close"
                                onClick={() =>
                                    setShowWarrantyForm(false)
                                }
                            >
                                <X size={20} />
                            </button>

                        </div>

                        <form
                            className="asset-form"
                            onSubmit={handleCreateWarranty}
                        >

                            <div className="form-group">

                                <label>
                                    Warranty provider
                                </label>

                                <input
                                    type="text"
                                    placeholder="e.g. Apple"
                                    value={warrantyForm.provider}
                                    onChange={(event) =>
                                        setWarrantyForm({
                                            ...warrantyForm,
                                            provider:
                                                event.target.value,
                                        })
                                    }
                                />

                            </div>

                            <div className="form-group">

                                <label>
                                    Warranty type
                                </label>

                                <select
                                    value={warrantyForm.warrantyType}
                                    onChange={(event) =>
                                        setWarrantyForm({
                                            ...warrantyForm,
                                            warrantyType:
                                                event.target.value,
                                        })
                                    }
                                >

                                    <option value="Manufacturer">
                                        Manufacturer
                                    </option>

                                    <option value="Extended">
                                        Extended
                                    </option>

                                    <option value="Seller">
                                        Seller
                                    </option>

                                    <option value="Other">
                                        Other
                                    </option>

                                </select>

                            </div>

                            <div className="form-row">

                                <div className="form-group">

                                    <label>
                                        Start date
                                    </label>

                                    <input
                                        type="date"
                                        required
                                        value={warrantyForm.startDate}
                                        onChange={(event) =>
                                            setWarrantyForm({
                                                ...warrantyForm,
                                                startDate:
                                                    event.target.value,
                                            })
                                        }
                                    />

                                </div>

                                <div className="form-group">

                                    <label>
                                        End date
                                    </label>

                                    <input
                                        type="date"
                                        required
                                        value={warrantyForm.endDate}
                                        onChange={(event) =>
                                            setWarrantyForm({
                                                ...warrantyForm,
                                                endDate:
                                                    event.target.value,
                                            })
                                        }
                                    />

                                </div>

                            </div>

                            <div className="form-group">

                                <label>
                                    Notes
                                </label>

                                <textarea
                                    rows="3"
                                    placeholder="Additional warranty information..."
                                    value={warrantyForm.notes}
                                    onChange={(event) =>
                                        setWarrantyForm({
                                            ...warrantyForm,
                                            notes: event.target.value,
                                        })
                                    }
                                />

                            </div>

                            <div className="modal-actions">

                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={() =>
                                        setShowWarrantyForm(false)
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="primary-button"
                                    disabled={savingWarranty}
                                >
                                    {savingWarranty
                                        ? "Saving..."
                                        : "Save warranty"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

            {showEditWarranty && (
                <div className="modal-overlay">

                    <div className="asset-modal">

                        <div className="modal-header">

                            <div>
                                <h2>Edit warranty</h2>

                                <p>
                                    Update warranty information.
                                </p>
                            </div>

                            <button
                                className="modal-close"
                                onClick={() =>
                                    setShowEditWarranty(false)
                                }
                            >
                                <X size={20} />
                            </button>

                        </div>

                        <form
                            className="asset-form"
                            onSubmit={handleUpdateWarranty}
                        >

                            <div className="form-group">

                                <label>
                                    Warranty provider
                                </label>

                                <input
                                    type="text"
                                    value={warrantyForm.provider}
                                    onChange={(event) =>
                                        setWarrantyForm({
                                            ...warrantyForm,
                                            provider:
                                                event.target.value,
                                        })
                                    }
                                />

                            </div>

                            <div className="form-group">

                                <label>
                                    Warranty type
                                </label>

                                <select
                                    value={warrantyForm.warrantyType}
                                    onChange={(event) =>
                                        setWarrantyForm({
                                            ...warrantyForm,
                                            warrantyType:
                                                event.target.value,
                                        })
                                    }
                                >

                                    <option value="Manufacturer">
                                        Manufacturer
                                    </option>

                                    <option value="Extended">
                                        Extended
                                    </option>

                                    <option value="Seller">
                                        Seller
                                    </option>

                                    <option value="Other">
                                        Other
                                    </option>

                                </select>

                            </div>

                            <div className="form-row">

                                <div className="form-group">

                                    <label>
                                        Start date
                                    </label>

                                    <input
                                        type="date"
                                        required
                                        value={warrantyForm.startDate}
                                        onChange={(event) =>
                                            setWarrantyForm({
                                                ...warrantyForm,
                                                startDate:
                                                    event.target.value,
                                            })
                                        }
                                    />

                                </div>

                                <div className="form-group">

                                    <label>
                                        End date
                                    </label>

                                    <input
                                        type="date"
                                        required
                                        value={warrantyForm.endDate}
                                        onChange={(event) =>
                                            setWarrantyForm({
                                                ...warrantyForm,
                                                endDate:
                                                    event.target.value,
                                            })
                                        }
                                    />

                                </div>

                            </div>

                            <div className="form-group">

                                <label>Notes</label>

                                <textarea
                                    rows="3"
                                    value={warrantyForm.notes}
                                    onChange={(event) =>
                                        setWarrantyForm({
                                            ...warrantyForm,
                                            notes: event.target.value,
                                        })
                                    }
                                />

                            </div>

                            <div className="modal-actions">

                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={() =>
                                        setShowEditWarranty(false)
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="primary-button"
                                    disabled={savingWarranty}
                                >
                                    {savingWarranty
                                        ? "Saving..."
                                        : "Save changes"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

            {showDeleteWarranty && (
                <div className="modal-overlay">

                    <div className="delete-modal">

                        <div className="delete-icon">
                            ⚠
                        </div>

                        <h2>
                            Delete warranty?
                        </h2>

                        <p>
                            This will remove the warranty information
                            from this asset.
                        </p>

                        <div className="modal-actions">

                            <button
                                type="button"
                                className="secondary-button"
                                onClick={() =>
                                    setShowDeleteWarranty(false)
                                }
                                disabled={deletingWarranty}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="danger-button"
                                onClick={handleDeleteWarranty}
                                disabled={deletingWarranty}
                            >
                                {deletingWarranty
                                    ? "Deleting..."
                                    : "Delete warranty"}
                            </button>

                        </div>

                    </div>

                </div>
            )}

            {showReminderForm && (
                <div className="modal-overlay">

                    <div className="asset-modal">

                        <div className="modal-header">

                            <div>
                                <h2>Set warranty reminder</h2>

                                <p>
                                    Choose when you want to be reminded.
                                </p>
                            </div>

                            <button
                                className="modal-close"
                                onClick={() =>
                                    setShowReminderForm(false)
                                }
                            >
                                <X size={20} />
                            </button>

                        </div>

                        <form
                            className="asset-form"
                            onSubmit={handleCreateReminder}
                        >

                            <div className="form-group">

                                <label>
                                    Remind me
                                </label>

                                <select
                                    value={remindBeforeDays}
                                    onChange={(event) =>
                                        setRemindBeforeDays(
                                            Number(event.target.value)
                                        )
                                    }
                                >

                                    <option value={30}>
                                        30 days before
                                    </option>

                                    <option value={14}>
                                        14 days before
                                    </option>

                                    <option value={7}>
                                        7 days before
                                    </option>

                                    <option value={1}>
                                        1 day before
                                    </option>

                                </select>

                            </div>

                            <div className="reminder-preview">

                                <span>
                                    Warranty expires
                                </span>

                                <strong>
                                    {new Date(
                                        warranty.endDate
                                    ).toLocaleDateString()}
                                </strong>

                            </div>

                            <div className="modal-actions">

                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={() =>
                                        setShowReminderForm(false)
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="primary-button"
                                    disabled={savingReminder}
                                >
                                    {savingReminder
                                        ? "Saving..."
                                        : "Set reminder"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

            {showEditReminder && (
                <div className="modal-overlay">

                    <div className="asset-modal">

                        <div className="modal-header">

                            <div>
                                <h2>Edit reminder</h2>

                                <p>
                                    Change when you want to be reminded.
                                </p>
                            </div>

                            <button
                                className="modal-close"
                                onClick={() =>
                                    setShowEditReminder(false)
                                }
                            >
                                <X size={20} />
                            </button>

                        </div>

                        <form
                            className="asset-form"
                            onSubmit={handleUpdateReminder}
                        >

                            <div className="form-group">

                                <label>
                                    Remind me
                                </label>

                                <select
                                    value={remindBeforeDays}
                                    onChange={(event) =>
                                        setRemindBeforeDays(
                                            Number(event.target.value)
                                        )
                                    }
                                >

                                    <option value={30}>
                                        30 days before
                                    </option>

                                    <option value={14}>
                                        14 days before
                                    </option>

                                    <option value={7}>
                                        7 days before
                                    </option>

                                    <option value={1}>
                                        1 day before
                                    </option>

                                </select>

                            </div>

                            <div className="reminder-preview">

                                <span>
                                    Warranty expires
                                </span>

                                <strong>
                                    {new Date(
                                        warranty.endDate
                                    ).toLocaleDateString()}
                                </strong>

                            </div>

                            <div className="modal-actions">

                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={() =>
                                        setShowEditReminder(false)
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="primary-button"
                                    disabled={savingReminder}
                                >
                                    {savingReminder
                                        ? "Saving..."
                                        : "Save changes"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}
        </div>
    );
}

export default AssetDetails;
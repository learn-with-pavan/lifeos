import {
    Wrench,
    Plus,
    Search,
    Pencil,
    Trash2,
    X,
    Package,
    Calendar,
    IndianRupee,
} from "lucide-react";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    createServiceHistory,
    getServiceHistories,
    updateServiceHistory,
    deleteServiceHistory,
} from "../services/serviceHistoryService";

import { getAssets } from "../services/assetService";
import { useToast } from "../context/ToastContext";

import "../styles/serviceHistory.css";

function ServiceHistory() {
    const navigate = useNavigate();
    const toast = useToast();

    const [serviceHistories, setServiceHistories] =
        useState([]);

    const [assets, setAssets] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [showForm, setShowForm] =
        useState(false);

    const [editingService, setEditingService] =
        useState(null);

    const [deletingService, setDeletingService] =
        useState(null);

    const [saving, setSaving] =
        useState(false);

    const [deleting, setDeleting] =
        useState(false);

    // Search
    const [searchTerm, setSearchTerm] =
        useState("");

    // Asset filter
    const [selectedAsset, setSelectedAsset] =
        useState("");

    // Service type filter
    const [typeFilter, setTypeFilter] =
        useState("ALL");

    // Sorting
    const [sortBy, setSortBy] =
        useState("newest");

    const [formData, setFormData] = useState({
        asset: "",
        serviceDate: "",
        serviceType: "",
        provider: "",
        cost: "",
        description: "",
        notes: "",
    });

    // ================================
    // LOAD DATA
    // ================================

    const loadData = async () => {
        try {
            setLoading(true);
            setError("");

            const [
                serviceResponse,
                assetResponse,
            ] = await Promise.all([
                getServiceHistories(),
                getAssets(),
            ]);

            setServiceHistories(
                serviceResponse.serviceHistories || []
            );

            setAssets(
                assetResponse.assets || []
            );

        } catch (error) {
            console.error(
                "Failed to load service history:",
                error
            );

            setError(
                "Unable to load service history."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // ================================
    // FORM
    // ================================

    const resetForm = () => {
        setFormData({
            asset: "",
            serviceDate: "",
            serviceType: "",
            provider: "",
            cost: "",
            description: "",
            notes: "",
        });
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingService(null);
        resetForm();
    };

    // ================================
    // CREATE
    // ================================

    const handleCreate = async (event) => {
        event.preventDefault();

        try {
            setSaving(true);
            setError("");

            const response =
                await createServiceHistory({
                    ...formData,
                    cost:
                        formData.cost === ""
                            ? 0
                            : Number(formData.cost),
                });

            setServiceHistories(
                (current) => [
                    response.serviceHistory,
                    ...current,
                ]
            );

            closeForm();
            toast.success("Service history created successfully");

        } catch (error) {
            console.error(
                "Failed to create service history:",
                error
            );

            toast.error(
                "Unable to create service history."
            );
        } finally {
            setSaving(false);
        }
    };

    // ================================
    // EDIT
    // ================================

    const handleEdit = (service) => {
        setEditingService(service);

        setFormData({
            asset:
                service.asset?._id ||
                service.asset ||
                "",

            serviceDate:
                service.serviceDate
                    ? service.serviceDate.split("T")[0]
                    : "",

            serviceType:
                service.serviceType || "",

            provider:
                service.provider || "",

            cost:
                service.cost ?? "",

            description:
                service.description || "",

            notes:
                service.notes || "",
        });

        setShowForm(true);
    };

    // ================================
    // UPDATE
    // ================================

    const handleUpdate = async (event) => {
        event.preventDefault();

        try {
            setSaving(true);
            setError("");

            const response =
                await updateServiceHistory(
                    editingService._id,
                    {
                        ...formData,
                        cost:
                            formData.cost === ""
                                ? 0
                                : Number(formData.cost),
                    }
                );

            setServiceHistories(
                (current) =>
                    current.map(
                        (service) =>
                            service._id ===
                                editingService._id
                                ? response.serviceHistory
                                : service
                    )
            );

            closeForm();
            toast.success("Service history updated successfully");

        } catch (error) {
            console.error(
                "Failed to update service history:",
                error
            );

            toast.error(
                "Unable to update service history."
            );
        } finally {
            setSaving(false);
        }
    };

    // ================================
    // DELETE
    // ================================

    const handleDelete = async () => {
        try {
            setDeleting(true);
            setError("");

            await deleteServiceHistory(
                deletingService._id
            );

            setServiceHistories(
                (current) =>
                    current.filter(
                        (service) =>
                            service._id !==
                            deletingService._id
                    )
            );

            setDeletingService(null);
            toast.success("Service history deleted successfully");

        } catch (error) {
            console.error(
                "Failed to delete service history:",
                error
            );

            toast.error(
                "Unable to delete service history."
            );
        } finally {
            setDeleting(false);
        }
    };

    // ================================
    // FILTER + SORT
    // ================================

    const filteredServiceHistories =
        serviceHistories
            .filter((service) => {
                const search =
                    searchTerm
                        .trim()
                        .toLowerCase();

                const matchesSearch =
                    !search ||
                    service.serviceType
                        ?.toLowerCase()
                        .includes(search) ||
                    service.provider
                        ?.toLowerCase()
                        .includes(search) ||
                    service.description
                        ?.toLowerCase()
                        .includes(search) ||
                    service.asset?.name
                        ?.toLowerCase()
                        .includes(search);

                const matchesAsset =
                    !selectedAsset ||
                    service.asset?._id ===
                    selectedAsset ||
                    service.asset ===
                    selectedAsset;

                const matchesType =
                    typeFilter === "ALL" ||
                    service.serviceType ===
                    typeFilter;

                return (
                    matchesSearch &&
                    matchesAsset &&
                    matchesType
                );
            })
            .sort((a, b) => {
                const dateA =
                    new Date(
                        a.serviceDate
                    ).getTime();

                const dateB =
                    new Date(
                        b.serviceDate
                    ).getTime();

                if (sortBy === "oldest") {
                    return dateA - dateB;
                }

                return dateB - dateA;
            });

    // ================================
    // CLEAR FILTERS
    // ================================

    const clearFilters = () => {
        setSearchTerm("");
        setSelectedAsset("");
        setTypeFilter("ALL");
        setSortBy("newest");
    };

    // ================================
    // FORMATTERS
    // ================================

    const formatDate = (date) => {
        if (!date) return "-";

        return new Date(date).toLocaleDateString(
            "en-IN",
            {
                day: "numeric",
                month: "short",
                year: "numeric",
            }
        );
    };

    const formatCost = (cost) => {
        return new Intl.NumberFormat(
            "en-IN",
            {
                maximumFractionDigits: 0,
            }
        ).format(cost || 0);
    };

    // ================================
    // UI
    // ================================

    return (
        <div className="service-history-page">

            {/* PAGE HEADER */}

            <div className="page-title-row">

                <div>
                    <h1>
                        Service History
                    </h1>

                    <p>
                        Keep track of services
                        and repairs completed
                        for your assets.
                    </p>
                </div>

                <button
                    className="primary-button"
                    onClick={() => {
                        resetForm();
                        setEditingService(null);
                        setShowForm(true);
                    }}
                >
                    <Plus size={18} />
                    Add service
                </button>

            </div>


            {/* TOOLBAR */}

            <div className="service-history-toolbar">

                <div className="service-history-search">

                    <Search size={18} />

                    <input
                        type="text"
                        placeholder="Search service history..."
                        value={searchTerm}
                        onChange={(event) =>
                            setSearchTerm(
                                event.target.value
                            )
                        }
                    />

                </div>


                <div className="service-history-filters">

                    {/* ASSET */}

                    <select
                        value={selectedAsset}
                        onChange={(event) =>
                            setSelectedAsset(
                                event.target.value
                            )
                        }
                    >
                        <option value="">
                            All assets
                        </option>

                        {assets.map((asset) => (
                            <option
                                key={asset._id}
                                value={asset._id}
                            >
                                {asset.name}
                            </option>
                        ))}
                    </select>


                    {/* SERVICE TYPE */}

                    <select
                        value={typeFilter}
                        onChange={(event) =>
                            setTypeFilter(
                                event.target.value
                            )
                        }
                    >
                        <option value="ALL">
                            All service types
                        </option>

                        <option value="SERVICE">
                            Service
                        </option>

                        <option value="REPAIR">
                            Repair
                        </option>

                        <option value="INSPECTION">
                            Inspection
                        </option>

                        <option value="OTHER">
                            Other
                        </option>
                    </select>


                    {/* SORT */}

                    <select
                        value={sortBy}
                        onChange={(event) =>
                            setSortBy(
                                event.target.value
                            )
                        }
                    >
                        <option value="newest">
                            Newest first
                        </option>

                        <option value="oldest">
                            Oldest first
                        </option>
                    </select>

                </div>

            </div>


            {/* ERROR */}

            {error && (
                <div className="maintenance-error">
                    {error}
                </div>
            )}


            {/* LOADING */}

            {loading ? (

                <div className="assets-empty-state">
                    <p>
                        Loading service history...
                    </p>
                </div>

            ) : serviceHistories.length === 0 ? (

                /* NO DATA */

                <div className="assets-empty-state">

                    <div className="assets-empty-icon">
                        <Wrench size={28} />
                    </div>

                    <h2>
                        No service history yet
                    </h2>

                    <p>
                        Record completed services
                        and repairs for your assets.
                    </p>

                    <button
                        className="primary-button"
                        onClick={() => {
                            resetForm();
                            setShowForm(true);
                        }}
                    >
                        <Plus size={18} />
                        Add your first service
                    </button>

                </div>

            ) : filteredServiceHistories.length === 0 ? (

                /* NO SEARCH RESULTS */

                <div className="assets-empty-state">

                    <div className="assets-empty-icon">
                        <Search size={28} />
                    </div>

                    <h2>
                        No matching services
                    </h2>

                    <p>
                        We couldn't find any service
                        history matching your search
                        or filters.
                    </p>

                    <button
                        className="secondary-button"
                        onClick={clearFilters}
                    >
                        Clear filters
                    </button>

                </div>

            ) : (

                /* LIST */

                <div className="service-history-list">

                    {filteredServiceHistories.map(
                        (service) => (

                            <div
                                className="service-history-card"
                                key={service._id}
                            >

                                <div className="service-history-card-main">

                                    <div className="service-history-icon">
                                        <Wrench size={21} />
                                    </div>


                                    <div className="service-history-info">

                                        <div className="service-history-title-row">

                                            <h3>
                                                {
                                                    service.serviceType
                                                }
                                            </h3>

                                        </div>


                                        {service.asset && (
                                            <button
                                                className="service-history-asset"
                                                onClick={() =>
                                                    navigate(
                                                        `/assets/${service.asset._id}`
                                                    )
                                                }
                                            >
                                                <Package
                                                    size={14}
                                                />

                                                <span>
                                                    {
                                                        service
                                                            .asset
                                                            .name
                                                    }
                                                </span>
                                            </button>
                                        )}


                                        {service.provider && (
                                            <p>
                                                Provider:{" "}
                                                {
                                                    service.provider
                                                }
                                            </p>
                                        )}


                                        {service.description && (
                                            <p>
                                                {
                                                    service.description
                                                }
                                            </p>
                                        )}

                                    </div>

                                </div>


                                <div className="service-history-card-right">

                                    <div className="service-history-meta">

                                        <div>
                                            <Calendar
                                                size={15}
                                            />

                                            <span>
                                                {formatDate(
                                                    service.serviceDate
                                                )}
                                            </span>
                                        </div>


                                        <div className="service-history-cost">
                                            <IndianRupee
                                                size={15}
                                            />

                                            <span>
                                                {formatCost(
                                                    service.cost
                                                )}
                                            </span>
                                        </div>

                                    </div>


                                    <div className="service-history-actions">

                                        <button
                                            className="icon-button secondary-icon-button"
                                            onClick={() =>
                                                handleEdit(
                                                    service
                                                )
                                            }
                                            aria-label="Edit service history"
                                            title="Edit Service history"
                                        >
                                            <Pencil
                                                size={18}
                                            />
                                        </button>


                                        <button
                                            className="icon-button danger-icon-button"
                                            onClick={() =>
                                                setDeletingService(
                                                    service
                                                )
                                            }
                                            aria-label="Delete service history"
                                            title="Delete service history"
                                        >
                                            <Trash2
                                                size={18}
                                            />
                                        </button>

                                    </div>

                                </div>

                            </div>

                        )
                    )}

                </div>

            )}


            {/* ADD / EDIT MODAL */}

            {showForm && (
                <div className="modal-overlay">

                    <div className="asset-modal service-history-modal">

                        <div className="modal-header">

                            <div>

                                <h2>
                                    {editingService
                                        ? "Edit Service History"
                                        : "Add Service History"}
                                </h2>

                                <p>
                                    Record a completed
                                    service or repair.
                                </p>

                            </div>

                            <button
                                className="modal-close"
                                onClick={closeForm}
                            >
                                <X size={20} />
                            </button>

                        </div>


                        <form
                            className="asset-form"
                            onSubmit={
                                editingService
                                    ? handleUpdate
                                    : handleCreate
                            }
                        >

                            <div className="service-history-form-body">

                                {/* ASSET */}

                                <div className="form-group">

                                    <label>
                                        Asset
                                    </label>

                                    <select
                                        required
                                        value={
                                            formData.asset
                                        }
                                        onChange={(event) =>
                                            setFormData({
                                                ...formData,
                                                asset:
                                                    event.target
                                                        .value,
                                            })
                                        }
                                    >

                                        <option
                                            value=""
                                            disabled
                                        >
                                            Select asset
                                        </option>

                                        {assets.map(
                                            (asset) => (
                                                <option
                                                    key={
                                                        asset._id
                                                    }
                                                    value={
                                                        asset._id
                                                    }
                                                >
                                                    {asset.name}
                                                </option>
                                            )
                                        )}

                                    </select>

                                </div>


                                {/* DATE */}

                                <div className="form-group">

                                    <label>
                                        Service date
                                    </label>

                                    <input
                                        type="date"
                                        required
                                        value={
                                            formData.serviceDate
                                        }
                                        onChange={(event) =>
                                            setFormData({
                                                ...formData,
                                                serviceDate:
                                                    event.target
                                                        .value,
                                            })
                                        }
                                    />

                                </div>


                                {/* SERVICE TYPE */}

                                <div className="form-group">

                                    <label>
                                        Service type
                                    </label>

                                    <select
                                        required
                                        value={
                                            formData.serviceType
                                        }
                                        onChange={(event) =>
                                            setFormData({
                                                ...formData,
                                                serviceType:
                                                    event.target
                                                        .value,
                                            })
                                        }
                                    >

                                        <option
                                            value=""
                                            disabled
                                        >
                                            Select service type
                                        </option>

                                        <option value="SERVICE">
                                            Service
                                        </option>

                                        <option value="REPAIR">
                                            Repair
                                        </option>

                                        <option value="INSPECTION">
                                            Inspection
                                        </option>

                                        <option value="OTHER">
                                            Other
                                        </option>

                                    </select>

                                </div>


                                {/* PROVIDER */}

                                <div className="form-group">

                                    <label>
                                        Service provider
                                    </label>

                                    <input
                                        type="text"
                                        placeholder="e.g. Cool Air Services"
                                        value={
                                            formData.provider
                                        }
                                        onChange={(event) =>
                                            setFormData({
                                                ...formData,
                                                provider:
                                                    event.target
                                                        .value,
                                            })
                                        }
                                    />

                                </div>


                                {/* COST */}

                                <div className="form-group">

                                    <label>
                                        Cost
                                    </label>

                                    <input
                                        type="number"
                                        min="0"
                                        placeholder="e.g. 850"
                                        value={
                                            formData.cost
                                        }
                                        onChange={(event) =>
                                            setFormData({
                                                ...formData,
                                                cost:
                                                    event.target
                                                        .value,
                                            })
                                        }
                                    />

                                </div>


                                {/* DESCRIPTION */}

                                <div className="form-group">

                                    <label>
                                        Description
                                    </label>

                                    <textarea
                                        rows="3"
                                        placeholder="What service or repair was completed?"
                                        value={
                                            formData.description
                                        }
                                        onChange={(event) =>
                                            setFormData({
                                                ...formData,
                                                description:
                                                    event.target
                                                        .value,
                                            })
                                        }
                                    />

                                </div>


                                {/* NOTES */}

                                <div className="form-group">

                                    <label>
                                        Notes
                                    </label>

                                    <textarea
                                        rows="3"
                                        placeholder="Additional notes"
                                        value={
                                            formData.notes
                                        }
                                        onChange={(event) =>
                                            setFormData({
                                                ...formData,
                                                notes:
                                                    event.target
                                                        .value,
                                            })
                                        }
                                    />

                                </div>


                            </div>

                            {/* ACTIONS */}

                            <div className="modal-actions">

                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={closeForm}
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
                                        : editingService
                                            ? "Save changes"
                                            : "Add service"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}


            {/* DELETE MODAL */}

            {deletingService && (
                <div className="modal-overlay">

                    <div className="delete-modal">

                        <div className="delete-icon">
                            ⚠
                        </div>

                        <h2>
                            Delete service history?
                        </h2>

                        <p>
                            You're about to delete{" "}
                            <strong>
                                {
                                    deletingService.serviceType
                                }
                            </strong>
                            .
                        </p>

                        <div className="modal-actions">

                            <button
                                className="secondary-button"
                                onClick={() =>
                                    setDeletingService(
                                        null
                                    )
                                }
                                disabled={deleting}
                            >
                                Cancel
                            </button>

                            <button
                                className="danger-button"
                                onClick={handleDelete}
                                disabled={deleting}
                            >
                                {deleting
                                    ? "Deleting..."
                                    : "Delete service"}
                            </button>

                        </div>

                    </div>

                </div>
            )}

        </div>
    );
}

export default ServiceHistory;
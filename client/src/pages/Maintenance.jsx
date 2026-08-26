import { useEffect, useState } from "react";
import {
    Wrench,
    Plus,
    X,
    Calendar,
    Package,
    Pencil,
    Trash2,
    Search,
    SlidersHorizontal,
    IndianRupee,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import LoadingState from "../components/LoadingState";

import {
    getMaintenances,
    createMaintenance,
    updateMaintenance,
    deleteMaintenance,
} from "../services/maintenanceService";

import {
    getAssets,
} from "../services/assetService";
import { useToast } from "../context/ToastContext";

function Maintenance() {
    const navigate = useNavigate();
    const toast = useToast();

    const [maintenances, setMaintenances] =
        useState([]);

    const [assets, setAssets] = useState([]);

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [deleting, setDeleting] =
        useState(false);

    const [showForm, setShowForm] =
        useState(false);

    const [editingMaintenance, setEditingMaintenance] =
        useState(null);

    const [deletingMaintenance, setDeletingMaintenance] =
        useState(null);

    const [error, setError] =
        useState("");

    const [formData, setFormData] =
        useState({
            assetId: "",
            title: "",
            description: "",
            dueDate: "",
            estimatedCost: "",
            notes: "",
        });

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [sortBy, setSortBy] = useState("DUE_SOONEST");

    const loadData = async () => {
        try {
            setLoading(true);
            setError("");

            const [
                maintenanceResponse,
                assetsResponse,
            ] = await Promise.all([
                getMaintenances(),
                getAssets(),
            ]);

            setMaintenances(
                maintenanceResponse.maintenance || []
            );

            setAssets(
                assetsResponse.assets || []
            );
        } catch (error) {
            console.error(
                "Failed to load maintenance",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to load maintenance"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const resetForm = () => {
        setFormData({
            assetId: "",
            title: "",
            description: "",
            dueDate: "",
            notes: "",
        });
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingMaintenance(null);
        resetForm();
    };

    const handleCreate = async (event) => {
        event.preventDefault();

        try {
            setSaving(true);

            const data =
                await createMaintenance(
                    formData.assetId,
                    {
                        title: formData.title,
                        description:
                            formData.description,
                        dueDate:
                            formData.dueDate,
                        estimatedCost: formData.estimatedCost
                            ? Number(formData.estimatedCost)
                            : 0,
                        notes:
                            formData.notes,
                    }
                );

            const created =
                data.maintenance;

            setMaintenances((current) => [
                created,
                ...current,
            ]);

            toast.success("Maintenance created successfully");
            closeForm();
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Failed to create maintenance"
            );
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (
        maintenance
    ) => {
        setEditingMaintenance(
            maintenance
        );

        setFormData({
            assetId:
                maintenance.asset?._id ||
                maintenance.asset ||
                "",
            title:
                maintenance.title || "",
            description:
                maintenance.description ||
                "",
            dueDate:
                maintenance.dueDate
                    ? maintenance.dueDate.split(
                        "T"
                    )[0]
                    : "",
            estimatedCost: maintenance.estimatedCost || '',

            notes:
                maintenance.notes || "",
        });

        setShowForm(true);
    };

    const handleUpdate = async (
        event
    ) => {
        event.preventDefault();

        try {
            setSaving(true);

            const data =
                await updateMaintenance(
                    editingMaintenance._id,
                    {
                        title:
                            formData.title,
                        description:
                            formData.description,
                        dueDate:
                            formData.dueDate,
                        estimatedCost: formData.estimatedCost
                            ? Number(formData.estimatedCost)
                            : 0,
                        notes:
                            formData.notes,
                    }
                );

            setMaintenances(
                (current) =>
                    current.map(
                        (item) =>
                            item._id ===
                                editingMaintenance._id
                                ? data.maintenance
                                : item
                    )
            );

            toast.success("Maintenance updated successfully");
            closeForm();
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Failed to update maintenance"
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        try {
            setDeleting(true);

            await deleteMaintenance(
                deletingMaintenance._id
            );

            setMaintenances(
                (current) =>
                    current.filter(
                        (item) =>
                            item._id !==
                            deletingMaintenance._id
                    )
            );

            toast.success("Maintenance deleted successfully");
            setDeletingMaintenance(
                null
            );
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Failed to delete maintenance"
            );
        } finally {
            setDeleting(false);
        }
    };

    const clearMaintenanceFilters = () => {
        setSearch("");
        setStatusFilter("ALL");
        setSortBy("DUE_SOONEST");
    };

    const getStatus = (dueDate) => {
        const today = new Date();
        const due = new Date(dueDate);

        today.setHours(0, 0, 0, 0);
        due.setHours(0, 0, 0, 0);

        if (due < today) {
            return {
                key: "OVERDUE",
                label: "Overdue",
                className: "maintenance-status-overdue",
            };
        }

        if (due.getTime() === today.getTime()) {
            return {
                key: "DUE",
                label: "Due today",
                className: "maintenance-status-due",
            };
        }

        return {
            key: "UPCOMING",
            label: "Upcoming",
            className: "maintenance-status-upcoming",
        };
    };

    const formatDate = (
        date
    ) => {
        if (!date) {
            return "No due date";
        }

        return new Date(
            date
        ).toLocaleDateString(
            "en-IN",
            {
                day: "numeric",
                month: "short",
                year: "numeric",
            }
        );
    };

    const filteredMaintenances = [...maintenances]
        .filter((maintenance) => {
            const searchValue = search
                .trim()
                .toLowerCase();

            if (!searchValue) {
                return true;
            }

            return (
                maintenance.title
                    ?.toLowerCase()
                    .includes(searchValue) ||
                maintenance.description
                    ?.toLowerCase()
                    .includes(searchValue) ||
                maintenance.asset?.name
                    ?.toLowerCase()
                    .includes(searchValue)
            );
        })
        .filter((maintenance) => {
            if (statusFilter === "ALL") {
                return true;
            }

            const status = getStatus(
                maintenance.dueDate
            );

            return status.key === statusFilter;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case "DUE_LATEST":
                    return (
                        new Date(b.dueDate) -
                        new Date(a.dueDate)
                    );

                case "NEWEST":
                    return (
                        new Date(b.createdAt || 0) -
                        new Date(a.createdAt || 0)
                    );

                case "OLDEST":
                    return (
                        new Date(a.createdAt || 0) -
                        new Date(b.createdAt || 0)
                    );

                case "DUE_SOONEST":
                default:
                    return (
                        new Date(a.dueDate) -
                        new Date(b.dueDate)
                    );
            }
        });

    const formatCost = (cost) => {
        return new Intl.NumberFormat(
            "en-IN",
            {
                maximumFractionDigits: 0,
            }
        ).format(cost || 0);
    };

    return (
        <div className="maintenance-page">

            <div className="page-title-row">

                <div>
                    <h1>
                        Maintenance
                    </h1>

                    <p>
                        Stay on top of maintenance
                        for the things you own.
                    </p>
                </div>

                <button
                    className="primary-button"
                    onClick={() => {
                        resetForm();
                        setShowForm(true);
                    }}
                >
                    <Plus size={18} />
                    Add maintenance
                </button>

            </div>

            <div className="maintenance-toolbar">

                <div className="maintenance-search">

                    <Search size={18} />

                    <input
                        type="text"
                        placeholder="Search maintenance..."
                        value={search}
                        onChange={(event) =>
                            setSearch(event.target.value)
                        }
                    />

                </div>

                <div className="maintenance-filter">

                    <SlidersHorizontal size={17} />

                    <select
                        value={statusFilter}
                        onChange={(event) =>
                            setStatusFilter(
                                event.target.value
                            )
                        }
                    >
                        <option value="ALL">
                            All status
                        </option>

                        <option value="UPCOMING">
                            Upcoming
                        </option>

                        <option value="DUE">
                            Due today
                        </option>

                        <option value="OVERDUE">
                            Overdue
                        </option>
                    </select>

                </div>

                <select
                    className="maintenance-sort"
                    value={sortBy}
                    onChange={(event) =>
                        setSortBy(event.target.value)
                    }
                >
                    <option value="DUE_SOONEST">
                        Due soonest
                    </option>

                    <option value="DUE_LATEST">
                        Due latest
                    </option>

                    <option value="NEWEST">
                        Recently added
                    </option>

                    <option value="OLDEST">
                        Oldest added
                    </option>
                </select>

            </div>

            {error && (
                <div className="maintenance-error">
                    {error}
                </div>
            )}
            {loading ? (
                <LoadingState
                    title="Loading maintenance"
                    message="We're checking your maintenance schedule."
                />
            ) : maintenances.length === 0 ? (
                <div className="assets-empty-state">

                    <div className="assets-empty-icon">
                        <Wrench size={28} />
                    </div>

                    <h2>
                        No maintenance yet
                    </h2>

                    <p>
                        Add maintenance for your
                        assets to keep track of
                        upcoming service and upkeep.
                    </p>

                    <button
                        className="primary-button"
                        onClick={() => {
                            resetForm();
                            setShowForm(true);
                        }}
                    >
                        <Plus size={18} />
                        Add maintenance
                    </button>

                </div>
            ) : filteredMaintenances.length === 0 ? (
                <div className="assets-empty-state">

                    <div className="assets-empty-icon">
                        <Search size={28} />
                    </div>

                    <h2>
                        No matching maintenance
                    </h2>

                    <p>
                        We couldn't find any maintenance
                        matching your search or filters.
                    </p>

                    <button
                        className="secondary-button"
                        onClick={clearMaintenanceFilters}
                    >
                        Clear filters
                    </button>

                </div>
            ) : (
                <div className="maintenance-list">

                    {filteredMaintenances.map(
                        (maintenance) => {
                            const status = getStatus(
                                maintenance.dueDate
                            );

                            return (
                                <div
                                    className="maintenance-card"
                                    key={maintenance._id}
                                >

                                    <div className="maintenance-card-main">

                                        <div className="maintenance-icon">
                                            <Wrench size={21} />
                                        </div>

                                        <div className="maintenance-info">

                                            <div className="maintenance-title-row">

                                                <h3>
                                                    {maintenance.title}
                                                </h3>

                                                <span
                                                    className={`maintenance-status ${status.className}`}
                                                >
                                                    {status.label}
                                                </span>

                                            </div>

                                            {maintenance.asset && (
                                                <button
                                                    className="maintenance-asset"
                                                    onClick={() =>
                                                        navigate(
                                                            `/assets/${maintenance.asset._id}`
                                                        )
                                                    }
                                                >
                                                    <Package size={14} />

                                                    <span>
                                                        {maintenance.asset.name}
                                                    </span>
                                                </button>
                                            )}

                                            {maintenance.description && (
                                                <p>
                                                    {maintenance.description}
                                                </p>
                                            )}

                                        </div>

                                    </div>

                                    <div className="maintenance-card-right">

                                        <div className="maintenance-meta">
                                            <div>
                                                <Calendar
                                                    size={15}
                                                />

                                                <span>
                                                    {formatDate(
                                                        maintenance.dueDate
                                                    )}
                                                </span>
                                            </div>


                                            <div className="maintenance-cost">
                                                <IndianRupee
                                                    size={15}
                                                />

                                                <span>
                                                    {formatCost(
                                                        maintenance.estimatedCost
                                                    )}
                                                </span>
                                            </div>
                                        </div>


                                        <div className="maintenance-actions">

                                            <button
                                                className="icon-button secondary-icon-button"
                                                onClick={() =>
                                                    handleEdit(
                                                        maintenance
                                                    )
                                                }
                                                aria-label="Edit maintenance"
                                                title="Edit maintenance"
                                            >
                                                <Pencil size={18} />
                                            </button>

                                            <button
                                                className="icon-button danger-icon-button"
                                                onClick={() =>
                                                    setDeletingMaintenance(
                                                        maintenance
                                                    )
                                                }
                                                aria-label="Delete maintenance"
                                                title="Delete maintenance"
                                            >
                                                <Trash2 size={18} />
                                            </button>

                                        </div>

                                    </div>

                                </div>
                            );
                        }
                    )}

                </div>
            )}
            {showForm && (
                <div className="modal-overlay">

                    <div className="asset-modal">

                        <div className="modal-header">

                            <div>
                                <h2>
                                    {editingMaintenance
                                        ? "Edit maintenance"
                                        : "Add maintenance"}
                                </h2>

                                <p>
                                    {editingMaintenance
                                        ? "Update this maintenance record."
                                        : "Add maintenance for one of your assets."}
                                </p>
                            </div>

                            <button
                                className="modal-close"
                                onClick={
                                    closeForm
                                }
                            >
                                <X size={20} />
                            </button>

                        </div>

                        <form
                            className="asset-form"
                            onSubmit={
                                editingMaintenance
                                    ? handleUpdate
                                    : handleCreate
                            }
                        >

                            {!editingMaintenance && (
                                <div className="form-group">

                                    <label>
                                        Asset
                                    </label>

                                    <select
                                        required
                                        value={
                                            formData.assetId
                                        }
                                        onChange={(event) =>
                                            setFormData({
                                                ...formData,
                                                assetId:
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
                                                    {
                                                        asset.name
                                                    }
                                                </option>
                                            )
                                        )}
                                    </select>

                                </div>
                            )}

                            <div className="form-group">

                                <label>
                                    Maintenance title
                                </label>

                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. AC service"
                                    value={
                                        formData.title
                                    }
                                    onChange={(event) =>
                                        setFormData({
                                            ...formData,
                                            title:
                                                event.target
                                                    .value,
                                        })
                                    }
                                />

                            </div>

                            <div className="form-group">

                                <label>
                                    Description
                                </label>

                                <textarea
                                    rows="3"
                                    placeholder="What needs to be done?"
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

                            <div className="form-group">

                                <label>
                                    Due date
                                </label>

                                <input
                                    type="date"
                                    required
                                    value={
                                        formData.dueDate
                                    }
                                    onChange={(event) =>
                                        setFormData({
                                            ...formData,
                                            dueDate:
                                                event.target
                                                    .value,
                                        })
                                    }
                                />

                            </div>

                            <div className="form-group">

                                <label>
                                    Estimated cost
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    placeholder="e.g. 1500"
                                    value={formData.estimatedCost}
                                    onChange={(event) =>
                                        setFormData({
                                            ...formData,
                                            estimatedCost:
                                                event.target.value,
                                        })
                                    }
                                />

                                <small>
                                    Approximate amount you expect to spend.
                                </small>

                            </div>

                            <div className="form-group">

                                <label>
                                    Notes
                                </label>

                                <textarea
                                    rows="3"
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

                            <div className="modal-actions">

                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={
                                        closeForm
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="primary-button"
                                    disabled={
                                        saving
                                    }
                                >
                                    {saving
                                        ? "Saving..."
                                        : editingMaintenance
                                            ? "Save changes"
                                            : "Add maintenance"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

            {deletingMaintenance && (
                <div className="modal-overlay">

                    <div className="delete-modal">

                        <div className="delete-icon">
                            ⚠
                        </div>

                        <h2>
                            Delete maintenance?
                        </h2>

                        <p>
                            You're about to delete{" "}
                            <strong>
                                {
                                    deletingMaintenance.title
                                }
                            </strong>
                            .
                        </p>

                        <div className="modal-actions">

                            <button
                                className="secondary-button"
                                onClick={() =>
                                    setDeletingMaintenance(
                                        null
                                    )
                                }
                                disabled={
                                    deleting
                                }
                            >
                                Cancel
                            </button>

                            <button
                                className="danger-button"
                                onClick={
                                    handleDelete
                                }
                                disabled={
                                    deleting
                                }
                            >
                                {deleting
                                    ? "Deleting..."
                                    : "Delete maintenance"}
                            </button>

                        </div>

                    </div>

                </div>
            )}

        </div>
    );
}

export default Maintenance;
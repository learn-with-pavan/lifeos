import {
    Home as HomeIcon,
    Plus,
    Search,
    Pencil,
    Trash2,
    X,
    MapPin,
} from "lucide-react";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    createHome,
    getHomes,
    updateHome,
    deleteHome,
} from "../services/homeService";
import { useToast } from "../context/ToastContext";
import LoadingState from "../components/LoadingState";

import "../styles/homes.css";

function Home() {
    const navigate = useNavigate();
    const toast = useToast();

    const [homes, setHomes] = useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [showForm, setShowForm] =
        useState(false);

    const [editingHome, setEditingHome] =
        useState(null);

    const [deletingHome, setDeletingHome] =
        useState(null);

    const [saving, setSaving] =
        useState(false);

    const [deleting, setDeleting] =
        useState(false);

    const [searchTerm, setSearchTerm] =
        useState("");

    const [formData, setFormData] =
        useState({
            name: "",
            type: "HOUSE",
            address: "",
            description: "",
            purchaseDate: "",
        });

    const loadHomes = async () => {
        try {
            setLoading(true);
            setError("");

            const response =
                await getHomes();

            setHomes(
                response.homes || []
            );
        } catch (error) {
            console.error(
                "Failed to load homes:",
                error
            );

            setError(
                "Unable to load homes."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadHomes();
    }, []);

    const resetForm = () => {
        setFormData({
            name: "",
            type: "HOUSE",
            address: "",
            description: "",
            purchaseDate: "",
        });
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingHome(null);
        resetForm();
    };

    const handleCreate = async (event) => {
        event.preventDefault();

        try {
            setSaving(true);
            setError("");

            const response =
                await createHome({
                    ...formData,
                    purchaseDate:
                        formData.purchaseDate ||
                        null,
                });

            setHomes(
                (current) => [
                    response.home,
                    ...current,
                ]
            );

            toast.success("Home created successfully");
            closeForm();
        } catch (error) {
            console.error(
                "Failed to create home:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                "Unable to create home."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (home) => {
        setEditingHome(home);

        setFormData({
            name: home.name || "",
            type: home.type || "HOUSE",
            address: home.address || "",
            description:
                home.description || "",
            purchaseDate:
                home.purchaseDate
                    ? home.purchaseDate
                        .split("T")[0]
                    : "",
        });

        setShowForm(true);
    };

    const handleUpdate = async (event) => {
        event.preventDefault();

        try {
            setSaving(true);
            setError("");

            const response =
                await updateHome(
                    editingHome._id,
                    {
                        ...formData,
                        purchaseDate:
                            formData.purchaseDate ||
                            null,
                    }
                );

            setHomes(
                (current) =>
                    current.map(
                        (home) =>
                            home._id ===
                                editingHome._id
                                ? response.home
                                : home
                    )
            );

            toast.success("Home updated successfully");
            closeForm();
        } catch (error) {
            console.error(
                "Failed to update home:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                "Unable to update home."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        try {
            setDeleting(true);
            setError("");

            await deleteHome(
                deletingHome._id
            );

            setHomes(
                (current) =>
                    current.filter(
                        (home) =>
                            home._id !==
                            deletingHome._id
                    )
            );

            toast.success("Home deleted successfully");
            setDeletingHome(null);
        } catch (error) {
            console.error(
                "Failed to delete home:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                "Unable to delete home."
            );
        } finally {
            setDeleting(false);
        }
    };

    const filteredHomes =
        homes.filter((home) => {
            const search =
                searchTerm
                    .trim()
                    .toLowerCase();

            if (!search) {
                return true;
            }

            return (
                home.name
                    ?.toLowerCase()
                    .includes(search) ||
                home.type
                    ?.toLowerCase()
                    .includes(search) ||
                home.address
                    ?.toLowerCase()
                    .includes(search)
            );
        });

    const formatType = (type) => {
        const types = {
            HOUSE: "House",
            APARTMENT: "Apartment",
            VILLA: "Villa",
            OTHER: "Other",
        };

        return (
            types[type] || type
        );
    };

    const formatDate = (date) => {
        if (!date) {
            return "";
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

    return (
        <div className="home-page">

            {/* PAGE HEADER */}

            <div className="page-title-row">

                <div>
                    <h1>
                        Home Management
                    </h1>

                    <p>
                        Organize your homes and
                        everything you own inside them.
                    </p>
                </div>

                <button
                    className="primary-button"
                    onClick={() => {
                        resetForm();
                        setEditingHome(null);
                        setShowForm(true);
                    }}
                >
                    <Plus size={18} />
                    Add home
                </button>

            </div>


            {/* ERROR */}

            {error && (
                <div className="home-error">
                    {error}
                </div>
            )}

            {/* SEARCH */}

            {!loading &&
                homes.length > 0 && (
                    <div className="home-toolbar">

                        <div className="home-search">

                            <Search
                                size={18}
                            />

                            <input
                                type="text"
                                placeholder="Search homes..."
                                value={
                                    searchTerm
                                }
                                onChange={(
                                    event
                                ) =>
                                    setSearchTerm(
                                        event
                                            .target
                                            .value
                                    )
                                }
                            />

                        </div>

                    </div>
                )}


            {/* CONTENT */}

            {loading ? (

                <LoadingState
                    title="Loading homes"
                    message="We're retrieving your homes and assets."
                />

            ) : homes.length === 0 ? (

                <div className="home-empty-state">

                    <div className="home-empty-icon">
                        <HomeIcon size={28} />
                    </div>

                    <h2>
                        No homes yet
                    </h2>

                    <p>
                        Add your first home to
                        start organizing your
                        assets, maintenance,
                        documents and service
                        history.
                    </p>

                    <button
                        className="primary-button"
                        onClick={() => {
                            resetForm();
                            setShowForm(true);
                        }}
                    >
                        <Plus size={18} />
                        Add your first home
                    </button>

                </div>

            ) : filteredHomes.length === 0 ? (

                <div className="home-empty-state">

                    <div className="home-empty-icon">
                        <Search size={28} />
                    </div>

                    <h2>
                        No matching homes
                    </h2>

                    <p>
                        We couldn't find any
                        homes matching your search.
                    </p>

                    <button
                        className="secondary-button"
                        onClick={() =>
                            setSearchTerm("")
                        }
                    >
                        Clear search
                    </button>

                </div>

            ) : (

                <div className="home-list">

                    {filteredHomes.map(
                        (home) => (

                            <div
                                className="home-card"
                                key={home._id}
                                onClick={() =>
                                    navigate(`/homes/${home._id}`)
                                }
                            >

                                <div className="home-card-main">

                                    <div className="home-card-icon">
                                        <HomeIcon
                                            size={21}
                                        />
                                    </div>

                                    <div className="home-card-info">

                                        <div className="home-title-row">
                                            <h3>{home.name}</h3>

                                            <span className="home-status home-status-type">
                                                {formatType(home.type)}
                                            </span>
                                        </div>

                                        {home.address && (
                                            <p>
                                                <MapPin
                                                    size={13}
                                                    style={{
                                                        verticalAlign:
                                                            "middle",
                                                        marginRight:
                                                            "5px",
                                                    }}
                                                />
                                                {
                                                    home.address
                                                }
                                            </p>
                                        )}

                                    </div>

                                </div>


                                <div className="home-card-right">

                                    {home.purchaseDate && (
                                        <span className="home-status home-status-date">
                                            Since{" "}
                                            {formatDate(
                                                home.purchaseDate
                                            )}
                                        </span>
                                    )}

                                    <div className="home-actions">

                                        <button
                                            className="icon-button secondary-icon-button"
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                handleEdit(home);
                                            }}
                                            aria-label="Edit home"
                                            title="Edit home"
                                        >
                                            <Pencil
                                                size={18}
                                            />
                                        </button>

                                        <button
                                            className="icon-button danger-icon-button"
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                setDeletingHome(home);
                                            }}
                                            aria-label="Delete home"
                                            title="Delete home"
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

                <div className="home-modal-overlay">

                    <div className="home-modal">

                        <div className="home-modal-header">

                            <div>
                                <h2>
                                    {editingHome
                                        ? "Edit home"
                                        : "Add home"}
                                </h2>

                                <p>
                                    Add the details of
                                    your home.
                                </p>
                            </div>

                            <button
                                className="home-modal-close"
                                onClick={
                                    closeForm
                                }
                            >
                                <X size={20} />
                            </button>

                        </div>


                        <form
                            className="home-form"
                            onSubmit={
                                editingHome
                                    ? handleUpdate
                                    : handleCreate
                            }
                        >

                            <div className="home-form-body">

                                <div className="home-form-group">

                                    <label>
                                        Home name
                                    </label>

                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. My Home"
                                        value={
                                            formData.name
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setFormData({
                                                ...formData,
                                                name:
                                                    event
                                                        .target
                                                        .value,
                                            })
                                        }
                                    />

                                </div>


                                <div className="home-form-group">

                                    <label>
                                        Home type
                                    </label>

                                    <select
                                        value={
                                            formData.type
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setFormData({
                                                ...formData,
                                                type:
                                                    event
                                                        .target
                                                        .value,
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


                                <div className="home-form-group">

                                    <label>
                                        Address
                                    </label>

                                    <textarea
                                        placeholder="Enter home address"
                                        value={
                                            formData.address
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setFormData({
                                                ...formData,
                                                address:
                                                    event
                                                        .target
                                                        .value,
                                            })
                                        }
                                    />

                                </div>


                                <div className="home-form-group">

                                    <label>
                                        Purchase date
                                    </label>

                                    <input
                                        type="date"
                                        value={
                                            formData.purchaseDate
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setFormData({
                                                ...formData,
                                                purchaseDate:
                                                    event
                                                        .target
                                                        .value,
                                            })
                                        }
                                    />

                                </div>


                                <div className="home-form-group">

                                    <label>
                                        Description
                                    </label>

                                    <textarea
                                        placeholder="Additional details about this home"
                                        value={
                                            formData.description
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setFormData({
                                                ...formData,
                                                description:
                                                    event
                                                        .target
                                                        .value,
                                            })
                                        }
                                    />

                                </div>


                            </div>

                            <div className="home-modal-actions">

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
                                        : editingHome
                                            ? "Save changes"
                                            : "Add home"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}


            {/* DELETE MODAL */}

            {deletingHome && (

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
                                {
                                    deletingHome.name
                                }
                            </strong>
                            .
                        </p>

                        <div className="modal-actions">

                            <button
                                className="secondary-button"
                                onClick={() =>
                                    setDeletingHome(
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
                                    : "Delete home"}
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}

export default Home;
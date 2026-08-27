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


const INITIAL_FORM = {
    name: "",
    type: "HOUSE",
    ownership: "OWNED",

    address: {
        line1: "",
        line2: "",
        city: "",
        state: "",
        pincode: "",
    },

    description: "",
    purchaseDate: "",
};


function Home() {

    const navigate = useNavigate();
    const toast = useToast();

    const [homes, setHomes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [editingHome, setEditingHome] = useState(null);
    const [deletingHome, setDeletingHome] = useState(null);

    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [searchTerm, setSearchTerm] = useState("");

    const [formData, setFormData] =
        useState(INITIAL_FORM);


    /* ================================
       LOAD HOMES
    ================================= */

    const loadHomes = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await getHomes();

            setHomes(response.homes || []);

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


    /* ================================
       FORM HELPERS
    ================================= */

    const resetForm = () => {
        setFormData({
            ...INITIAL_FORM,
            address: {
                ...INITIAL_FORM.address,
            },
        });
    };


    const closeForm = () => {
        setShowForm(false);
        setEditingHome(null);
        resetForm();
    };


    const updateField = (field, value) => {
        setFormData((current) => ({
            ...current,
            [field]: value,
        }));
    };


    const updateAddress = (field, value) => {
        setFormData((current) => ({
            ...current,
            address: {
                ...current.address,
                [field]: value,
            },
        }));
    };


    /* ================================
       CREATE
    ================================= */

    const handleCreate = async (event) => {

        event.preventDefault();

        try {

            setSaving(true);
            setError("");

            const response = await createHome({
                ...formData,
                purchaseDate:
                    formData.purchaseDate || null,
            });

            setHomes((current) => [
                response.home,
                ...current,
            ]);

            toast.success(
                "Home created successfully"
            );

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


    /* ================================
       EDIT
    ================================= */

    const handleEdit = (home) => {

        setEditingHome(home);

        setFormData({
            name: home.name || "",
            type: home.type || "HOUSE",
            ownership:
                home.ownership || "OWNED",

            address: {
                line1:
                    home.address?.line1 || "",

                line2:
                    home.address?.line2 || "",

                city:
                    home.address?.city || "",

                state:
                    home.address?.state || "",

                pincode:
                    home.address?.pincode || "",
            },

            description:
                home.description || "",

            purchaseDate:
                home.purchaseDate
                    ? home.purchaseDate.split("T")[0]
                    : "",
        });

        setShowForm(true);
    };


    const handleUpdate = async (event) => {

        event.preventDefault();

        try {

            setSaving(true);
            setError("");

            const response = await updateHome(
                editingHome._id,
                {
                    ...formData,
                    purchaseDate:
                        formData.purchaseDate || null,
                }
            );

            setHomes((current) =>
                current.map((home) =>
                    home._id === editingHome._id
                        ? response.home
                        : home
                )
            );

            toast.success(
                "Home updated successfully"
            );

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


    /* ================================
       DELETE
    ================================= */

    const handleDelete = async () => {

        try {

            setDeleting(true);
            setError("");

            await deleteHome(
                deletingHome._id
            );

            setHomes((current) =>
                current.filter(
                    (home) =>
                        home._id !==
                        deletingHome._id
                )
            );

            toast.success(
                "Home deleted successfully"
            );

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


    /* ================================
       SEARCH
    ================================= */

    const filteredHomes =
        homes.filter((home) => {

            const search =
                searchTerm
                    .trim()
                    .toLowerCase();

            if (!search) {
                return true;
            }

            const address =
                home.address || {};

            return (
                home.name
                    ?.toLowerCase()
                    .includes(search) ||

                home.type
                    ?.toLowerCase()
                    .includes(search) ||

                home.ownership
                    ?.toLowerCase()
                    .includes(search) ||

                address.line1
                    ?.toLowerCase()
                    .includes(search) ||

                address.city
                    ?.toLowerCase()
                    .includes(search) ||

                address.state
                    ?.toLowerCase()
                    .includes(search) ||

                address.pincode
                    ?.toLowerCase()
                    .includes(search)
            );
        });


    /* ================================
       FORMATTERS
    ================================= */

    const formatType = (type) => {

        const types = {
            HOUSE: "House",
            APARTMENT: "Apartment",
            VILLA: "Villa",
            OTHER: "Other",
        };

        return types[type] || type;
    };


    const formatOwnership = (ownership) => {

        const values = {
            OWNED: "Owned",
            RENTED: "Rented",
            LEASED: "Leased",
            OTHER: "Other",
        };

        return (
            values[ownership] ||
            ownership
        );
    };


    const formatDate = (date) => {

        if (!date) {
            return "";
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


    const formatAddress = (address) => {

        if (!address) {
            return "";
        }

        return [
            address.line1,
            address.line2,
            address.city,
            address.state,
            address.pincode,
        ]
            .filter(Boolean)
            .join(", ");
    };


    /* ================================
       RENDER
    ================================= */

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
                    type="button"
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

                            <Search size={18} />

                            <input
                                type="text"
                                placeholder="Search homes..."
                                value={searchTerm}
                                onChange={(event) =>
                                    setSearchTerm(
                                        event.target.value
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
                        type="button"
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
                        type="button"
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
                                    navigate(
                                        `/homes/${home._id}`
                                    )
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

                                            <h3>
                                                {home.name}
                                            </h3>

                                            <span className="home-status home-status-type">
                                                {formatType(
                                                    home.type
                                                )}
                                            </span>

                                        </div>


                                        {formatAddress(
                                            home.address
                                        ) && (

                                                <p>

                                                    <MapPin
                                                        size={13}
                                                    />

                                                    {formatAddress(
                                                        home.address
                                                    )}

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
                                            type="button"
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
                                            type="button"
                                            className="icon-button danger-icon-button"
                                            onClick={(event) => {

                                                event.stopPropagation();

                                                setDeletingHome(
                                                    home
                                                );

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


            {/* ================================
                ADD / EDIT MODAL
            ================================= */}

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
                                type="button"
                                className="home-modal-close"
                                onClick={closeForm}
                                aria-label="Close"
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

                                {/* HOME NAME */}

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
                                        onChange={(event) =>
                                            updateField(
                                                "name",
                                                event.target.value
                                            )
                                        }
                                    />

                                </div>


                                {/* HOME TYPE */}

                                <div className="home-form-group">

                                    <label>
                                        Home type
                                    </label>

                                    <select
                                        value={
                                            formData.type
                                        }
                                        onChange={(event) =>
                                            updateField(
                                                "type",
                                                event.target.value
                                            )
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


                                {/* OWNERSHIP */}

                                <div className="home-form-group">

                                    <label>
                                        Ownership
                                    </label>

                                    <select
                                        value={
                                            formData.ownership
                                        }
                                        onChange={(event) =>
                                            updateField(
                                                "ownership",
                                                event.target.value
                                            )
                                        }
                                    >

                                        <option value="OWNED">
                                            Owned
                                        </option>

                                        <option value="RENTED">
                                            Rented
                                        </option>

                                        <option value="LEASED">
                                            Leased
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

                                    <input
                                        type="text"
                                        placeholder="Address line 1"
                                        value={
                                            formData.address.line1
                                        }
                                        onChange={(event) =>
                                            updateAddress(
                                                "line1",
                                                event.target.value
                                            )
                                        }
                                    />

                                </div>


                                <div className="home-form-group">

                                    <input
                                        type="text"
                                        placeholder="Address line 2 (optional)"
                                        value={
                                            formData.address.line2
                                        }
                                        onChange={(event) =>
                                            updateAddress(
                                                "line2",
                                                event.target.value
                                            )
                                        }
                                    />

                                </div>


                                {/* CITY + STATE */}

                                <div className="home-form-row">

                                    <div className="home-form-group">

                                        <label>
                                            City
                                        </label>

                                        <input
                                            type="text"
                                            placeholder="e.g. Vijayawada"
                                            value={
                                                formData.address.city
                                            }
                                            onChange={(event) =>
                                                updateAddress(
                                                    "city",
                                                    event.target.value
                                                )
                                            }
                                        />

                                    </div>


                                    <div className="home-form-group">

                                        <label>
                                            State
                                        </label>

                                        <input
                                            type="text"
                                            placeholder="e.g. Andhra Pradesh"
                                            value={
                                                formData.address.state
                                            }
                                            onChange={(event) =>
                                                updateAddress(
                                                    "state",
                                                    event.target.value
                                                )
                                            }
                                        />

                                    </div>

                                </div>


                                {/* PINCODE */}

                                <div className="home-form-group">

                                    <label>
                                        Pincode
                                    </label>

                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={6}
                                        placeholder="e.g. 520010"
                                        value={
                                            formData.address.pincode
                                        }
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
                                            updateField(
                                                "purchaseDate",
                                                event.target.value
                                            )
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
                                            updateField(
                                                "description",
                                                event.target.value
                                            )
                                        }
                                    />

                                </div>

                            </div>


                            {/* ACTIONS */}

                            <div className="home-modal-actions">

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
                                        : editingHome
                                            ? "Save changes"
                                            : "Add home"}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}


            {/* ================================
                DELETE MODAL
            ================================= */}

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
                                {deletingHome.name}
                            </strong>

                            .

                        </p>


                        <div className="modal-actions">

                            <button
                                type="button"
                                className="secondary-button"
                                onClick={() =>
                                    setDeletingHome(
                                        null
                                    )
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
}

export default Home;
import { useEffect, useMemo, useState } from "react";
import {
    Package,
    Plus,
    X,
    Search,
    SlidersHorizontal,
    MapPin
} from "lucide-react";

import {
    createAsset,
    getAssets,
} from "../services/assetService";

import {
    getHomes,
} from "../services/homeService";

import { useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import LoadingState from "../components/LoadingState";

function Assets() {
    const navigate = useNavigate();
    const toast = useToast();

    const [showForm, setShowForm] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        category: "",
        brand: "",
        model: "",
        purchaseDate: "",
        purchasePrice: "",
        notes: "",
        home: "",
    });

    const [loading, setLoading] = useState(false);

    const [message, setMessage] = useState("");

    const [assets, setAssets] = useState([]);

    const [homes, setHomes] = useState([]);

    const [loadingAssets, setLoadingAssets] =
        useState(true);

    const [loadingHomes, setLoadingHomes] =
        useState(true);

    const [search, setSearch] = useState("");

    const [categoryFilter, setCategoryFilter] =
        useState("ALL");

    const [sortBy, setSortBy] =
        useState("NEWEST");

    useEffect(() => {
        const loadAssets = async () => {
            try {
                const data = await getAssets();

                setAssets(data.assets || []);
            } catch (error) {
                console.error(
                    "Failed to load assets",
                    error
                );
            } finally {
                setLoadingAssets(false);
            }
        };

        loadAssets();
    }, []);

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

    const resetForm = () => {
        setFormData({
            name: "",
            category: "",
            brand: "",
            model: "",
            purchaseDate: "",
            purchasePrice: "",
            notes: "",
            home: "",
        });

        setMessage("");
    };

    const closeForm = () => {
        setShowForm(false);
        resetForm();
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            setLoading(true);
            setMessage("");

            const data = await createAsset({
                ...formData,

                purchasePrice:
                    formData.purchasePrice
                        ? Number(
                            formData.purchasePrice
                        )
                        : undefined,

                // Send null when no home is selected.
                home:
                    formData.home || null,
            });

            setAssets((currentAssets) => [
                data.asset,
                ...currentAssets,
            ]);

            toast.success(data.message || "Asset created successfully");

            resetForm();
            setShowForm(false);

        } catch (error) {
            console.error(
                "Failed to create asset:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                "Failed to create asset"
            );
        } finally {
            setLoading(false);
        }
    };

    const filteredAssets = useMemo(() => {
        let result = [...assets];

        const searchValue =
            search.trim().toLowerCase();

        // Search
        if (searchValue) {
            result = result.filter((asset) => {
                return (
                    asset.name
                        ?.toLowerCase()
                        .includes(searchValue) ||

                    asset.category
                        ?.toLowerCase()
                        .includes(searchValue) ||

                    asset.brand
                        ?.toLowerCase()
                        .includes(searchValue) ||

                    asset.model
                        ?.toLowerCase()
                        .includes(searchValue) ||

                    asset.home?.name
                        ?.toLowerCase()
                        .includes(searchValue)
                );
            });
        }

        // Category filter
        if (categoryFilter !== "ALL") {
            result = result.filter(
                (asset) =>
                    asset.category ===
                    categoryFilter
            );
        }

        // Sorting
        result.sort((a, b) => {
            switch (sortBy) {
                case "NAME_ASC":
                    return (
                        a.name || ""
                    ).localeCompare(
                        b.name || ""
                    );

                case "NAME_DESC":
                    return (
                        b.name || ""
                    ).localeCompare(
                        a.name || ""
                    );

                case "OLDEST":
                    return (
                        new Date(
                            a.createdAt || 0
                        ) -
                        new Date(
                            b.createdAt || 0
                        )
                    );

                case "NEWEST":
                default:
                    return (
                        new Date(
                            b.createdAt || 0
                        ) -
                        new Date(
                            a.createdAt || 0
                        )
                    );
            }
        });

        return result;
    }, [
        assets,
        search,
        categoryFilter,
        sortBy,
    ]);

    const clearAssetFilters = () => {
        setSearch("");
        setCategoryFilter("ALL");
        setSortBy("NEWEST");
    };

    return (
        <div className="assets-page">

            {/* Page Header */}
            <div className="page-title-row">

                <div>
                    <h1>
                        My Assets
                    </h1>

                    <p>
                        Keep track of the important things you own.
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
                    Add asset
                </button>

            </div>


            {/* Toolbar */}
            <div className="assets-toolbar">

                <div className="assets-search">

                    <Search size={18} />

                    <input
                        type="text"
                        placeholder="Search assets or homes..."
                        value={search}
                        onChange={(event) =>
                            setSearch(event.target.value)
                        }
                    />

                </div>


                <div className="assets-filter">

                    <SlidersHorizontal size={17} />

                    <select
                        value={categoryFilter}
                        onChange={(event) =>
                            setCategoryFilter(event.target.value)
                        }
                    >

                        <option value="ALL">
                            All categories
                        </option>

                        <option value="Electronics">
                            Electronics
                        </option>

                        <option value="Appliance">
                            Appliance
                        </option>

                        <option value="Vehicle">
                            Vehicle
                        </option>

                        <option value="Furniture">
                            Furniture
                        </option>

                        <option value="Other">
                            Other
                        </option>

                    </select>

                </div>


                <select
                    className="assets-sort"
                    value={sortBy}
                    onChange={(event) =>
                        setSortBy(event.target.value)
                    }
                >

                    <option value="NEWEST">
                        Newest
                    </option>

                    <option value="OLDEST">
                        Oldest
                    </option>

                    <option value="NAME_ASC">
                        Name A–Z
                    </option>

                    <option value="NAME_DESC">
                        Name Z–A
                    </option>

                </select>

            </div>


            {/* Asset Content */}

            {loadingAssets ? (

                <LoadingState
                    title="Loading assets"
                    message="We're retrieving your assets."
                />

            ) : assets.length === 0 ? (

                <div className="assets-empty-state">

                    <div className="assets-empty-icon">
                        <Package size={28} />
                    </div>

                    <h2>
                        No assets yet
                    </h2>

                    <p>
                        Add your laptop, phone, vehicle,
                        appliances, or anything else you
                        want LifeOS to keep track of.
                    </p>

                    <button
                        className="primary-button"
                        onClick={() => {
                            resetForm();
                            setShowForm(true);
                        }}
                    >
                        <Plus size={18} />
                        Add your first asset
                    </button>

                </div>

            ) : filteredAssets.length === 0 ? (

                <div className="assets-empty-state">

                    <div className="assets-empty-icon">
                        <Search size={28} />
                    </div>

                    <h2>
                        No matching assets
                    </h2>

                    <p>
                        We couldn't find any assets
                        matching your search or filters.
                    </p>

                    <button
                        className="secondary-button"
                        onClick={clearAssetFilters}
                    >
                        Clear filters
                    </button>

                </div>

            ) : (

                <div className="assets-grid">

                    {filteredAssets.map((asset) => {

                        const assetHome =
                            typeof asset.home === "object"
                                ? asset.home
                                : homes.find(
                                    (home) =>
                                        home._id === asset.home
                                );

                        return (
                            <div
                                className="asset-card"
                                key={asset._id}
                                onClick={() =>
                                    navigate(
                                        `/assets/${asset._id}`
                                    )
                                }
                            >

                                {/* Asset Icon */}

                                <div className="asset-card-icon">
                                    <Package size={22} />
                                </div>


                                {/* Asset Content */}

                                <div className="asset-card-content">

                                    <h3>
                                        {asset.name}
                                    </h3>


                                    <span className="asset-category">
                                        {asset.category}
                                    </span>


                                    {(
                                        asset.brand ||
                                        asset.model
                                    ) && (
                                            <p>
                                                {asset.brand || ""}

                                                {asset.brand &&
                                                    asset.model
                                                    ? " · "
                                                    : ""}

                                                {asset.model || ""}
                                            </p>
                                        )}


                                    {/* Home */}

                                    <span className="asset-home">

                                        <MapPin size={13} />

                                        {assetHome?.name ||
                                            "No home assigned"}

                                    </span>

                                </div>

                            </div>
                        );
                    })}

                </div>

            )}


            {/* Add Asset Modal */}

            {showForm && (

                <div className="modal-overlay">

                    <div className="asset-modal">

                        <div className="modal-header">

                            <div>

                                <h2>
                                    Add asset
                                </h2>

                                <p>
                                    Add something important
                                    that you own.
                                </p>

                            </div>

                            <button
                                className="modal-close"
                                onClick={closeForm}
                                type="button"
                            >
                                <X size={20} />
                            </button>

                        </div>


                        {message && (
                            <p
                                style={{
                                    marginBottom: "20px",
                                    color: "#334155",
                                    fontSize: "13px",
                                }}
                            >
                                {message}
                            </p>
                        )}


                        <form
                            className="asset-form"
                            onSubmit={handleSubmit}
                        >

                            {/* Asset Name */}

                            <div className="form-group">

                                <label>
                                    Asset name
                                </label>

                                <input
                                    type="text"
                                    placeholder="e.g. MacBook Pro"
                                    required
                                    value={formData.name}
                                    onChange={(event) =>
                                        setFormData({
                                            ...formData,
                                            name:
                                                event.target.value,
                                        })
                                    }
                                />

                            </div>


                            {/* Home */}

                            <div className="form-group">

                                <label>
                                    Home
                                </label>

                                <select
                                    value={formData.home}
                                    onChange={(event) =>
                                        setFormData({
                                            ...formData,
                                            home:
                                                event.target.value,
                                        })
                                    }
                                    disabled={loadingHomes}
                                >

                                    <option value="">
                                        {loadingHomes
                                            ? "Loading homes..."
                                            : "No home / Select later"}
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

                                <small>
                                    You can assign this asset
                                    to a home now or later.
                                </small>

                            </div>


                            {/* Category */}

                            <div className="form-group">

                                <label>
                                    Category
                                </label>

                                <select
                                    required
                                    value={formData.category}
                                    onChange={(event) =>
                                        setFormData({
                                            ...formData,
                                            category:
                                                event.target.value,
                                        })
                                    }
                                >

                                    <option
                                        value=""
                                        disabled
                                    >
                                        Select category
                                    </option>

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


                            {/* Brand + Model */}

                            <div className="form-row">

                                <div className="form-group">

                                    <label>
                                        Brand
                                    </label>

                                    <input
                                        type="text"
                                        placeholder="e.g. Apple"
                                        value={formData.brand}
                                        onChange={(event) =>
                                            setFormData({
                                                ...formData,
                                                brand:
                                                    event.target.value,
                                            })
                                        }
                                    />

                                </div>


                                <div className="form-group">

                                    <label>
                                        Model
                                    </label>

                                    <input
                                        type="text"
                                        placeholder="e.g. M4"
                                        value={formData.model}
                                        onChange={(event) =>
                                            setFormData({
                                                ...formData,
                                                model:
                                                    event.target.value,
                                            })
                                        }
                                    />

                                </div>

                            </div>


                            {/* Purchase Date + Price */}

                            <div className="form-row">

                                <div className="form-group">

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


                                <div className="form-group">

                                    <label>
                                        Purchase price
                                    </label>

                                    <input
                                        type="number"
                                        min="0"
                                        placeholder="₹ 0"
                                        value={
                                            formData.purchasePrice
                                        }
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


                            {/* Notes */}

                            <div className="form-group">

                                <label>
                                    Notes
                                </label>

                                <textarea
                                    placeholder="Anything important about this asset..."
                                    rows="3"
                                    value={formData.notes}
                                    onChange={(event) =>
                                        setFormData({
                                            ...formData,
                                            notes:
                                                event.target.value,
                                        })
                                    }
                                />

                            </div>


                            {/* Actions */}

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
                                    disabled={loading}
                                >
                                    {loading
                                        ? "Saving..."
                                        : "Save asset"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
}

export default Assets;
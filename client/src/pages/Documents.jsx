import { useEffect, useState } from "react";
import {
    FileText,
    Plus,
    ExternalLink,
    Pencil,
    Trash2,
    X,
    Search,
    SlidersHorizontal,
} from "lucide-react";

import {
    getDocuments,
    createDocument,
    updateDocument,
    deleteDocument,
} from "../services/documentService";

import { getAssets } from "../services/assetService";
import { useToast } from "../context/ToastContext";
import LoadingState from "../components/LoadingState";

function Documents() {
    const toast = useToast();

    const [documents, setDocuments] = useState([]);
    const [assets, setAssets] = useState([]);

    const [loading, setLoading] = useState(true);

    const [showForm, setShowForm] = useState(false);

    const [editingDocument, setEditingDocument] =
        useState(null);

    const [deletingDocument, setDeletingDocument] =
        useState(null);

    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [formData, setFormData] = useState({
        asset: "",
        type: "INVOICE",
        name: "",
        fileUrl: "",
    });

    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("ALL");

    const loadData = async () => {
        try {
            setLoading(true);

            const [
                documentsResponse,
                assetsResponse,
            ] = await Promise.all([
                getDocuments(),
                getAssets(),
            ]);

            setDocuments(
                documentsResponse.documents || []
            );

            setAssets(
                assetsResponse.assets || []
            );

        } catch (error) {
            console.error(
                "Failed to load documents",
                error
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
            asset: "",
            type: "INVOICE",
            name: "",
            fileUrl: "",
        });
    };


    const handleCreate = async (event) => {
        event.preventDefault();

        try {
            setSaving(true);

            const data =
                await createDocument(formData);

            setDocuments((current) => [
                data.document,
                ...current,
            ]);

            resetForm();
            setShowForm(false);
            toast.success("Document created successfully");

        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Failed to create document"
            );
        } finally {
            setSaving(false);
        }
    };


    const handleEdit = (document) => {

        setFormData({
            asset:
                document.asset?._id ||
                document.asset ||
                "",

            type: document.type,

            name: document.name,

            fileUrl: document.fileUrl,
        });

        setEditingDocument(document);
    };


    const handleUpdate = async (event) => {
        event.preventDefault();

        try {
            setSaving(true);

            const data =
                await updateDocument(
                    editingDocument._id,
                    formData
                );

            setDocuments((current) =>
                current.map((item) =>
                    item._id ===
                        editingDocument._id
                        ? data.document
                        : item
                )
            );

            setEditingDocument(null);
            resetForm();
            toast.success("Document updated successfully");

        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Failed to update document"
            );
        } finally {
            setSaving(false);
        }
    };


    const handleDelete = async () => {
        try {
            setDeleting(true);

            await deleteDocument(
                deletingDocument._id
            );

            setDocuments((current) =>
                current.filter(
                    (item) =>
                        item._id !==
                        deletingDocument._id
                )
            );

            setDeletingDocument(null);
            toast.success("Document deleted successfully");

        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Failed to delete document"
            );
        } finally {
            setDeleting(false);
        }
    };


    const closeModal = () => {
        setShowForm(false);
        setEditingDocument(null);
        resetForm();
    };

    const filteredDocuments = documents.filter(
        (document) => {
            const search =
                searchTerm.trim().toLowerCase();

            const matchesSearch =
                !search ||
                document.name
                    ?.toLowerCase()
                    .includes(search) ||
                document.asset?.name
                    ?.toLowerCase()
                    .includes(search);

            const matchesType =
                typeFilter === "ALL" ||
                document.type === typeFilter;

            return (
                matchesSearch &&
                matchesType
            );
        }
    );

    const clearDocumentFilters = () => {
        setSearchTerm("");
        setTypeFilter("ALL");
    };

    return (
        <div className="documents-page">

            <div className="page-title-row">

                <div>
                    <h1>Documents</h1>

                    <p>
                        Keep all your important
                        asset documents in one place.
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
                    Add document
                </button>

            </div>

            <div className="documents-toolbar">

                <div className="documents-search">

                    <Search size={18} />

                    <input
                        type="text"
                        placeholder="Search documents or assets..."
                        value={searchTerm}
                        onChange={(event) =>
                            setSearchTerm(event.target.value)
                        }
                    />

                </div>

                <div className="documents-filter">

                    <SlidersHorizontal size={17} />

                    <select
                        value={typeFilter}
                        onChange={(event) =>
                            setTypeFilter(event.target.value)
                        }
                    >
                        <option value="ALL">
                            All types
                        </option>

                        <option value="INVOICE">
                            Invoice
                        </option>

                        <option value="WARRANTY_CARD">
                            Warranty Card
                        </option>

                        <option value="SERVICE_RECEIPT">
                            Service Receipt
                        </option>

                        <option value="INSURANCE">
                            Insurance
                        </option>

                        <option value="OTHER">
                            Other
                        </option>
                    </select>

                </div>

            </div>

            {loading ? (

                <LoadingState
                    title="Loading documents"
                    message="We're retrieving your important records."
                />

            ) : documents.length === 0 ? (

                <div className="documents-empty-state">

                    <div className="documents-empty-icon">
                        <FileText size={28} />
                    </div>

                    <h2>
                        No documents yet
                    </h2>

                    <p>
                        Add invoices, warranty cards,
                        insurance documents and other
                        important files.
                    </p>

                    <button
                        className="primary-button"
                        onClick={() => {
                            resetForm();
                            setShowForm(true);
                        }}
                    >
                        <Plus size={18} />
                        Add your first document
                    </button>

                </div>

            ) : filteredDocuments.length === 0 ? (

                <div className="documents-empty-state">

                    <div className="documents-empty-icon">
                        <Search size={28} />
                    </div>

                    <h2>
                        No matching documents
                    </h2>

                    <p>
                        We couldn't find any documents
                        matching your search or filter.
                    </p>

                    <button
                        className="secondary-button"
                        onClick={clearDocumentFilters}
                    >
                        Clear filters
                    </button>

                </div>

            ) : (

                <div className="documents-master-list">

                    {filteredDocuments.map(
                        (document) => (

                            <div
                                className="document-master-card"
                                key={document._id}
                            >

                                <div className="document-master-icon">

                                    <FileText size={22} />

                                </div>

                                <div className="document-master-info">

                                    <div className="document-title-row">

                                        <h3>
                                            {document.name}
                                        </h3>

                                        <span className="document-type-badge">
                                            {document.type}
                                        </span>

                                    </div>

                                    <p>
                                        {document.asset?.name ||
                                            "Asset unavailable"}
                                    </p>

                                </div>

                                <div className="document-master-actions">

                                    <a
                                        href={document.fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="icon-button secondary-icon-button"
                                        aria-label="View document"
                                        title="View document"
                                    >
                                        <ExternalLink size={18} />
                                    </a>

                                    <button
                                        className="icon-button secondary-icon-button"
                                        onClick={() =>
                                            handleEdit(document)
                                        }
                                        aria-label="Edit document"
                                        title="Edit document"
                                    >
                                        <Pencil size={18} />
                                    </button>

                                    <button
                                        className="icon-button danger-icon-button"
                                        onClick={() =>
                                            setDeletingDocument(
                                                document
                                            )
                                        }
                                        aria-label="Delete document"
                                        title="Delete document"
                                    >
                                        <Trash2 size={18} />
                                    </button>

                                </div>

                            </div>

                        )
                    )}

                </div>

            )}

            {(showForm ||
                editingDocument) && (

                    <div className="modal-overlay">

                        <div className="asset-modal">

                            <div className="modal-header">

                                <div>
                                    <h2>
                                        {editingDocument
                                            ? "Edit document"
                                            : "Add document"}
                                    </h2>

                                    <p>
                                        Add an important
                                        document to an asset.
                                    </p>
                                </div>

                                <button
                                    className="modal-close"
                                    onClick={closeModal}
                                >
                                    <X size={20} />
                                </button>

                            </div>


                            <form
                                className="asset-form"
                                onSubmit={
                                    editingDocument
                                        ? handleUpdate
                                        : handleCreate
                                }
                            >

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


                                <div className="form-group">

                                    <label>
                                        Document type
                                    </label>

                                    <select
                                        value={
                                            formData.type
                                        }
                                        onChange={(event) =>
                                            setFormData({
                                                ...formData,
                                                type:
                                                    event.target
                                                        .value,
                                            })
                                        }
                                    >
                                        <option value="INVOICE">
                                            Invoice
                                        </option>

                                        <option value="WARRANTY_CARD">
                                            Warranty Card
                                        </option>

                                        <option value="SERVICE_RECEIPT">
                                            Service Receipt
                                        </option>

                                        <option value="INSURANCE">
                                            Insurance
                                        </option>

                                        <option value="OTHER">
                                            Other
                                        </option>
                                    </select>

                                </div>


                                <div className="form-group">

                                    <label>
                                        Document name
                                    </label>

                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Samsung AC Invoice"
                                        value={
                                            formData.name
                                        }
                                        onChange={(event) =>
                                            setFormData({
                                                ...formData,
                                                name:
                                                    event.target
                                                        .value,
                                            })
                                        }
                                    />

                                </div>


                                <div className="form-group">

                                    <label>
                                        File URL
                                    </label>

                                    <input
                                        type="url"
                                        required
                                        placeholder="https://example.com/file.pdf"
                                        value={
                                            formData.fileUrl
                                        }
                                        onChange={(event) =>
                                            setFormData({
                                                ...formData,
                                                fileUrl:
                                                    event.target
                                                        .value,
                                            })
                                        }
                                    />

                                    <small>
                                        File upload will be
                                        added later.
                                    </small>

                                </div>


                                <div className="modal-actions">

                                    <button
                                        type="button"
                                        className="secondary-button"
                                        onClick={
                                            closeModal
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
                                            : editingDocument
                                                ? "Save changes"
                                                : "Add document"}
                                    </button>

                                </div>

                            </form>

                        </div>

                    </div>
                )}


            {deletingDocument && (

                <div className="modal-overlay">

                    <div className="delete-modal">

                        <div className="delete-icon">
                            ⚠
                        </div>

                        <h2>
                            Delete document?
                        </h2>

                        <p>
                            You're about to delete{" "}
                            <strong>
                                {
                                    deletingDocument.name
                                }
                            </strong>
                            .
                        </p>

                        <div className="modal-actions">

                            <button
                                className="secondary-button"
                                onClick={() =>
                                    setDeletingDocument(
                                        null
                                    )
                                }
                                disabled={deleting}
                            >
                                Cancel
                            </button>

                            <button
                                className="danger-button"
                                onClick={
                                    handleDelete
                                }
                                disabled={deleting}
                            >
                                {deleting
                                    ? "Deleting..."
                                    : "Delete document"}
                            </button>

                        </div>

                    </div>

                </div>
            )}

        </div>
    );
}

export default Documents;
import { useEffect, useState } from "react";
import {
    FileText,
    Plus,
    X,
    ExternalLink,
    Pencil,
    Trash2,
} from "lucide-react";

import {
    createDocument,
    getDocumentsByAsset,
    updateDocument,
    deleteDocument,
} from "../services/documentService";
import { useToast } from "../context/ToastContext";

function DocumentSection({ assetId }) {
    const toast = useToast();
    const [documents, setDocuments] = useState([]);

    const [loading, setLoading] = useState(true);

    const [showForm, setShowForm] = useState(false);

    const [editingDocument, setEditingDocument] = useState(null);

    const [deletingDocument, setDeletingDocument] = useState(null);

    const [saving, setSaving] = useState(false);

    const [deleting, setDeleting] = useState(false);

    const [formData, setFormData] = useState({
        type: "INVOICE",
        name: "",
        fileUrl: "",
    });

    const loadDocuments = async () => {
        try {
            const data = await getDocumentsByAsset(assetId);

            setDocuments(data.documents || []);
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
        loadDocuments();
    }, [assetId]);

    const resetForm = () => {
        setFormData({
            type: "INVOICE",
            name: "",
            fileUrl: "",
        });
    };

    const openCreateForm = () => {
        resetForm();
        setEditingDocument(null);
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingDocument(null);
        resetForm();
    };

    const handleCreate = async (event) => {
        event.preventDefault();

        try {
            setSaving(true);

            const data = await createDocument(
                assetId,
                formData
            );

            setDocuments((current) => [
                data.document,
                ...current,
            ]);

            closeForm();
            toast.success("Document created successfully");
        } catch (error) {
            console.error(
                "Failed to create document",
                error
            );
            toast.error(error.response?.data?.message || "Failed to create document");
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (document) => {
        setFormData({
            type: document.type,
            name: document.name,
            fileUrl: document.fileUrl,
        });

        setShowForm(false);
        setEditingDocument(document);
    };

    const handleUpdate = async (event) => {
        event.preventDefault();

        try {
            setSaving(true);

            const data = await updateDocument(
                editingDocument._id,
                formData
            );

            setDocuments((current) =>
                current.map((document) =>
                    document._id === editingDocument._id
                        ? data.document
                        : document
                )
            );

            closeForm();
            toast.success("Document updated successfully");
        } catch (error) {
            console.error(
                "Failed to update document",
                error
            );
            toast.error(error.response?.data?.message || "Failed to update document");
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
                    (document) =>
                        document._id !== deletingDocument._id
                )
            );

            setDeletingDocument(null);
            toast.success("Document deleted successfully");
        } catch (error) {
            console.error(
                "Failed to delete document",
                error
            );
            toast.error(error.response?.data?.message || "Failed to delete document");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <>
            <div className="warranty-card document-section">

                {/* Header */}
                <div className="warranty-header">

                    <div>
                        <h2>Documents</h2>

                        <p>
                            Keep important documents related
                            to this asset.
                        </p>
                    </div>

                    {/* Only ONE Add Document button */}
                    <button
                        className="secondary-button document-add-button"
                        onClick={openCreateForm}
                    >
                        <Plus size={16} />
                        Add document
                    </button>

                </div>

                {/* Content */}
                {loading ? (
                    <p className="warranty-loading">
                        Loading documents...
                    </p>
                ) : documents.length === 0 ? (
                    <div className="no-documents">

                        <div className="assets-empty-icon">
                            <FileText size={24} />
                        </div>

                        <h3>No documents yet</h3>

                        <p>
                            Add invoices, warranty cards,
                            service receipts, insurance
                            documents, or other important files.
                        </p>

                    </div>
                ) : (
                    <div className="documents-list">

                        {documents.map((document) => (
                            <div
                                className="document-item"
                                key={document._id}
                            >

                                <div className="document-icon">
                                    <FileText size={20} />
                                </div>

                                <div className="document-info">

                                    <strong>
                                        {document.name}
                                    </strong>

                                    <span className="document-type">
                                        {document.type
                                            .replaceAll("_", " ")}
                                    </span>

                                </div>

                                <div className="document-actions">

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
                        ))}

                    </div>
                )}

            </div>

            {/* Add / Edit Document Modal */}
            {(showForm || editingDocument) && (
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
                                    {editingDocument
                                        ? "Update document information."
                                        : "Add an important document for this asset."}
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
                                editingDocument
                                    ? handleUpdate
                                    : handleCreate
                            }
                        >

                            <div className="form-group">

                                <label>
                                    Document type
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
                                    placeholder="e.g. Samsung AC Invoice"
                                    required
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

                                <label>
                                    File URL
                                </label>

                                <input
                                    type="url"
                                    placeholder="https://example.com/file.pdf"
                                    required
                                    value={formData.fileUrl}
                                    onChange={(event) =>
                                        setFormData({
                                            ...formData,
                                            fileUrl: event.target.value,
                                        })
                                    }
                                />

                                <small>
                                    File upload will be added
                                    in a later step.
                                </small>

                            </div>

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
                                        : editingDocument
                                            ? "Save changes"
                                            : "Add document"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

            {/* Delete Confirmation */}
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
                                {deletingDocument.name}
                            </strong>
                            .
                        </p>

                        <div className="modal-actions">

                            <button
                                className="secondary-button"
                                onClick={() =>
                                    setDeletingDocument(null)
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
                                    : "Delete document"}
                            </button>

                        </div>

                    </div>

                </div>
            )}
        </>
    );
}

export default DocumentSection;
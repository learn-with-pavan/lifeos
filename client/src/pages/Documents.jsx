import {
    CalendarDays,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Download,
    ExternalLink,
    Eye,
    File,
    FileArchive,
    FileImage,
    FileSpreadsheet,
    FileText,
    FileType,
    HardDrive,
    Loader2,
    Pencil,
    Plus,
    Search,
    SlidersHorizontal,
    Trash2,
    Upload,
    X,
} from "lucide-react";

import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    createDocument,
    deleteDocument,
    deleteDocumentFile,
    getDocuments,
    updateDocument,
} from "../services/documentService";

import { getAssets } from "../services/assetService";
import { useToast } from "../context/ToastContext";

import "../styles/document.css";
import LoadingState from "../components/LoadingState";


/* =========================================================
   CONSTANTS
========================================================= */

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_FILES = 10;

const ALLOWED_FILE_TYPES = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
    "text/csv",
];

const ACCEPT_ATTRIBUTE = [
    ".pdf",
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".gif",
    ".doc",
    ".docx",
    ".xls",
    ".xlsx",
    ".txt",
    ".csv",
].join(",");

const DOCUMENT_TYPES = [
    { value: "INVOICE", label: "Invoice" },
    { value: "WARRANTY_CARD", label: "Warranty Card" },
    { value: "SERVICE_RECEIPT", label: "Service Receipt" },
    { value: "INSURANCE", label: "Insurance" },
    { value: "PURCHASE_RECEIPT", label: "Purchase Receipt" },
    { value: "MANUAL", label: "Manual" },
    { value: "REGISTRATION", label: "Registration" },
    { value: "OWNERSHIP", label: "Ownership" },
    { value: "IDENTIFICATION", label: "Identification" },
    { value: "REPAIR_RECORD", label: "Repair Record" },
    { value: "OTHER", label: "Other" },
];


/* =========================================================
   HELPERS
========================================================= */

const formatDocumentType = (type) => {
    const found = DOCUMENT_TYPES.find(
        (item) => item.value === type
    );

    if (found) {
        return found.label;
    }

    return (
        type
            ?.replaceAll("_", " ")
            ?.toLowerCase()
            ?.replace(/\b\w/g, (char) => char.toUpperCase()) ||
        "Document"
    );
};


const formatFileSize = (bytes = 0) => {
    if (!bytes) {
        return "0 KB";
    }

    if (bytes < 1024) {
        return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};


const formatDate = (date) => {
    if (!date) {
        return "—";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return "—";
    }

    return parsedDate.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};


const getFileExtension = (file) => {
    const name =
        file?.originalName ||
        file?.name ||
        "";

    return (
        name
            .split(".")
            .pop()
            ?.toLowerCase() || ""
    );
};


const isImageFile = (file) => {
    if (!file) {
        return false;
    }

    if (file.mimeType?.startsWith("image/")) {
        return true;
    }

    return [
        "jpg",
        "jpeg",
        "png",
        "webp",
        "gif",
    ].includes(getFileExtension(file));
};


const isPdfFile = (file) => {
    if (!file) {
        return false;
    }

    if (file.mimeType === "application/pdf") {
        return true;
    }

    return getFileExtension(file) === "pdf";
};


const isSpreadsheetFile = (file) => {
    return [
        "xls",
        "xlsx",
        "csv",
    ].includes(getFileExtension(file));
};


const isArchiveFile = (file) => {
    return [
        "zip",
        "rar",
        "7z",
    ].includes(getFileExtension(file));
};


const getFileIcon = (file, size = 20) => {
    if (isImageFile(file)) {
        return <FileImage size={size} />;
    }

    if (isPdfFile(file)) {
        return <FileType size={size} />;
    }

    if (isSpreadsheetFile(file)) {
        return <FileSpreadsheet size={size} />;
    }

    if (isArchiveFile(file)) {
        return <FileArchive size={size} />;
    }

    if (
        ["doc", "docx"].includes(
            getFileExtension(file)
        )
    ) {
        return <FileText size={size} />;
    }

    return <File size={size} />;
};


const isPreviewable = (file) => {
    return (
        isImageFile(file) ||
        isPdfFile(file)
    );
};


const getDownloadUrl = (file) => {
    if (!file?.url) {
        return "";
    }

    try {
        const url = new URL(file.url);

        if (
            url.pathname.includes(
                "/fl_attachment/"
            )
        ) {
            return url.toString();
        }

        const segments =
            url.pathname.split("/");

        const uploadIndex =
            segments.findIndex(
                (segment) =>
                    segment === "upload"
            );

        if (uploadIndex === -1) {
            return file.url;
        }

        segments.splice(
            uploadIndex + 1,
            0,
            "fl_attachment"
        );

        url.pathname =
            segments.join("/");

        return url.toString();
    } catch {
        return file.url;
    }
};


const getAssetDisplayName = (asset) => {
    if (!asset) {
        return "Unknown asset";
    }

    if (asset.name) {
        return asset.name;
    }

    const parts = [
        asset.brand,
        asset.model,
    ].filter(Boolean);

    return parts.length
        ? parts.join(" ")
        : "Unnamed asset";
};


const getExpiryStatus = (expiryDate) => {
    if (!expiryDate) {
        return null;
    }

    const expiry =
        new Date(expiryDate);

    if (Number.isNaN(expiry.getTime())) {
        return null;
    }

    const today = new Date();

    today.setHours(0, 0, 0, 0);
    expiry.setHours(0, 0, 0, 0);

    const difference =
        expiry.getTime() -
        today.getTime();

    const days = Math.ceil(
        difference /
        (1000 * 60 * 60 * 24)
    );

    if (days < 0) {
        return {
            type: "expired",
            label: "Expired",
        };
    }

    if (days <= 30) {
        return {
            type: "warning",
            label: `Expires in ${days} day${days === 1 ? "" : "s"
                }`,
        };
    }

    return {
        type: "valid",
        label: "Valid",
    };
};


const createEmptyForm = () => ({
    asset: "",
    type: "",
    name: "",
    description: "",
    documentDate: "",
    expiryDate: "",
});


/* =========================================================
   COMPONENT
========================================================= */

const Documents = () => {
    const { showToast } = useToast();

    const [documents, setDocuments] = useState([]);
    const [assets, setAssets] = useState([]);

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [searchTerm, setSearchTerm] =
        useState("");

    const [typeFilter, setTypeFilter] =
        useState("ALL");

    const [showForm, setShowForm] =
        useState(false);

    const [editingDocument, setEditingDocument] =
        useState(null);

    const [deletingDocument, setDeletingDocument] =
        useState(null);

    const [deletingFileId, setDeletingFileId] =
        useState(null);

    const [previewState, setPreviewState] =
        useState(null);

    const [selectedFiles, setSelectedFiles] =
        useState([]);

    const [dragActive, setDragActive] =
        useState(false);

    const [formData, setFormData] =
        useState(createEmptyForm());


    /* =====================================================
       LOAD DATA
    ===================================================== */

    const loadData = useCallback(
        async () => {
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
                    documentsResponse?.documents ||
                    documentsResponse?.data
                        ?.documents ||
                    documentsResponse?.data ||
                    []
                );

                setAssets(
                    assetsResponse?.assets ||
                    assetsResponse?.data
                        ?.assets ||
                    assetsResponse?.data ||
                    []
                );
            } catch (error) {
                console.error(
                    "Failed to load documents:",
                    error
                );

                showToast?.(
                    error?.response?.data
                        ?.message ||
                    "Failed to load documents.",
                    "error"
                );
            } finally {
                setLoading(false);
            }
        },
        [showToast]
    );


    useEffect(() => {
        loadData();
    }, [loadData]);


    /* =====================================================
       FILTERING
    ===================================================== */

    const filteredDocuments = useMemo(() => {
        const search =
            searchTerm
                .trim()
                .toLowerCase();

        return documents.filter(
            (documentItem) => {
                const assetName =
                    getAssetDisplayName(
                        documentItem.asset
                    ).toLowerCase();

                const fileNames =
                    (
                        documentItem.files ||
                        []
                    )
                        .map(
                            (file) =>
                                file.originalName ||
                                ""
                        )
                        .join(" ")
                        .toLowerCase();

                const matchesSearch =
                    !search ||
                    documentItem.name
                        ?.toLowerCase()
                        .includes(search) ||
                    assetName.includes(search) ||
                    fileNames.includes(search);

                const matchesType =
                    typeFilter === "ALL" ||
                    documentItem.type ===
                    typeFilter;

                return (
                    matchesSearch &&
                    matchesType
                );
            }
        );
    }, [
        documents,
        searchTerm,
        typeFilter,
    ]);


    /* =====================================================
       SUMMARY
    ===================================================== */

    const totalFiles = useMemo(
        () =>
            documents.reduce(
                (total, documentItem) =>
                    total +
                    (
                        documentItem.files ||
                        []
                    ).length,
                0
            ),
        [documents]
    );


    const expiringDocuments =
        useMemo(
            () =>
                documents.filter(
                    (documentItem) => {
                        const status =
                            getExpiryStatus(
                                documentItem.expiryDate
                            );

                        return (
                            status?.type ===
                            "warning" ||
                            status?.type ===
                            "expired"
                        );
                    }
                ).length,
            [documents]
        );


    /* =====================================================
       FORM
    ===================================================== */

    const openCreateForm = () => {
        setEditingDocument(null);
        setFormData(
            createEmptyForm()
        );
        setSelectedFiles([]);
        setShowForm(true);
    };


    const openEditForm = (
        documentItem
    ) => {
        setEditingDocument(
            documentItem
        );

        setFormData({
            asset:
                documentItem.asset?._id ||
                documentItem.asset ||
                "",
            type:
                documentItem.type ||
                "",
            name:
                documentItem.name ||
                "",
            description:
                documentItem.description ||
                "",
            documentDate:
                documentItem.documentDate
                    ? new Date(
                        documentItem.documentDate
                    )
                        .toISOString()
                        .split("T")[0]
                    : "",
            expiryDate:
                documentItem.expiryDate
                    ? new Date(
                        documentItem.expiryDate
                    )
                        .toISOString()
                        .split("T")[0]
                    : "",
        });

        setSelectedFiles([]);
        setShowForm(true);
    };


    const closeForm = () => {
        if (saving) {
            return;
        }

        setShowForm(false);
        setEditingDocument(null);
        setFormData(
            createEmptyForm()
        );
        setSelectedFiles([]);
        setDragActive(false);
    };


    const handleInputChange = (
        event
    ) => {
        const {
            name,
            value,
        } = event.target;

        setFormData(
            (previous) => ({
                ...previous,
                [name]: value,
            })
        );
    };


    /* =====================================================
       FILE HANDLING
    ===================================================== */

    const validateFile = (
        file
    ) => {
        if (!file) {
            return "Invalid file.";
        }

        if (
            file.size >
            MAX_FILE_SIZE
        ) {
            return `${file.name} exceeds the 10 MB file size limit.`;
        }

        if (
            file.type &&
            !ALLOWED_FILE_TYPES.includes(
                file.type
            )
        ) {
            return `${file.name} is not a supported file type.`;
        }

        return null;
    };


    const addFiles = (
        incomingFiles
    ) => {
        const files = Array.from(
            incomingFiles || []
        );

        if (!files.length) {
            return;
        }

        const existingCount =
            editingDocument?.files
                ?.length || 0;

        const newCount =
            selectedFiles.length;

        const remainingSlots =
            MAX_FILES -
            existingCount -
            newCount;

        if (remainingSlots <= 0) {
            showToast?.(
                `A document can contain a maximum of ${MAX_FILES} files.`,
                "error"
            );

            return;
        }

        const accepted = [];

        const seen = new Set(
            selectedFiles.map(
                (file) =>
                    `${file.name}-${file.size}-${file.lastModified}`
            )
        );

        for (const file of files) {
            const validationError =
                validateFile(file);

            if (validationError) {
                showToast?.(
                    validationError,
                    "error"
                );

                continue;
            }

            const key =
                `${file.name}-${file.size}-${file.lastModified}`;

            if (seen.has(key)) {
                continue;
            }

            seen.add(key);
            accepted.push(file);
        }

        const limited =
            accepted.slice(
                0,
                remainingSlots
            );

        if (
            accepted.length >
            limited.length
        ) {
            showToast?.(
                `Only ${remainingSlots} more file${remainingSlots === 1
                    ? ""
                    : "s"
                } can be added.`,
                "error"
            );
        }

        setSelectedFiles(
            (previous) => [
                ...previous,
                ...limited,
            ]
        );
    };


    const handleFileChange = (
        event
    ) => {
        addFiles(
            event.target.files
        );

        event.target.value = "";
    };


    const removeSelectedFile = (
        index
    ) => {
        setSelectedFiles(
            (previous) =>
                previous.filter(
                    (_, fileIndex) =>
                        fileIndex !==
                        index
                )
        );
    };


    /* =====================================================
       DRAG & DROP
    ===================================================== */

    const handleDragOver = (
        event
    ) => {
        event.preventDefault();
        event.stopPropagation();

        setDragActive(true);
    };


    const handleDragLeave = (
        event
    ) => {
        event.preventDefault();
        event.stopPropagation();

        setDragActive(false);
    };


    const handleDrop = (
        event
    ) => {
        event.preventDefault();
        event.stopPropagation();

        setDragActive(false);

        addFiles(
            event.dataTransfer.files
        );
    };


    /* =====================================================
       SAVE DOCUMENT
    ===================================================== */

    const handleSubmit = async (
        event
    ) => {
        event.preventDefault();

        if (!formData.asset) {
            showToast?.(
                "Please select an asset.",
                "error"
            );
            return;
        }

        if (!formData.type) {
            showToast?.(
                "Please select a document type.",
                "error"
            );
            return;
        }

        if (!formData.name.trim()) {
            showToast?.(
                "Please enter a document name.",
                "error"
            );
            return;
        }

        if (
            !editingDocument &&
            selectedFiles.length === 0
        ) {
            showToast?.(
                "Please add at least one file.",
                "error"
            );
            return;
        }

        if (
            formData.documentDate &&
            formData.expiryDate &&
            new Date(
                formData.expiryDate
            ) <
            new Date(
                formData.documentDate
            )
        ) {
            showToast?.(
                "Expiry date cannot be before document date.",
                "error"
            );
            return;
        }

        try {
            setSaving(true);

            const payload = {
                asset:
                    formData.asset,
                type:
                    formData.type,
                name:
                    formData.name.trim(),
                description:
                    formData.description.trim(),
                documentDate:
                    formData.documentDate ||
                    null,
                expiryDate:
                    formData.expiryDate ||
                    null,
                files:
                    selectedFiles,
            };

            let response;

            if (editingDocument) {
                response =
                    await updateDocument(
                        editingDocument._id,
                        payload
                    );
            } else {
                response =
                    await createDocument(
                        payload
                    );
            }

            const savedDocument =
                response?.document ||
                response?.data?.document;

            if (savedDocument) {
                setDocuments(
                    (previous) =>
                        editingDocument
                            ? previous.map(
                                (
                                    item
                                ) =>
                                    item._id ===
                                        editingDocument._id
                                        ? savedDocument
                                        : item
                            )
                            : [
                                savedDocument,
                                ...previous,
                            ]
                );
            } else {
                await loadData();
            }

            showToast?.(
                editingDocument
                    ? "Document updated successfully."
                    : "Document created successfully.",
                "success"
            );

            closeForm();
        } catch (error) {
            console.error(
                "Failed to save document:",
                error
            );

            showToast?.(
                error?.response?.data
                    ?.message ||
                "Failed to save document.",
                "error"
            );
        } finally {
            setSaving(false);
        }
    };


    /* =====================================================
       DELETE DOCUMENT
    ===================================================== */

    const handleDeleteDocument =
        async () => {
            if (!deletingDocument) {
                return;
            }

            try {
                setSaving(true);

                await deleteDocument(
                    deletingDocument._id
                );

                setDocuments(
                    (previous) =>
                        previous.filter(
                            (item) =>
                                item._id !==
                                deletingDocument._id
                        )
                );

                if (
                    previewState?.document
                        ?._id ===
                    deletingDocument._id
                ) {
                    setPreviewState(null);
                }

                showToast?.(
                    "Document deleted successfully.",
                    "success"
                );

                setDeletingDocument(
                    null
                );
            } catch (error) {
                console.error(
                    "Failed to delete document:",
                    error
                );

                showToast?.(
                    error?.response?.data
                        ?.message ||
                    "Failed to delete document.",
                    "error"
                );
            } finally {
                setSaving(false);
            }
        };


    /* =====================================================
       DELETE FILE
    ===================================================== */

    const handleDeleteFile =
        async (
            documentId,
            fileId
        ) => {
            const documentItem =
                documents.find(
                    (item) =>
                        item._id ===
                        documentId
                );

            if (!documentItem) {
                return;
            }

            if (
                !documentItem.files ||
                documentItem.files.length <=
                1
            ) {
                showToast?.(
                    "A document must contain at least one file.",
                    "error"
                );

                return;
            }

            try {
                setDeletingFileId(
                    fileId
                );

                const response =
                    await deleteDocumentFile(
                        documentId,
                        fileId
                    );

                const updatedDocument =
                    response?.document ||
                    response?.data?.document;

                if (updatedDocument) {
                    setDocuments(
                        (previous) =>
                            previous.map(
                                (item) =>
                                    item._id ===
                                        documentId
                                        ? updatedDocument
                                        : item
                            )
                    );

                    setEditingDocument(
                        updatedDocument
                    );

                    if (
                        previewState?.document
                            ?._id ===
                        documentId
                    ) {
                        setPreviewState(
                            null
                        );
                    }
                } else {
                    await loadData();
                }

                showToast?.(
                    "File deleted successfully.",
                    "success"
                );
            } catch (error) {
                console.error(
                    "Failed to delete file:",
                    error
                );

                showToast?.(
                    error?.response?.data
                        ?.message ||
                    "Failed to delete file.",
                    "error"
                );
            } finally {
                setDeletingFileId(
                    null
                );
            }
        };


    /* =====================================================
       PREVIEW
    ===================================================== */

    const openPreview = (
        documentItem,
        fileIndex = 0
    ) => {
        if (
            !documentItem?.files
                ?.length
        ) {
            return;
        }

        setPreviewState({
            document: documentItem,
            fileIndex,
        });
    };


    const closePreview = () => {
        setPreviewState(null);
    };


    const activePreviewFile =
        previewState?.document
            ?.files?.[
        previewState.fileIndex
        ] || null;


    const goToPreviousFile = () => {
        if (!previewState) {
            return;
        }

        const total =
            previewState.document
                .files.length;

        setPreviewState(
            (previous) => ({
                ...previous,
                fileIndex:
                    previous.fileIndex ===
                        0
                        ? total - 1
                        : previous.fileIndex -
                        1,
            })
        );
    };


    const goToNextFile = () => {
        if (!previewState) {
            return;
        }

        const total =
            previewState.document
                .files.length;

        setPreviewState(
            (previous) => ({
                ...previous,
                fileIndex:
                    previous.fileIndex ===
                        total - 1
                        ? 0
                        : previous.fileIndex +
                        1,
            })
        );
    };


    const downloadFile = (
        file
    ) => {
        const downloadUrl =
            getDownloadUrl(file);

        if (!downloadUrl) {
            showToast?.(
                "File download URL is unavailable.",
                "error"
            );
            return;
        }

        const link =
            document.createElement(
                "a"
            );

        link.href = downloadUrl;
        link.target = "_blank";
        link.rel =
            "noopener noreferrer";

        document.body.appendChild(
            link
        );

        link.click();
        link.remove();
    };


    /* =====================================================
       KEYBOARD
    ===================================================== */

    useEffect(() => {
        const handleKeyDown = (
            event
        ) => {
            if (
                event.key !==
                "Escape"
            ) {
                return;
            }

            if (previewState) {
                closePreview();
                return;
            }

            if (
                showForm &&
                !saving
            ) {
                closeForm();
            }
        };

        window.addEventListener(
            "keydown",
            handleKeyDown
        );

        return () =>
            window.removeEventListener(
                "keydown",
                handleKeyDown
            );
    }, [
        previewState,
        showForm,
        saving,
    ]);


    /* =====================================================
       LOADING
    ===================================================== */

    if (loading) {
        return (
            <div className="documents-page">
                <LoadingState />
            </div>
        );
    }


    return (
        <div className="documents-page">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="documents-header">

                <div className="documents-title-row">

                    <div className="documents-title-icon">
                        <FileText size={22} />
                    </div>

                    <div>
                        <h1>
                            Documents
                        </h1>

                        <p>
                            Keep invoices,
                            warranties,
                            receipts and
                            important asset
                            documents organized.
                        </p>
                    </div>

                </div>

                <button
                    type="button"
                    className="documents-primary-button"
                    onClick={
                        openCreateForm
                    }
                >
                    <Plus size={18} />
                    Add Document
                </button>

            </div>


            {/* =================================================
                SUMMARY
            ================================================= */}

            <div className="documents-summary">

                <div className="document-summary-card">

                    <div className="document-summary-icon">
                        <FileText size={20} />
                    </div>

                    <div>
                        <span>
                            Total Documents
                        </span>

                        <strong>
                            {
                                documents.length
                            }
                        </strong>
                    </div>

                </div>


                <div className="document-summary-card">

                    <div className="document-summary-icon">
                        <HardDrive size={20} />
                    </div>

                    <div>
                        <span>
                            Total Files
                        </span>

                        <strong>
                            {totalFiles}
                        </strong>
                    </div>

                </div>


                <div className="document-summary-card">

                    <div className="document-summary-icon document-summary-warning">
                        <CalendarDays size={20} />
                    </div>

                    <div>
                        <span>
                            Expiry Alerts
                        </span>

                        <strong>
                            {
                                expiringDocuments
                            }
                        </strong>
                    </div>

                </div>

            </div>


            {/* =================================================
                TOOLBAR
            ================================================= */}

            <div className="documents-toolbar">

                <div className="documents-search">

                    <Search size={18} />

                    <input
                        type="text"
                        placeholder="Search documents, assets or files..."
                        value={
                            searchTerm
                        }
                        onChange={(
                            event
                        ) =>
                            setSearchTerm(
                                event.target
                                    .value
                            )
                        }
                    />

                    {searchTerm && (
                        <button
                            type="button"
                            className="documents-search-clear"
                            onClick={() =>
                                setSearchTerm(
                                    ""
                                )
                            }
                        >
                            <X size={15} />
                        </button>
                    )}

                </div>


                <div className="documents-filter">

                    <SlidersHorizontal
                        size={17}
                    />

                    <select
                        value={
                            typeFilter
                        }
                        onChange={(
                            event
                        ) =>
                            setTypeFilter(
                                event.target
                                    .value
                            )
                        }
                    >
                        <option value="ALL">
                            All Types
                        </option>

                        {DOCUMENT_TYPES.map(
                            (type) => (
                                <option
                                    key={
                                        type.value
                                    }
                                    value={
                                        type.value
                                    }
                                >
                                    {type.label}
                                </option>
                            )
                        )}
                    </select>

                </div>

            </div>


            {/* =================================================
                RESULTS
            ================================================= */}

            <div className="documents-results-info">

                <span>
                    {
                        filteredDocuments.length
                    }{" "}
                    document
                    {filteredDocuments.length ===
                        1
                        ? ""
                        : "s"}
                </span>

                {(searchTerm ||
                    typeFilter !==
                    "ALL") && (
                        <button
                            type="button"
                            onClick={() => {
                                setSearchTerm(
                                    ""
                                );
                                setTypeFilter(
                                    "ALL"
                                );
                            }}
                        >
                            Clear filters
                        </button>
                    )}

            </div>


            {/* =================================================
                DOCUMENTS
            ================================================= */}

            {filteredDocuments.length ===
                0 ? (
                <div className="documents-empty">

                    <div className="documents-empty-icon">
                        <FileText size={34} />
                    </div>

                    {documents.length ===
                        0 ? (
                        <>
                            <h2>
                                No documents yet
                            </h2>

                            <p>
                                Add your first
                                invoice,
                                warranty card,
                                receipt or
                                important
                                document.
                            </p>

                            <button
                                type="button"
                                className="documents-primary-button"
                                onClick={
                                    openCreateForm
                                }
                            >
                                <Plus
                                    size={18}
                                />
                                Add First
                                Document
                            </button>
                        </>
                    ) : (
                        <>
                            <h2>
                                No matching
                                documents
                            </h2>

                            <p>
                                Try changing
                                your search
                                or filter.
                            </p>

                            <button
                                type="button"
                                className="documents-secondary-button"
                                onClick={() => {
                                    setSearchTerm(
                                        ""
                                    );
                                    setTypeFilter(
                                        "ALL"
                                    );
                                }}
                            >
                                Clear Filters
                            </button>
                        </>
                    )}

                </div>
            ) : (
                <div className="documents-grid">

                    {filteredDocuments.map(
                        (
                            documentItem
                        ) => {
                            const files =
                                documentItem.files ||
                                [];

                            const firstFile =
                                files[0];

                            const expiryStatus =
                                getExpiryStatus(
                                    documentItem.expiryDate
                                );

                            return (
                                <article
                                    className="document-card"
                                    key={
                                        documentItem._id
                                    }
                                >

                                    <div className="document-card-top">

                                        <div className="document-card-file-icon">
                                            {getFileIcon(
                                                firstFile,
                                                22
                                            )}
                                        </div>

                                        <div className="document-card-actions">

                                            <button
                                                type="button"
                                                title="Preview"
                                                disabled={
                                                    !files.length
                                                }
                                                onClick={() =>
                                                    openPreview(
                                                        documentItem
                                                    )
                                                }
                                            >
                                                <Eye
                                                    size={
                                                        17
                                                    }
                                                />
                                            </button>

                                            <button
                                                type="button"
                                                title="Edit"
                                                onClick={() =>
                                                    openEditForm(
                                                        documentItem
                                                    )
                                                }
                                            >
                                                <Pencil
                                                    size={
                                                        17
                                                    }
                                                />
                                            </button>

                                            <button
                                                type="button"
                                                title="Delete"
                                                className="danger"
                                                onClick={() =>
                                                    setDeletingDocument(
                                                        documentItem
                                                    )
                                                }
                                            >
                                                <Trash2
                                                    size={
                                                        17
                                                    }
                                                />
                                            </button>

                                        </div>

                                    </div>


                                    <div className="document-card-body">

                                        <div className="document-type-badge">
                                            {
                                                formatDocumentType(
                                                    documentItem.type
                                                )
                                            }
                                        </div>

                                        <h3
                                            title={
                                                documentItem.name
                                            }
                                        >
                                            {
                                                documentItem.name
                                            }
                                        </h3>

                                        <p className="document-card-asset">
                                            {
                                                getAssetDisplayName(
                                                    documentItem.asset
                                                )
                                            }
                                        </p>

                                        <div className="document-card-meta">

                                            <div>
                                                <CalendarDays
                                                    size={
                                                        15
                                                    }
                                                />

                                                <span>
                                                    {documentItem.documentDate
                                                        ? formatDate(
                                                            documentItem.documentDate
                                                        )
                                                        : "No document date"}
                                                </span>
                                            </div>

                                            <div>
                                                <HardDrive
                                                    size={
                                                        15
                                                    }
                                                />

                                                <span>
                                                    {
                                                        files.length
                                                    }{" "}
                                                    file
                                                    {files.length ===
                                                        1
                                                        ? ""
                                                        : "s"}
                                                </span>
                                            </div>

                                        </div>


                                        {expiryStatus && (
                                            <div
                                                className={`document-expiry ${expiryStatus.type}`}
                                            >
                                                <CalendarDays
                                                    size={
                                                        14
                                                    }
                                                />

                                                <span>
                                                    {
                                                        expiryStatus.label
                                                    }
                                                </span>

                                                <span>
                                                    •{" "}
                                                    {formatDate(
                                                        documentItem.expiryDate
                                                    )}
                                                </span>
                                            </div>
                                        )}

                                    </div>


                                    <div className="document-card-footer">

                                        <button
                                            type="button"
                                            onClick={() =>
                                                openPreview(
                                                    documentItem
                                                )
                                            }
                                        >
                                            <Eye
                                                size={
                                                    15
                                                }
                                            />
                                            Preview
                                        </button>

                                        {firstFile?.url && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    downloadFile(
                                                        firstFile
                                                    )
                                                }
                                            >
                                                <Download
                                                    size={
                                                        15
                                                    }
                                                />
                                                Download
                                            </button>
                                        )}

                                    </div>

                                </article>
                            );
                        }
                    )}

                </div>
            )}


            {/* =================================================
                CREATE / EDIT MODAL
            ================================================= */}

            {showForm && (
                <div
                    className="documents-modal-overlay"
                    onMouseDown={(
                        event
                    ) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeForm();
                        }
                    }}
                >

                    <div className="documents-modal documents-form-modal">

                        {/* =========================================
                            FIXED HEADER
                        ========================================= */}

                        <div className="documents-modal-header">

                            <div>
                                <h2>
                                    {editingDocument
                                        ? "Edit Document"
                                        : "Add Document"}
                                </h2>

                                <p>
                                    {editingDocument
                                        ? "Update document details or add additional files."
                                        : "Add an important document to an asset."}
                                </p>
                            </div>

                            <button
                                type="button"
                                className="documents-modal-close"
                                onClick={
                                    closeForm
                                }
                                disabled={
                                    saving
                                }
                            >
                                <X size={20} />
                            </button>

                        </div>


                        {/* =========================================
                            SCROLLABLE CONTENT
                        ========================================= */}

                        <form
                            className="documents-form"
                            id="document-form"
                            onSubmit={
                                handleSubmit
                            }
                        >

                            <div className="documents-form-grid">

                                <div className="documents-field">

                                    <label>
                                        Asset
                                        <span>
                                            *
                                        </span>
                                    </label>

                                    <select
                                        name="asset"
                                        value={
                                            formData.asset
                                        }
                                        onChange={
                                            handleInputChange
                                        }
                                        disabled={
                                            Boolean(
                                                editingDocument
                                            )
                                        }
                                        required
                                    >
                                        <option value="">
                                            Select an asset
                                        </option>

                                        {assets.map(
                                            (
                                                asset
                                            ) => (
                                                <option
                                                    key={
                                                        asset._id
                                                    }
                                                    value={
                                                        asset._id
                                                    }
                                                >
                                                    {
                                                        getAssetDisplayName(
                                                            asset
                                                        )
                                                    }
                                                </option>
                                            )
                                        )}
                                    </select>

                                    {editingDocument && (
                                        <small>
                                            Asset
                                            association
                                            cannot be
                                            changed
                                            after
                                            creation.
                                        </small>
                                    )}

                                </div>


                                <div className="documents-field">

                                    <label>
                                        Document Type
                                        <span>
                                            *
                                        </span>
                                    </label>

                                    <select
                                        name="type"
                                        value={
                                            formData.type
                                        }
                                        onChange={
                                            handleInputChange
                                        }
                                        required
                                    >
                                        <option value="">
                                            Select document type
                                        </option>

                                        {DOCUMENT_TYPES.map(
                                            (
                                                type
                                            ) => (
                                                <option
                                                    key={
                                                        type.value
                                                    }
                                                    value={
                                                        type.value
                                                    }
                                                >
                                                    {
                                                        type.label
                                                    }
                                                </option>
                                            )
                                        )}
                                    </select>

                                </div>


                                <div className="documents-field documents-field-full">

                                    <label>
                                        Document Name
                                        <span>
                                            *
                                        </span>
                                    </label>

                                    <input
                                        type="text"
                                        name="name"
                                        value={
                                            formData.name
                                        }
                                        onChange={
                                            handleInputChange
                                        }
                                        placeholder="e.g. Samsung TV Purchase Invoice"
                                        maxLength={
                                            150
                                        }
                                        required
                                    />

                                </div>


                                <div className="documents-field">

                                    <label>
                                        Document Date
                                    </label>

                                    <input
                                        type="date"
                                        name="documentDate"
                                        value={
                                            formData.documentDate
                                        }
                                        onChange={
                                            handleInputChange
                                        }
                                    />

                                </div>


                                <div className="documents-field">

                                    <label>
                                        Expiry Date
                                    </label>

                                    <input
                                        type="date"
                                        name="expiryDate"
                                        value={
                                            formData.expiryDate
                                        }
                                        onChange={
                                            handleInputChange
                                        }
                                    />

                                </div>


                                <div className="documents-field documents-field-full">

                                    <label>
                                        Description
                                    </label>

                                    <textarea
                                        name="description"
                                        value={
                                            formData.description
                                        }
                                        onChange={
                                            handleInputChange
                                        }
                                        placeholder="Add any useful notes about this document..."
                                        maxLength={
                                            1000
                                        }
                                        rows={
                                            3
                                        }
                                    />

                                </div>

                            </div>


                            {/* =========================================
                                EXISTING FILES
                            ========================================= */}

                            {editingDocument && (
                                <div className="document-existing-files-section">

                                    <div className="document-section-heading">

                                        <div>
                                            <h3>
                                                Existing
                                                Files
                                            </h3>

                                            <p>
                                                Preview,
                                                download
                                                or remove
                                                individual
                                                files.
                                            </p>
                                        </div>

                                        <span>
                                            {
                                                editingDocument
                                                    .files
                                                    ?.length ||
                                                0
                                            }{" "}
                                            /{" "}
                                            {
                                                MAX_FILES
                                            }
                                        </span>

                                    </div>


                                    <div className="document-existing-files">

                                        {(
                                            editingDocument.files ||
                                            []
                                        ).map(
                                            (
                                                file,
                                                index
                                            ) => (
                                                <div
                                                    className="document-existing-file"
                                                    key={
                                                        file._id ||
                                                        `${file.publicId}-${index}`
                                                    }
                                                >

                                                    <div className="document-existing-file-icon">
                                                        {getFileIcon(
                                                            file,
                                                            20
                                                        )}
                                                    </div>

                                                    <div className="document-existing-file-info">

                                                        <strong
                                                            title={
                                                                file.originalName
                                                            }
                                                        >
                                                            {
                                                                file.originalName
                                                            }
                                                        </strong>

                                                        <span>
                                                            {formatFileSize(
                                                                file.size
                                                            )}
                                                        </span>

                                                    </div>

                                                    <div className="document-existing-file-actions">

                                                        <button
                                                            type="button"
                                                            title="Preview"
                                                            onClick={() =>
                                                                openPreview(
                                                                    editingDocument,
                                                                    index
                                                                )
                                                            }
                                                        >
                                                            <Eye
                                                                size={
                                                                    16
                                                                }
                                                            />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            title="Open"
                                                            onClick={() =>
                                                                window.open(
                                                                    file.url,
                                                                    "_blank",
                                                                    "noopener,noreferrer"
                                                                )
                                                            }
                                                        >
                                                            <ExternalLink
                                                                size={
                                                                    16
                                                                }
                                                            />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            title="Download"
                                                            onClick={() =>
                                                                downloadFile(
                                                                    file
                                                                )
                                                            }
                                                        >
                                                            <Download
                                                                size={
                                                                    16
                                                                }
                                                            />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            title={
                                                                editingDocument.files.length <=
                                                                    1
                                                                    ? "At least one file is required"
                                                                    : "Delete file"
                                                            }
                                                            className="danger"
                                                            disabled={
                                                                editingDocument.files.length <=
                                                                1 ||
                                                                deletingFileId ===
                                                                file._id
                                                            }
                                                            onClick={() =>
                                                                handleDeleteFile(
                                                                    editingDocument._id,
                                                                    file._id
                                                                )
                                                            }
                                                        >
                                                            {deletingFileId ===
                                                                file._id ? (
                                                                <Loader2
                                                                    size={
                                                                        16
                                                                    }
                                                                    className="documents-spinner"
                                                                />
                                                            ) : (
                                                                <Trash2
                                                                    size={
                                                                        16
                                                                    }
                                                                />
                                                            )}
                                                        </button>

                                                    </div>

                                                </div>
                                            )
                                        )}

                                    </div>

                                </div>
                            )}


                            {/* =========================================
                                UPLOAD
                            ========================================= */}

                            <div className="document-upload-section">

                                <div className="document-section-heading">

                                    <div>
                                        <h3>
                                            {editingDocument
                                                ? "Add More Files"
                                                : "Document Files"}
                                        </h3>

                                        <p>
                                            PDF, images
                                            and common
                                            office
                                            documents up
                                            to 10 MB
                                            each.
                                        </p>
                                    </div>

                                    <span>
                                        {
                                            (
                                                editingDocument
                                                    ?.files
                                                    ?.length ||
                                                0
                                            ) +
                                            selectedFiles.length
                                        }{" "}
                                        /{" "}
                                        {
                                            MAX_FILES
                                        }
                                    </span>

                                </div>


                                <label
                                    className={`document-dropzone ${dragActive
                                            ? "drag-active"
                                            : ""
                                        }`}
                                    onDragOver={
                                        handleDragOver
                                    }
                                    onDragLeave={
                                        handleDragLeave
                                    }
                                    onDrop={
                                        handleDrop
                                    }
                                >

                                    <input
                                        type="file"
                                        multiple
                                        accept={
                                            ACCEPT_ATTRIBUTE
                                        }
                                        onChange={
                                            handleFileChange
                                        }
                                    />

                                    <div className="document-dropzone-icon">
                                        <Upload
                                            size={
                                                24
                                            }
                                        />
                                    </div>

                                    <strong>
                                        Drag and
                                        drop files
                                        here
                                    </strong>

                                    <span>
                                        or click to
                                        browse
                                    </span>

                                    <small>
                                        Maximum{" "}
                                        {
                                            MAX_FILES
                                        }{" "}
                                        files,
                                        10 MB each
                                    </small>

                                </label>


                                {selectedFiles.length >
                                    0 && (
                                        <div className="document-selected-files">

                                            <div className="document-selected-files-title">
                                                New files
                                            </div>

                                            {selectedFiles.map(
                                                (
                                                    file,
                                                    index
                                                ) => (
                                                    <div
                                                        className="document-selected-file"
                                                        key={`${file.name}-${file.size}-${file.lastModified}`}
                                                    >

                                                        <div className="document-selected-file-icon">
                                                            {getFileIcon(
                                                                file,
                                                                18
                                                            )}
                                                        </div>

                                                        <div className="document-selected-file-info">

                                                            <strong
                                                                title={
                                                                    file.name
                                                                }
                                                            >
                                                                {
                                                                    file.name
                                                                }
                                                            </strong>

                                                            <span>
                                                                {formatFileSize(
                                                                    file.size
                                                                )}
                                                            </span>

                                                        </div>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                removeSelectedFile(
                                                                    index
                                                                )
                                                            }
                                                            disabled={
                                                                saving
                                                            }
                                                        >
                                                            <X
                                                                size={
                                                                    16
                                                                }
                                                            />
                                                        </button>

                                                    </div>
                                                )
                                            )}

                                        </div>
                                    )}

                            </div>

                        </form>


                        {/* =========================================
                            FIXED FOOTER
                        ========================================= */}

                        <div className="documents-form-footer">

                            <button
                                type="button"
                                className="documents-secondary-button"
                                onClick={
                                    closeForm
                                }
                                disabled={
                                    saving
                                }
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                form="document-form"
                                className="documents-primary-button"
                                disabled={
                                    saving
                                }
                            >
                                {saving ? (
                                    <>
                                        <Loader2
                                            size={
                                                17
                                            }
                                            className="documents-spinner"
                                        />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2
                                            size={
                                                17
                                            }
                                        />

                                        {editingDocument
                                            ? "Save Changes"
                                            : "Create Document"}
                                    </>
                                )}
                            </button>

                        </div>

                    </div>

                </div>
            )}


            {/* =================================================
                PREVIEW MODAL
            ================================================= */}

            {previewState && (
                <div
                    className="documents-preview-overlay"
                    onMouseDown={(
                        event
                    ) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closePreview();
                        }
                    }}
                >

                    <div className="documents-preview-modal">

                        <div className="documents-preview-header">

                            <div className="documents-preview-heading">

                                <div className="documents-preview-heading-icon">
                                    {getFileIcon(
                                        activePreviewFile,
                                        21
                                    )}
                                </div>

                                <div>
                                    <h2>
                                        {
                                            previewState
                                                .document
                                                .name
                                        }
                                    </h2>

                                    <p>
                                        {
                                            activePreviewFile?.originalName
                                        }

                                        {" • "}

                                        {formatFileSize(
                                            activePreviewFile?.size
                                        )}
                                    </p>
                                </div>

                            </div>


                            <div className="documents-preview-toolbar">

                                {activePreviewFile?.url && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                window.open(
                                                    activePreviewFile.url,
                                                    "_blank",
                                                    "noopener,noreferrer"
                                                )
                                            }
                                        >
                                            <ExternalLink
                                                size={
                                                    16
                                                }
                                            />
                                            Open
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                downloadFile(
                                                    activePreviewFile
                                                )
                                            }
                                        >
                                            <Download
                                                size={
                                                    16
                                                }
                                            />
                                            Download
                                        </button>
                                    </>
                                )}

                                <button
                                    type="button"
                                    className="preview-close-button"
                                    onClick={
                                        closePreview
                                    }
                                >
                                    <X size={20} />
                                </button>

                            </div>

                        </div>


                        <div className="documents-preview-body">

                            {previewState.document.files
                                ?.length > 1 && (
                                    <aside className="documents-preview-sidebar">

                                        <div className="documents-preview-sidebar-title">
                                            <span>
                                                Files
                                            </span>

                                            <span>
                                                {
                                                    previewState
                                                        .document
                                                        .files
                                                        .length
                                                }
                                            </span>
                                        </div>

                                        <div className="documents-preview-file-list">

                                            {previewState.document.files.map(
                                                (
                                                    file,
                                                    index
                                                ) => (
                                                    <button
                                                        type="button"
                                                        className={`documents-preview-file-item ${index ===
                                                                previewState.fileIndex
                                                                ? "active"
                                                                : ""
                                                            }`}
                                                        key={
                                                            file._id ||
                                                            `${file.publicId}-${index}`
                                                        }
                                                        onClick={() =>
                                                            setPreviewState(
                                                                (
                                                                    previous
                                                                ) => ({
                                                                    ...previous,
                                                                    fileIndex:
                                                                        index,
                                                                })
                                                            )
                                                        }
                                                    >

                                                        <div className="documents-preview-file-icon">
                                                            {getFileIcon(
                                                                file,
                                                                18
                                                            )}
                                                        </div>

                                                        <div>
                                                            <strong
                                                                title={
                                                                    file.originalName
                                                                }
                                                            >
                                                                {
                                                                    file.originalName
                                                                }
                                                            </strong>

                                                            <span>
                                                                {formatFileSize(
                                                                    file.size
                                                                )}
                                                            </span>
                                                        </div>

                                                    </button>
                                                )
                                            )}

                                        </div>

                                    </aside>
                                )}


                            <main className="documents-preview-content">

                                {activePreviewFile &&
                                    isImageFile(
                                        activePreviewFile
                                    ) ? (
                                    <div className="documents-image-viewer">

                                        <img
                                            src={
                                                activePreviewFile.url
                                            }
                                            alt={
                                                activePreviewFile.originalName ||
                                                "Document preview"
                                            }
                                        />

                                    </div>
                                ) : activePreviewFile &&
                                    isPdfFile(
                                        activePreviewFile
                                    ) ? (
                                    <iframe
                                        className="documents-pdf-viewer"
                                        src={
                                            activePreviewFile.url
                                        }
                                        title={
                                            activePreviewFile.originalName ||
                                            "PDF preview"
                                        }
                                    />
                                ) : (
                                    <div className="documents-no-preview">

                                        <div className="documents-no-preview-icon">
                                            {getFileIcon(
                                                activePreviewFile,
                                                38
                                            )}
                                        </div>

                                        <h3>
                                            Preview
                                            unavailable
                                        </h3>

                                        <p>
                                            This file
                                            type cannot
                                            be previewed
                                            in the
                                            browser.
                                        </p>

                                        <div className="documents-no-preview-actions">

                                            <button
                                                type="button"
                                                className="documents-secondary-button"
                                                onClick={() =>
                                                    window.open(
                                                        activePreviewFile?.url,
                                                        "_blank",
                                                        "noopener,noreferrer"
                                                    )
                                                }
                                            >
                                                <ExternalLink
                                                    size={
                                                        16
                                                    }
                                                />
                                                Open File
                                            </button>

                                            <button
                                                type="button"
                                                className="documents-primary-button"
                                                onClick={() =>
                                                    downloadFile(
                                                        activePreviewFile
                                                    )
                                                }
                                            >
                                                <Download
                                                    size={
                                                        16
                                                    }
                                                />
                                                Download
                                            </button>

                                        </div>

                                    </div>
                                )}


                                {previewState.document.files
                                    ?.length > 1 && (
                                        <>
                                            <button
                                                type="button"
                                                className="documents-preview-nav documents-preview-nav-left"
                                                onClick={
                                                    goToPreviousFile
                                                }
                                            >
                                                <ChevronLeft
                                                    size={
                                                        22
                                                    }
                                                />
                                            </button>

                                            <button
                                                type="button"
                                                className="documents-preview-nav documents-preview-nav-right"
                                                onClick={
                                                    goToNextFile
                                                }
                                            >
                                                <ChevronRight
                                                    size={
                                                        22
                                                    }
                                                />
                                            </button>

                                            <div className="documents-preview-counter">
                                                {
                                                    previewState.fileIndex +
                                                    1
                                                }{" "}
                                                /{" "}
                                                {
                                                    previewState
                                                        .document
                                                        .files
                                                        .length
                                                }
                                            </div>
                                        </>
                                    )}

                            </main>

                        </div>

                    </div>

                </div>
            )}


            {/* =================================================
                DELETE CONFIRMATION
            ================================================= */}

            {deletingDocument && (
                <div
                    className="documents-modal-overlay"
                    onMouseDown={(
                        event
                    ) => {
                        if (
                            event.target ===
                            event.currentTarget &&
                            !saving
                        ) {
                            setDeletingDocument(
                                null
                            );
                        }
                    }}
                >

                    <div className="documents-confirm-modal">

                        <div className="documents-confirm-icon">
                            <Trash2 size={23} />
                        </div>

                        <h2>
                            Delete document?
                        </h2>

                        <p>
                            This will permanently
                            delete{" "}
                            <strong>
                                {
                                    deletingDocument.name
                                }
                            </strong>{" "}
                            and all of its uploaded
                            files. This action cannot
                            be undone.
                        </p>

                        <div className="documents-confirm-actions">

                            <button
                                type="button"
                                className="documents-secondary-button"
                                onClick={() =>
                                    setDeletingDocument(
                                        null
                                    )
                                }
                                disabled={
                                    saving
                                }
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="documents-danger-button"
                                onClick={
                                    handleDeleteDocument
                                }
                                disabled={
                                    saving
                                }
                            >
                                {saving ? (
                                    <>
                                        <Loader2
                                            size={
                                                16
                                            }
                                            className="documents-spinner"
                                        />
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <Trash2
                                            size={
                                                16
                                            }
                                        />
                                        Delete Document
                                    </>
                                )}
                            </button>

                        </div>

                    </div>

                </div>
            )}

        </div>
    );
};


export default Documents;
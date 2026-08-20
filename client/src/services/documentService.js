import axios from "axios";

const API_URL = "http://localhost:5000/api/documents";

const getAuthHeaders = () => {
    const token = localStorage.getItem("token");

    return {
        Authorization: `Bearer ${token}`,
    };
};


// Get all documents
export const getDocuments = async () => {
    const response = await axios.get(
        API_URL,
        {
            headers: getAuthHeaders(),
        }
    );

    return response.data;
};


// Create document
export const createDocument = async (
    assetOrDocumentData,
    assetDocumentData
) => {
    const documentData = assetDocumentData
        ? {
            ...assetDocumentData,
            asset: assetOrDocumentData,
        }
        : assetOrDocumentData;

    const response = await axios.post(
        API_URL,
        documentData,
        {
            headers: getAuthHeaders(),
        }
    );

    return response.data;
};


// Get document by ID
export const getDocumentById = async (
    documentId
) => {
    const response = await axios.get(
        `${API_URL}/${documentId}`,
        {
            headers: getAuthHeaders(),
        }
    );

    return response.data;
};


// Update document
export const updateDocument = async (
    documentId,
    documentData
) => {
    const response = await axios.put(
        `${API_URL}/${documentId}`,
        documentData,
        {
            headers: getAuthHeaders(),
        }
    );

    return response.data;
};


// Delete document
export const deleteDocument = async (
    documentId
) => {
    const response = await axios.delete(
        `${API_URL}/${documentId}`,
        {
            headers: getAuthHeaders(),
        }
    );

    return response.data;
};


// Get documents for a specific asset
export const getDocumentsByAsset = async (
    assetId
) => {
    const response = await axios.get(
        `${API_URL}/assets/${assetId}`,
        {
            headers: getAuthHeaders(),
        }
    );

    return response.data;
};
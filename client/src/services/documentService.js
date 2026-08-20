import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const getAuthHeaders = () => {
    const token = localStorage.getItem("token");

    return {
        Authorization: `Bearer ${token}`,
    };
};


// Get all documents
export const getDocuments = async () => {
    const response = await axios.get(
        `${API_URL}/documents`,
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
        `${API_URL}/documents`,
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
        `${API_URL}/documents/${documentId}`,
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
        `${API_URL}/documents/${documentId}`,
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
        `${API_URL}/documents/${documentId}`,
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
        `${API_URL}/documents/assets/${assetId}`,
        {
            headers: getAuthHeaders(),
        }
    );

    return response.data;
};
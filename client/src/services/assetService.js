import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const createAsset = async (assetData) => {
    const token = localStorage.getItem("token");

    const response = await axios.post(
        `${API_URL}/assets`,
        assetData,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response.data;
};

export const getAssets = async () => {
    const token = localStorage.getItem('token');

    const response = await axios.get(`${API_URL}/assets`, {
        headers: {
            Authorization: `Bearer ${token}`,
        }
    });

    return response.data;
};

export const getAssetById = async (assetId) => {
    const token = localStorage.getItem('token');

    const response = await axios.get(`${API_URL}/assets/${assetId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        }
    });

    return response.data;
};

export const updateAsset = async (assetId, assetData) => {
    const token = localStorage.getItem('token');

    const response = await axios.put(`${API_URL}/assets/${assetId}`, assetData, {
        headers: {
            Authorization: `Bearer ${token}`,
        }
    });

    return response.data;
};

export const deleteAsset = async (assetId) => {
    const token = localStorage.getItem('token');

    const response = await axios.delete(`${API_URL}/assets/${assetId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        }
    });

    return response.data;
};

export const getWarrantyByAsset = async (assetId) => {
    const token = localStorage.getItem('token');

    const response = await axios.get(`${API_URL}/assets/${assetId}/warranty`, {
        headers: {
            Authorization: `Bearer ${token}`,
        }
    });

    return response.data;
}

export const createWarranty = async (
    assetId,
    warrantyData
) => {
    const token = localStorage.getItem("token");

    const response = await axios.post(
        `${API_URL}/assets/${assetId}/warranty`,
        warrantyData,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response.data;
};

export const updateWarranty = async (
    assetId,
    warrantyData
) => {
    const token = localStorage.getItem("token");

    const response = await axios.put(
        `${API_URL}/assets/${assetId}/warranty`,
        warrantyData,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response.data;
};

export const deleteWarranty = async (assetId) => {
    const token = localStorage.getItem("token");

    const response = await axios.delete(
        `${API_URL}/assets/${assetId}/warranty`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response.data;
};

export const createWarrantyReminder = async (
    assetId,
    remindBeforeDays
) => {
    const token = localStorage.getItem("token");

    const response = await axios.post(
        `${API_URL}/assets/${assetId}/reminder`,
        {
            remindBeforeDays,
        },
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response.data;
};

export const getWarrantyReminder = async (
    assetId
) => {
    const token = localStorage.getItem("token");

    const response = await axios.get(
        `${API_URL}/assets/${assetId}/reminder`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response.data;
};

export const updateWarrantyReminder = async (
    assetId,
    remindBeforeDays
) => {
    const token = localStorage.getItem("token");

    const response = await axios.put(
        `${API_URL}/assets/${assetId}/reminder`,
        {
            remindBeforeDays,
        },
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response.data;
};

export const deleteWarrantyReminder = async (
    assetId
) => {
    const token = localStorage.getItem("token");

    const response = await axios.delete(
        `${API_URL}/assets/${assetId}/reminder`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response.data;
};

import axios from "axios";

const API_URL = "http://localhost:5000/api";

const getAuthHeaders = () => {
    const token = localStorage.getItem("token");

    return {
        Authorization: `Bearer ${token}`,
    };
};


export const createServiceHistory = async (
    data
) => {
    const response = await axios.post(
        `${API_URL}/service-history`,
        data,
        {
            headers: getAuthHeaders(),
        }
    );

    return response.data;
};

export const getServiceHistories =
    async () => {
        const response = await axios.get(
            `${API_URL}/service-history`, {
            headers: getAuthHeaders(),
        }
        );

        return response.data;
    };

export const getServiceHistoryByAsset =
    async (assetId) => {
        const response = await axios.get(
            `${API_URL}/service-history/asset/${assetId}`, {
            headers: getAuthHeaders(),
        }
        );

        return response.data;
    };

export const getServiceHistoryById =
    async (id) => {
        const response = await axios.get(
            `${API_URL}/service-history/${id}`, {
            headers: getAuthHeaders(),
        }
        );

        return response.data;
    };

export const updateServiceHistory =
    async (id, data) => {
        const response = await axios.put(
            `${API_URL}/service-history/${id}`,
            data,
            {
                headers: getAuthHeaders(),
            }
        );

        return response.data;
    };

export const deleteServiceHistory =
    async (id) => {
        const response = await axios.delete(
            `${API_URL}/service-history/${id}`,
            {
                headers: getAuthHeaders(),
            }
        );

        return response.data;
    };
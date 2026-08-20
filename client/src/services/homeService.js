import axios from "axios";

const API_URL = "http://localhost:5000/api";

const getAuthHeaders = () => {
    const token = localStorage.getItem("token");

    return {
        Authorization: `Bearer ${token}`,
    };
};

export const createHome = async (
    homeData
) => {
    const response = await axios.post(
        `${API_URL}/homes`,
        homeData,
        {
            headers: getAuthHeaders(),
        }
    );

    return response.data;
};

export const getHomes = async () => {
    const response = await axios.get(
        `${API_URL}/homes`,
        {
            headers: getAuthHeaders(),
        }
    );

    return response.data;
};

export const getHomeById = async (
    homeId
) => {
    const response = await axios.get(
        `${API_URL}/homes/${homeId}`,
        {
            headers: getAuthHeaders(),
        }
    );

    return response.data;
};

export const updateHome = async (
    homeId,
    homeData
) => {
    const response = await axios.put(
        `${API_URL}/homes/${homeId}`,
        homeData,
        {
            headers: getAuthHeaders(),
        }
    );

    return response.data;
};

export const deleteHome = async (
    homeId
) => {
    const response = await axios.delete(
        `${API_URL}/homes/${homeId}`,
        {
            headers: getAuthHeaders(),
        }
    );

    return response.data;
};

export const getHomeDetails = async (
    homeId
) => {
    const response = await axios.get(
        `${API_URL}/homes/${homeId}/details`,
        { headers: getAuthHeaders() }
    );

    return response.data.data;
};
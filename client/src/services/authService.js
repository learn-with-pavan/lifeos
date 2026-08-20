import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const registerUser = async (userData) => {
    const response = await axios.post(
        `${API_URL}/auth/register`,
        userData
    );

    return response.data;
};

export const loginUser = async (credentials) => {
    const response = await axios.post(
        `${API_URL}/auth/login`,
        credentials
    );

    return response.data;
};
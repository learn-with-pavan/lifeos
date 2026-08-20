import axios from "axios";

const API_URL = "http://localhost:5000/api";

export const getInsights = async () => {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_URL}/insights`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    return response.data;
};
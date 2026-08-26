import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const getAuthHeaders = () => {
    const token = localStorage.getItem("token");

    return {
        Authorization: `Bearer ${token}`,
    };
};

export const createReview = async ({ serviceRequestId, rating, comment }) => {

    const response = await axios.post(
        `${API_URL}/reviews`,
        {
            serviceRequestId,
            rating,
            comment,
        },
        {
            headers: getAuthHeaders(),
        }
    );

    return response.data;
};


export const getReviewForServiceRequest = async (serviceRequestId) => {

    const response =
        await axios.get(
            `${API_URL}/reviews/service-request/${serviceRequestId}`,
            {
                headers: getAuthHeaders(),
            }
        );

    return response.data;
};


export const getProviderReviews = async (serviceProviderId) => {

    const response = await axios.get(
        `${API_URL}/reviews/provider/${serviceProviderId}`,
        {
            headers: getAuthHeaders(),
        }
    );

    return response.data;
};


export const getProviderRating = async (serviceProviderId) => {

    const response = await axios.get(
        `${API_URL}/reviews/provider/${serviceProviderId}/rating`,
        {
            headers: getAuthHeaders(),
        }
    );

    return response.data;
};
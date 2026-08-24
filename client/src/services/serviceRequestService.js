import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const getAuthHeaders = () => {
    const token = localStorage.getItem("token");

    return {
        Authorization: `Bearer ${token}`,
    };
};

export const createServiceRequest = async (payload) => {
    const response = await axios.post(
        `${API_URL}/service-requests`,
        payload,
        {
            headers: getAuthHeaders(),
        }
    );
    return response.data;
};


export const getMyServiceRequests = async () => {
    const response = await axios.get(
        `${API_URL}/service-requests`,
        {
            headers: getAuthHeaders(),
        }
    );
    return response
};


export const getServiceRequestById = async (requestId) => {
    const response = await axios.get(
        `${API_URL}/service-requests/${requestId}`,
        {
            headers: getAuthHeaders(),
        }
    );
    return response
};

export const cancelServiceRequest = async (
    requestId
) => {
    const response = await axios.patch(
        `${API_URL}/service-requests/${requestId}/cancel`,
        {},
        {
            headers: getAuthHeaders(),
        }
    );
    return response
};


export const getProviderIncomingRequests = async () => {
    const response = await axios.get(
        `${API_URL}/service-requests/provider/incoming`,
        {
            headers: getAuthHeaders(),
        }
    );

    return response
};

export const getProviderRequestById = async (
    requestId
) => {
    const response = await axios.get(
        `${API_URL}/service-requests/provider/${requestId}`,
        {
            headers: getAuthHeaders(),
        }
    );

    return response;
};


export const acceptProviderRequest = async (
    requestId
) => {
    const response = await axios.patch(
        `${API_URL}/service-requests/provider/${requestId}/accept`,
        {},
        {
            headers: getAuthHeaders(),
        }
    );

    return response;
};


export const rejectProviderRequest = async (
    requestId
) => {
    const response = await axios.patch(
        `${API_URL}/service-requests/provider/${requestId}/reject`,
        {},
        {
            headers: getAuthHeaders(),
        }
    );

    return response;
};

export const scheduleServiceRequest = async (
    requestId,
    payload
) => {

    const response =
        await axios.patch(
            `${API_URL}/service-requests/${requestId}/schedule`,
            payload,
            {
                headers:
                    getAuthHeaders(),
            }
        );

    return response;
};
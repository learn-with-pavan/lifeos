import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const getAuthHeaders = () => {
    const token = localStorage.getItem("token");

    return {
        Authorization: `Bearer ${token}`,
    };
};

export const getPayments = async () => {

    const response =
        await axios.get(
            `${API_URL}/payments`,
            {
                headers: getAuthHeaders()
            }
        );

    return response.data;
};

export const getPaymentForServiceRequest = async (serviceRequestId) => {

    const response = await axios.get(
        `${API_URL}/payments/service-request/${serviceRequestId}`,
        {
            headers: getAuthHeaders()
        }
    );

    return response.data;
};

export const processPayment = async (
    paymentId,
    paymentData
) => {
    const response = await axios.post(
        `${API_URL}/payments/${paymentId}/process`,
        paymentData,
        {
            headers: getAuthHeaders()
        }
    );

    return response.data;
};
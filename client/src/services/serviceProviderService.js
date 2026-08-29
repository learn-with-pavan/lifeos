import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const getProvidersForAsset = async (
    assetId,
    latitude,
    longitude
) => {
    const token = localStorage.getItem("token");

    const response = await axios.get(
        `${API_URL}/service-providers/for-asset/${assetId}`,
        {
            params: {
                latitude,
                longitude,
            },
            headers: {
                Authorization: `Bearer ${token}`
            },
            timeout: 12000,
        }
    );

    return response.data
};

export const startProviderService =
    async (requestId) => {

        const token = localStorage.getItem("token");
        const response =
            await axios.post(
                `${API_URL}/service-providers/provider/${requestId}/start`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

        return response;
    };


export const completeProviderService = async (requestId, data) => {

    const token =
        localStorage.getItem(
            "token"
        );

    const response =
        await axios.post(
            `${API_URL}/service-providers/provider/${requestId}/complete`,
            data,
            {
                headers: {
                    Authorization:
                        `Bearer ${token}`,
                },
            }
        );

    return response;
};

export const getProviderDashboard = async () => {

    const token =
        localStorage.getItem(
            "token"
        );


    const response =
        await axios.get(
            `${API_URL}/service-providers/dashboard`,
            {
                headers: {
                    Authorization:
                        `Bearer ${token}`,
                },
            }
        );


    return response;
};

export const getProviderSchedule = async ({ startDate, endDate } = {}) => {

    const token =
        localStorage.getItem("token");


    const response =
        await axios.get(
            `${API_URL}/service-providers/schedule`,
            {
                headers: {
                    Authorization:
                        `Bearer ${token}`,
                },

                params: {
                    startDate,
                    endDate,
                },
            }
        );


    return response;
};

export const getMyProvider = async () => {
    const token = localStorage.getItem("token");

    return axios.get(
        `${API_URL}/service-providers/me`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
};

export const updateProvider = async (data) => {
    const token = localStorage.getItem("token");

    return axios.put(
        `${API_URL}/service-providers/me`,
        data,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
};

export const updateProviderProfile = async (providerData) => {

    const token =
        localStorage.getItem("token");

    const response =
        await axios.put(
            `${API_URL}/service-providers/me`,
            providerData,
            {
                headers: {
                    Authorization:
                        `Bearer ${token}`,
                },
            }
        );

    return response;
};

export const updateProviderAvailability = async (
    availability
) => {
    const token = localStorage.getItem("token");

    return axios.patch(
        `${API_URL}/service-providers/me/availability`,
        {
            availability,
        },
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
};

export const updateProviderSettings = async (settings) => {

    const token =
        localStorage.getItem("token");

    const response =
        await axios.patch(
            `${API_URL}/service-providers/me/settings`,
            settings,
            {
                headers: {
                    Authorization:
                        `Bearer ${token}`,
                },
            }
        );

    return response;
};

export const updateProviderLocation = async (latitude, longitude) => {
    const token =
        localStorage.getItem("token");

    const response = await axios.patch(
        `${API_URL}/service-providers/me/location`,
        {
            latitude,
            longitude,
        },
        {
            headers: {
                Authorization:
                    `Bearer ${token}`,
            },
        }
    );

    return response
};

export const uploadProviderProfileImage = async (file) => {

    const formData = new FormData();

    formData.append(
        "profileImage",
        file
    );

    return axios.put(
        `${API_URL}/users/profile/image`,
        formData,
        {
            headers: getHeaders()
        }
    );
};
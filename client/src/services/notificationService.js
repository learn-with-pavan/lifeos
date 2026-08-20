import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const getNotifications = async (page = 1, limit = 20) => {
    const token = localStorage.getItem("token");
    const response = await axios.get(
        `${API_URL}/notifications`,
        {
            params: {
                page,
                limit,
            },
            headers: {
                Authorization:
                    `Bearer ${token}`,
            },
        });

    return response.data;
};

export const getUnreadNotificationCount =
    async () => {
        const token =
            localStorage.getItem("token");

        const response =
            await axios.get(
                `${API_URL}/notifications/unread-count`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                }
            );

        return response.data;
    };

export const markNotificationAsRead =
    async (notificationId) => {
        const token =
            localStorage.getItem("token");

        const response =
            await axios.patch(
                `${API_URL}/notifications/${notificationId}/read`,
                {},
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                }
            );

        return response.data;
    };

export const markAllNotificationsAsRead =
    async () => {
        const token =
            localStorage.getItem("token");

        const response =
            await axios.patch(
                `${API_URL}/notifications/read-all`,
                {},
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                }
            );

        return response.data;
    };
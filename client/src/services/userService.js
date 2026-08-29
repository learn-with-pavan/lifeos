import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const getAuthHeaders = () => {
    const token = localStorage.getItem("token");

    return {
        Authorization: `Bearer ${token}`,
    };
};
export const getUserProfile = async () => {
    const response = await axios.get(
        `${API_URL}/users/profile`,
        {
            headers: getAuthHeaders(),
        }
    );

    return response.data;
};


export const updateUserProfile = async (
    profileData
) => {
    const response = await axios.put(
        `${API_URL}/users/profile`,
        profileData,
        {
            headers: getAuthHeaders(),
        }
    );

    return response.data;
};

export const uploadProfileImage = async (file) => {
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("profileImage", file);

    const response = await axios.put(
        `${API_URL}/users/profile/image`,
        formData,
        {
            headers: {
                "Content-Type":
                    "multipart/form-data",
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response.data;
};


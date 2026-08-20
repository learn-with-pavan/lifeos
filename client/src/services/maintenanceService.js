import axios from "axios";

const API_URL =
    "http://localhost:5000/api/maintenance";

const getAuthHeaders = () => {
    const token = localStorage.getItem("token");

    return {
        Authorization: `Bearer ${token}`,
    };
};

/*
    Get all maintenance
*/

export const getMaintenances = async () => {
    const response = await axios.get(
        API_URL,
        {
            headers: getAuthHeaders(),
        }
    );

    return response.data;
};

/*
    Get maintenance for an asset
*/

export const getMaintenanceByAsset = async (
    assetId
) => {
    const response = await axios.get(
        `${API_URL}/assets/${assetId}/maintenance`,
        {
            headers: getAuthHeaders(),
        }
    );

    return response.data;
};

/*
    Get one maintenance
*/

export const getMaintenanceById = async (
    maintenanceId
) => {
    const response = await axios.get(
        `${API_URL}/${maintenanceId}`,
        {
            headers: getAuthHeaders(),
        }
    );

    return response.data;
};

/*
    Create maintenance for an asset
*/

export const createMaintenance = async (
    assetId,
    maintenanceData
) => {
    const response = await axios.post(
        `${API_URL}/assets/${assetId}/maintenance`,
        maintenanceData,
        {
            headers: getAuthHeaders(),
        }
    );

    return response.data;
};

/*
    Update maintenance
*/

export const updateMaintenance = async (
    maintenanceId,
    maintenanceData
) => {
    const response = await axios.put(
        `${API_URL}/${maintenanceId}`,
        maintenanceData,
        {
            headers: getAuthHeaders(),
        }
    );

    return response.data;
};

/*
    Delete maintenance
*/

export const deleteMaintenance = async (
    maintenanceId
) => {
    const response = await axios.delete(
        `${API_URL}/${maintenanceId}`,
        {
            headers: getAuthHeaders(),
        }
    );

    return response.data;
};
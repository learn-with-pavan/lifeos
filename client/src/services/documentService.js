import axios from "axios";


const API_URL =
    import.meta.env.VITE_API_URL;


const getAuthHeaders = () => {

    const token =
        localStorage.getItem("token");

    return {
        Authorization:
            `Bearer ${token}`,
    };
};


// =====================================================
// GET ALL DOCUMENTS
// =====================================================

export const getDocuments = async () => {

    const response =
        await axios.get(
            `${API_URL}/documents`,
            {
                headers:
                    getAuthHeaders(),
            }
        );

    return response.data;
};


// =====================================================
// CREATE DOCUMENT
// =====================================================

export const createDocument = async (
    documentData
) => {

    const formData =
        new FormData();


    formData.append(
        "asset",
        documentData.asset
    );


    formData.append(
        "type",
        documentData.type
    );


    formData.append(
        "name",
        documentData.name
    );


    if (
        documentData.description
    ) {

        formData.append(
            "description",
            documentData.description
        );
    }


    if (
        documentData.documentDate
    ) {

        formData.append(
            "documentDate",
            documentData.documentDate
        );
    }


    if (
        documentData.expiryDate
    ) {

        formData.append(
            "expiryDate",
            documentData.expiryDate
        );
    }


    if (
        Array.isArray(
            documentData.files
        )
    ) {

        documentData.files.forEach(
            (file) => {

                formData.append(
                    "files",
                    file
                );
            }
        );
    }


    const response =
        await axios.post(
            `${API_URL}/documents`,
            formData,
            {
                headers: {
                    ...getAuthHeaders(),
                    // DO NOT manually set
                    // Content-Type.
                    //
                    // Browser will set the
                    // multipart boundary.
                },
            }
        );


    return response.data;
};


// =====================================================
// GET DOCUMENT BY ID
// =====================================================

export const getDocumentById =
    async (
        documentId
    ) => {

        const response =
            await axios.get(
                `${API_URL}/documents/${documentId}`,
                {
                    headers:
                        getAuthHeaders(),
                }
            );

        return response.data;
    };


// =====================================================
// UPDATE DOCUMENT
//
// Metadata + ADDITIONAL FILES
// =====================================================

export const updateDocument =
    async (
        documentId,
        documentData
    ) => {

        const formData =
            new FormData();


        if (
            documentData.type !==
            undefined
        ) {

            formData.append(
                "type",
                documentData.type
            );
        }


        if (
            documentData.name !==
            undefined
        ) {

            formData.append(
                "name",
                documentData.name
            );
        }


        if (
            documentData.description !==
            undefined
        ) {

            formData.append(
                "description",
                documentData.description
            );
        }


        if (
            documentData.documentDate !==
            undefined
        ) {

            formData.append(
                "documentDate",
                documentData.documentDate || ""
            );
        }


        if (
            documentData.expiryDate !==
            undefined
        ) {

            formData.append(
                "expiryDate",
                documentData.expiryDate || ""
            );
        }


        if (
            Array.isArray(
                documentData.files
            )
        ) {

            documentData.files.forEach(
                (file) => {

                    formData.append(
                        "files",
                        file
                    );
                }
            );
        }


        const response =
            await axios.put(
                `${API_URL}/documents/${documentId}`,
                formData,
                {
                    headers: {
                        ...getAuthHeaders(),
                    },
                }
            );


        return response.data;
    };


// =====================================================
// DELETE DOCUMENT
// =====================================================

export const deleteDocument =
    async (
        documentId
    ) => {

        const response =
            await axios.delete(
                `${API_URL}/documents/${documentId}`,
                {
                    headers:
                        getAuthHeaders(),
                }
            );

        return response.data;
    };


// =====================================================
// DELETE INDIVIDUAL FILE
// =====================================================

export const deleteDocumentFile =
    async (
        documentId,
        fileId
    ) => {

        const response =
            await axios.delete(
                `${API_URL}/documents/${documentId}/files/${fileId}`,
                {
                    headers:
                        getAuthHeaders(),
                }
            );

        return response.data;
    };


// =====================================================
// GET DOCUMENTS FOR ASSET
// =====================================================

export const getDocumentsByAsset =
    async (
        assetId
    ) => {

        const response =
            await axios.get(
                `${API_URL}/documents/assets/${assetId}`,
                {
                    headers:
                        getAuthHeaders(),
                }
            );

        return response.data;
    };
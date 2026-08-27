export const formatAddress = (address) => {
    if (!address) {
        return "";
    }

    if (typeof address === "string") {
        return address;
    }

    return [
        address.line1,
        address.line2,
        address.city,
        address.state,
        address.pincode,
    ]
        .filter(Boolean)
        .join(", ");
};
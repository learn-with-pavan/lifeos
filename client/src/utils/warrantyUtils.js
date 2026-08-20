export const getWarrantyStatus = (endDate) => {
  const today = new Date();

  const expiryDate = new Date(endDate);

  today.setHours(0, 0, 0, 0);
  expiryDate.setHours(0, 0, 0, 0);

  const difference =
    expiryDate.getTime() - today.getTime();

  const daysRemaining = Math.ceil(
    difference / (1000 * 60 * 60 * 24)
  );

  if (daysRemaining < 0) {
    return {
      label: "Expired",
      type: "expired",
      daysRemaining,
    };
  }

  if (daysRemaining <= 30) {
    return {
      label: "Expiring soon",
      type: "warning",
      daysRemaining,
    };
  }

  return {
    label: "Active",
    type: "active",
    daysRemaining,
  };
};
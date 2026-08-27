import {
  Bell,
  ShieldAlert,
  Wrench,
  FileWarning,
  CreditCard,
  Info,
} from "lucide-react";

export const getNotificationIcon = (
  type
) => {
  switch (type) {
    case "WARRANTY_EXPIRY":
      return ShieldAlert;

    case "SERVICE_DUE":
      return Wrench;

    case "DOCUMENT_EXPIRY":
      return FileWarning;

    case "PAYMENT_DUE":
      return CreditCard;

    case "SYSTEM":
      return Info;

    case "PAYMENT_CREATED":
      return CreditCard;

    case "PAYMENT_COMPLETED":
      return CreditCard;

    default:
      return Bell;
  }
};
import { useEffect, useMemo, useState } from "react";
import {
    Bell,
    Check,
    ChevronLeft,
    ChevronRight,
    Inbox,
} from "lucide-react";

import {
    getNotifications,
    markAllNotificationsAsRead,
    markNotificationAsRead,
} from "../services/notificationService";

import { getNotificationIcon } from "../utils/notificationUtils";
import { useToast } from "../context/ToastContext";
import LoadingState from "../components/LoadingState";
import ReviewModal from "../components/ReviewModal";

import "../styles/notification.css";

const PAGE_SIZE = 20;

const Notifications = () => {
    const toast = useToast();

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState(null);
    const [reviewRequestId, setReviewRequestId] = useState(null);
    const [markingAll, setMarkingAll] = useState(false);

    const loadNotifications = async (pageNumber = page) => {
        try {
            setLoading(true);

            const data = await getNotifications(
                pageNumber,
                PAGE_SIZE
            );

            setNotifications(data.notifications || []);
            setPagination(data.pagination || null);
        } catch (error) {
            console.error(
                "Failed to load notifications",
                error
            );

            toast.error(
                error.response?.data?.message ||
                "Failed to load notifications"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadNotifications(page);
    }, [page]);

    const unreadCount = useMemo(
        () =>
            notifications.filter(
                (notification) =>
                    !notification.isRead
            ).length,
        [notifications]
    );

    const handleNotificationClick = async (notification) => {
        try {
            if (!notification.isRead) {
                await markNotificationAsRead(
                    notification._id
                );

                setNotifications((current) =>
                    current.map((item) =>
                        item._id === notification._id
                            ? {
                                ...item,
                                isRead: true,
                                readAt: new Date(),
                            }
                            : item
                    )
                );
            }

            if (
                notification.type ===
                "SERVICE_REVIEW_REQUEST" ||
                notification.type ===
                "SERVICE_COMPLETED"
            ) {
                const requestId =
                    notification.serviceRequest?._id ||
                    notification.serviceRequest;

                if (requestId) {
                    setReviewRequestId(requestId);
                }
            }
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Failed to handle notification"
            );
        }
    };

    const handleMarkAllAsRead = async () => {
        if (!unreadCount || markingAll) {
            return;
        }

        try {
            setMarkingAll(true);

            await markAllNotificationsAsRead();

            setNotifications((current) =>
                current.map((notification) => ({
                    ...notification,
                    isRead: true,
                    readAt: new Date(),
                }))
            );

            toast.success(
                "All notifications marked as read"
            );
        } catch (error) {
            console.error(
                "Failed to mark all notifications as read",
                error
            );

            toast.error(
                error.response?.data?.message ||
                "Failed to mark all notifications as read"
            );
        } finally {
            setMarkingAll(false);
        }
    };

    const formatTime = (date) => {
        if (!date) {
            return "";
        }

        const value = new Date(date);
        const now = new Date();
        const diff = Math.max(
            0,
            now.getTime() - value.getTime()
        );

        const minutes = Math.floor(
            diff / (1000 * 60)
        );

        if (minutes < 1) {
            return "Just now";
        }

        if (minutes < 60) {
            return `${minutes}m ago`;
        }

        const hours = Math.floor(minutes / 60);

        if (hours < 24) {
            return `${hours}h ago`;
        }

        const days = Math.floor(hours / 24);

        if (days < 7) {
            return `${days}d ago`;
        }

        return value.toLocaleDateString(
            "en-IN",
            {
                day: "numeric",
                month: "short",
                year: "numeric",
            }
        );
    };

    if (loading) {
        return (
            <LoadingState
                title="Loading notifications"
                message="We're checking for your latest updates."
            />
        );
    }

    return (
        <div className="notifications-page">

            {/* Header */}

            <div className="notifications-header">

                <div className="notifications-header-content">

                    <div className="notifications-title-icon">
                        <Bell size={20} />
                    </div>

                    <div>
                        <div className="notifications-title-row">

                            <h1>
                                Notifications
                            </h1>

                            {unreadCount > 0 && (
                                <span className="notifications-unread-count">
                                    {unreadCount} unread
                                </span>
                            )}

                        </div>

                        <p>
                            Stay up to date with your
                            important reminders and updates.
                        </p>
                    </div>

                </div>

                <button
                    type="button"
                    className="mark-all-read-button"
                    onClick={handleMarkAllAsRead}
                    disabled={
                        unreadCount === 0 ||
                        markingAll
                    }
                >
                    <Check size={15} />

                    {markingAll
                        ? "Marking..."
                        : "Mark all as read"}
                </button>

            </div>


            {/* Notifications */}

            {notifications.length === 0 ? (

                <div className="notifications-empty">

                    <div className="notifications-empty-icon">
                        <Inbox size={28} />
                    </div>

                    <h2>
                        You're all caught up
                    </h2>

                    <p>
                        You don't have any notifications
                        waiting for you right now.
                    </p>

                </div>

            ) : (

                <div className="notifications-list">

                    {notifications.map(
                        (notification) => {

                            const Icon =
                                getNotificationIcon(
                                    notification.type
                                );

                            return (
                                <button
                                    key={
                                        notification._id
                                    }
                                    type="button"
                                    className={`notification-row ${notification.isRead
                                            ? ""
                                            : "notification-row-unread"
                                        }`}
                                    onClick={() =>
                                        handleNotificationClick(
                                            notification
                                        )
                                    }
                                >

                                    {/* Icon */}

                                    <div className="notification-icon-wrapper">
                                        <Icon size={19} />
                                    </div>


                                    {/* Content */}

                                    <div className="notification-content">

                                        <div className="notification-content-top">

                                            <strong>
                                                {
                                                    notification.title
                                                }
                                            </strong>

                                            {!notification.isRead && (
                                                <span className="notification-unread-dot" />
                                            )}

                                        </div>

                                        <p>
                                            {
                                                notification.message
                                            }
                                        </p>


                                        <div className="notification-meta">

                                            {notification.asset && (
                                                <span>
                                                    {
                                                        notification
                                                            .asset
                                                            .name
                                                    }
                                                </span>
                                            )}

                                            <span
                                                title={
                                                    new Date(
                                                        notification.createdAt
                                                    ).toLocaleString(
                                                        "en-IN"
                                                    )
                                                }
                                            >
                                                {formatTime(
                                                    notification.createdAt
                                                )}
                                            </span>

                                        </div>

                                    </div>


                                    {/* Read state */}

                                    {!notification.isRead && (
                                        <span className="notification-new-label">
                                            New
                                        </span>
                                    )}

                                </button>
                            );
                        }
                    )}

                </div>
            )}


            {/* Pagination */}

            {pagination &&
                pagination.totalPages > 1 && (
                    <div className="notifications-pagination">

                        <button
                            type="button"
                            disabled={page === 1}
                            onClick={() =>
                                setPage(
                                    (current) =>
                                        current - 1
                                )
                            }
                        >
                            <ChevronLeft size={16} />
                            Previous
                        </button>

                        <span>
                            Page{" "}
                            <strong>
                                {page}
                            </strong>{" "}
                            of{" "}
                            <strong>
                                {
                                    pagination.totalPages
                                }
                            </strong>
                        </span>

                        <button
                            type="button"
                            disabled={
                                page ===
                                pagination.totalPages
                            }
                            onClick={() =>
                                setPage(
                                    (current) =>
                                        current + 1
                                )
                            }
                        >
                            Next
                            <ChevronRight size={16} />
                        </button>

                    </div>
                )}


            {/* Review Modal */}

            {reviewRequestId && (
                <ReviewModal
                    serviceRequestId={
                        reviewRequestId
                    }
                    onClose={() =>
                        setReviewRequestId(null)
                    }
                    onSubmitted={() => {
                        setReviewRequestId(null);

                        toast.success(
                            "Thank you for your feedback!"
                        );

                        loadNotifications(page);
                    }}
                />
            )}

        </div>
    );
};

export default Notifications;
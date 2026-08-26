import { useEffect, useState } from "react";

import {
    getNotifications,
    markAllNotificationsAsRead,
    markNotificationAsRead,
} from "../services/notificationService";
import { getNotificationIcon } from "../utils/notificationUtils";
import { useToast } from "../context/ToastContext";
import LoadingState from "../components/LoadingState";
import ReviewModal from "../components/ReviewModal";

const Notifications = () => {
    const toast = useToast();
    const [notifications, setNotifications] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [page, setPage] =
        useState(1);

    const [pagination, setPagination] =
        useState(null);
    const [
        reviewRequestId,
        setReviewRequestId
    ] = useState(null);

    const loadNotifications = async (pageNumber) => {
        try {
            setLoading(true);

            const data = await getNotifications(pageNumber, 20);
            setNotifications(data.notifications || []);
            setPagination(data.pagination || null);
        } catch (error) {
            console.error(
                "Failed to load notifications",
                error
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadNotifications(page);
    }, [page]);

    const handleNotificationClick = async (notification) => {

        try {

            if (!notification.isRead) {

                await markNotificationAsRead(
                    notification._id
                );

                setNotifications((current) =>
                    current.map((item) =>
                        item._id ===
                            notification._id
                            ? {
                                ...item,
                                isRead: true,
                            }
                            : item
                    )
                );
            }

            if (
                notification.type ===
                "SERVICE_REVIEW_REQUEST" || notification.type === "SERVICE_COMPLETED"
            ) {

                const requestId =
                    notification.serviceRequest?._id ||
                    notification.serviceRequest;

                if (requestId) {
                    setReviewRequestId(
                        requestId
                    );
                }
            }

        } catch (error) {

            toast.error(
                error.response?.data?.message ||
                "Failed to handle notification"
            );
        }
    };

    if (loading) {
        return (
            <LoadingState
                title="Loading notifications"
                message="We're checking for your latest updates."
            />
        );
    }

    const handleMarkAllAsRead =
        async () => {
            try {
                await markAllNotificationsAsRead();

                setNotifications((current) =>
                    current.map((notification) => ({
                        ...notification,
                        isRead: true,
                        readAt: new Date(),
                    }))
                );
                toast.success("All notifications marked as read");
            } catch (error) {
                console.error(
                    "Failed to mark all notifications as read",
                    error
                );
                toast.error(error.response?.data?.message || "Failed to mark all notifications as read");
            }
        };

    return (
        <div className="page-container">

            <div className="page-header">
                <div>
                    <h1>
                        Notifications
                    </h1>

                    <p>
                        Stay up to date with your
                        important reminders.
                    </p>
                </div>

                <button
                    className="mark-all-read-button"
                    onClick={handleMarkAllAsRead}
                >
                    Mark all as read
                </button>
            </div>

            {notifications.length === 0 ? (
                <div className="empty-state">

                    <div className="empty-state-icon">
                        🔔
                    </div>

                    <h2>
                        You're all caught up
                    </h2>

                    <p>
                        You don't have any
                        notifications yet.
                    </p>

                </div>
            ) : (
                <div className="notifications-page-list">

                    {notifications.map(
                        (notification) => (
                            <div
                                key={
                                    notification._id
                                }
                                className={`notification-page-item ${!notification.isRead
                                    ? "notification-page-unread"
                                    : ""
                                    }`}
                                onClick={() =>
                                    handleNotificationClick(
                                        notification
                                    )
                                }
                            >

                                <div className="notification-page-icon">
                                    {(() => {
                                        const Icon =
                                            getNotificationIcon(
                                                notification.type
                                            );

                                        return <Icon size={20} />;
                                    })()}
                                </div>

                                <div className="notification-page-content">

                                    <div className="notification-page-title">

                                        <strong>
                                            {notification.title}
                                        </strong>

                                        {!notification.isRead && (
                                            <span className="unread-dot" />
                                        )}

                                    </div>

                                    <p>
                                        {notification.message}
                                    </p>

                                    {notification.asset && (
                                        <small>
                                            Asset:{" "}
                                            {notification.asset.name}
                                        </small>
                                    )}

                                    <small>
                                        {new Date(
                                            notification.createdAt
                                        ).toLocaleString()}
                                    </small>

                                </div>

                            </div>
                        )
                    )}

                </div>
            )}

            {pagination && pagination.totalPages > 1 && (
                <div className="pagination">

                    <button
                        disabled={
                            page === 1
                        }
                        onClick={() =>
                            setPage(
                                (current) =>
                                    current - 1
                            )
                        }
                    >
                        Previous
                    </button>

                    <span>
                        Page {page} of{" "}
                        {pagination.totalPages}
                    </span>

                    <button
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
                    </button>

                </div>
            )}

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
import {
    CheckCircle2,
    RefreshCw,
    Star,
    X,
    XCircle,
} from "lucide-react";

import { useEffect, useState } from "react";

import { createReview } from "../services/reviewService";
import "../styles/reviewModal.css";

const ReviewModal = ({
    serviceRequestId,
    onClose,
    onSubmitted,
}) => {

    const [rating, setRating] =
        useState(0);

    const [comment, setComment] =
        useState("");

    const [submitting, setSubmitting] =
        useState(false);

    const [error, setError] =
        useState("");

    useEffect(() => {

        const handleEscape = (event) => {

            if (event.key === "Escape") {
                onClose();
            }
        };

        document.addEventListener(
            "keydown",
            handleEscape
        );

        return () => {
            document.removeEventListener(
                "keydown",
                handleEscape
            );
        };

    }, [onClose]);

    const handleSubmit = async (event) => {

        event.preventDefault();

        if (!rating) {
            setError(
                "Please select a rating."
            );
            return;
        }

        try {

            setSubmitting(true);
            setError("");

            const response =
                await createReview({
                    serviceRequestId,

                    rating,

                    comment,
                });

            onSubmitted(
                response.review
            );

        } catch (error) {

            setError(
                error?.response?.data?.message ||
                "Unable to submit review."
            );

        } finally {

            setSubmitting(false);

        }
    };

    return (
        <div
            className="review-modal-backdrop"
            onMouseDown={(event) => {

                if (
                    event.target ===
                    event.currentTarget
                ) {
                    onClose();
                }

            }}
        >

            <div
                className="review-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="review-modal-title"
            >

                <div className="review-modal-header">

                    <div>

                        <div className="review-modal-eyebrow">
                            Service completed
                        </div>

                        <h2 id="review-modal-title">
                            How was your service?
                        </h2>

                        <p>
                            Rate your experience with
                            the service provider.
                        </p>

                    </div>

                    <button
                        type="button"
                        className="review-modal-close"
                        onClick={onClose}
                        aria-label="Close review"
                    >
                        <X size={20} />
                    </button>

                </div>


                <form
                    className="review-modal-form"
                    onSubmit={handleSubmit}
                >

                    <div className="review-modal-rating">

                        <span>
                            Your rating
                        </span>

                        <div className="review-modal-stars">

                            {[1, 2, 3, 4, 5].map(
                                (star) => (

                                    <button
                                        key={star}
                                        type="button"
                                        className={
                                            star <= rating
                                                ? "active"
                                                : ""
                                        }
                                        onClick={() =>
                                            setRating(
                                                star
                                            )
                                        }
                                        aria-label={
                                            `Rate ${star} out of 5`
                                        }
                                    >
                                        <Star
                                            size={34}
                                            fill={
                                                star <= rating
                                                    ? "currentColor"
                                                    : "none"
                                            }
                                        />
                                    </button>

                                )
                            )}

                        </div>

                        {rating > 0 && (
                            <strong>
                                {rating}/5
                            </strong>
                        )}

                    </div>


                    <div className="review-modal-field">

                        <label htmlFor="review-modal-comment">
                            Your feedback
                        </label>

                        <textarea
                            id="review-modal-comment"
                            value={comment}
                            onChange={(event) =>
                                setComment(
                                    event.target.value
                                )
                            }
                            rows={5}
                            maxLength={1000}
                            placeholder="Tell us about your service experience..."
                        />

                        <small>
                            {comment.length}/1000
                        </small>

                    </div>


                    {error && (

                        <div className="review-modal-error">

                            <XCircle size={17} />

                            <span>
                                {error}
                            </span>

                        </div>

                    )}


                    <div className="review-modal-actions">

                        <button
                            type="button"
                            className="review-modal-cancel"
                            onClick={onClose}
                            disabled={submitting}
                        >
                            Maybe later
                        </button>

                        <button
                            type="submit"
                            className="review-modal-submit"
                            disabled={
                                submitting ||
                                !rating
                            }
                        >

                            {submitting ? (
                                <>
                                    <RefreshCw
                                        size={16}
                                        className="review-modal-spin"
                                    />

                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <Star size={16} />

                                    Submit Review
                                </>
                            )}

                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
};

export default ReviewModal;
import {
    CheckCircle2,
    CreditCard,
    Clock,
    AlertCircle,
} from "lucide-react";

import "../styles/payment.css";

const ServiceRequestPaymentCard = ({
    payment,
    onPay,
}) => {

    if (!payment) {
        return null;
    }

    const isPaid =
        payment.status === "PAID";

    const isFailed =
        payment.status === "FAILED";

    const isProcessing =
        payment.status === "PROCESSING";

    return (
        <section className="request-details-card request-payment-card">

            <div className="request-section-heading">

                <div>

                    <h2>
                        Payment
                    </h2>

                    <p>
                        Payment details for this service.
                    </p>

                </div>

                <div className="request-payment-icon">
                    <CreditCard size={22} />
                </div>

            </div>


            <div className="request-payment-summary">

                <div className="request-payment-amount">

                    <span>
                        Service cost
                    </span>

                    <strong>
                        ₹{Number(payment.amount).toLocaleString("en-IN")}
                    </strong>

                </div>


                {isPaid ? (

                    <div className="request-payment-status request-payment-paid">

                        <CheckCircle2 size={18} />

                        <div>
                            <strong>
                                Payment completed
                            </strong>

                            {payment.paidAt && (
                                <span>
                                    Paid on{" "}
                                    {new Date(
                                        payment.paidAt
                                    ).toLocaleDateString()}
                                </span>
                            )}
                        </div>

                    </div>

                ) : isFailed ? (

                    <div className="request-payment-status request-payment-failed">

                        <AlertCircle size={18} />

                        <div>
                            <strong>
                                Payment failed
                            </strong>

                            <span>
                                Please try again.
                            </span>
                        </div>

                    </div>

                ) : isProcessing ? (

                    <div className="request-payment-status request-payment-processing">

                        <Clock size={18} />

                        <div>

                            <strong>
                                Payment processing
                            </strong>

                            <span>
                                Your payment is being processed.
                            </span>

                        </div>

                    </div>

                ) : (

                    <div className="request-payment-status request-payment-pending">

                        <Clock size={18} />

                        <div>
                            <strong>
                                Payment pending
                            </strong>

                            <span>
                                Payment is required for this service.
                            </span>
                        </div>

                    </div>

                )}

            </div>


            {!isPaid && (
                <div className="request-payment-actions">

                    <button
                        type="button"
                        className="request-details-primary-button"
                        onClick={onPay}
                    >
                        <CreditCard size={17} />

                        Pay ₹
                        {Number(
                            payment.amount
                        ).toLocaleString("en-IN")}

                    </button>

                </div>
            )}

        </section>
    );
};

export default ServiceRequestPaymentCard;
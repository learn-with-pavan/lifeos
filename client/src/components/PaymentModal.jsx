import {
    CheckCircle2,
    CreditCard,
    LoaderCircle,
    X,
    AlertCircle,
} from "lucide-react";

import { useState } from "react";

import {
    processPayment,
} from "../services/paymentService";

import "../styles/payment.css";


const PAYMENT_METHODS = [
    {
        value: "UPI",
        label: "UPI",
        description: "Pay using UPI",
    },
    {
        value: "CARD",
        label: "Card",
        description: "Credit or debit card",
    },
    {
        value: "NET_BANKING",
        label: "Net Banking",
        description: "Pay using your bank",
    },
    {
        value: "WALLET",
        label: "Wallet",
        description: "Pay using a digital wallet",
    },
];


const PaymentModal = ({
    payment,
    onClose,
    onSuccess,
}) => {

    const [method, setMethod] =
        useState("");

    const [processing, setProcessing] =
        useState(false);

    const [error, setError] =
        useState("");


    if (!payment) {
        return null;
    }


    const amount =
        Number(payment.amount)
            .toLocaleString("en-IN");


    const handlePayment = async () => {

        if (!method) {

            setError(
                "Please select a payment method."
            );

            return;
        }


        try {

            setProcessing(true);
            setError("");


            const response =
                await processPayment(
                    payment._id,
                    {
                        method,
                    }
                );


            if (response?.payment) {

                onSuccess(
                    response.payment
                );

            }

        } catch (error) {

            setError(
                error?.response?.data?.message ||
                "Payment failed. Please try again."
            );

        } finally {

            setProcessing(false);

        }
    };


    return (
        <div
            className="payment-modal-overlay"
            onMouseDown={(event) => {

                if (
                    event.target ===
                    event.currentTarget
                ) {
                    onClose();
                }

            }}
        >

            <div className="payment-modal">

                <div className="payment-modal-header">

                    <div>

                        <span className="payment-modal-eyebrow">
                            LifeOS Payment
                        </span>

                        <h2>
                            Complete payment
                        </h2>

                        <p>
                            Securely pay for your completed service.
                        </p>

                    </div>


                    <button
                        type="button"
                        className="payment-modal-close"
                        onClick={onClose}
                        disabled={processing}
                        aria-label="Close payment"
                    >
                        <X size={20} />
                    </button>

                </div>


                <div className="payment-modal-amount">

                    <span>
                        Amount due
                    </span>

                    <strong>
                        ₹{amount}
                    </strong>

                </div>


                <div className="payment-modal-provider">

                    <div className="payment-modal-provider-icon">
                        <CreditCard size={19} />
                    </div>

                    <div>

                        <span>
                            Service provider
                        </span>

                        <strong>
                            {payment.serviceProvider?.businessName ||
                                "Service Provider"}
                        </strong>

                    </div>

                </div>


                <div className="payment-method-section">

                    <div className="payment-method-heading">

                        <strong>
                            Payment method
                        </strong>

                        <span>
                            Select one
                        </span>

                    </div>


                    <div className="payment-method-list">

                        {PAYMENT_METHODS.map(
                            (item) => (

                                <button
                                    key={item.value}
                                    type="button"
                                    className={`payment-method-option ${method === item.value
                                            ? "payment-method-selected"
                                            : ""
                                        }`}
                                    onClick={() =>
                                        setMethod(
                                            item.value
                                        )
                                    }
                                    disabled={processing}
                                >

                                    <div className="payment-method-radio">

                                        {method ===
                                            item.value && (
                                                <span />
                                            )}

                                    </div>

                                    <div>

                                        <strong>
                                            {item.label}
                                        </strong>

                                        <span>
                                            {item.description}
                                        </span>

                                    </div>

                                </button>

                            )
                        )}

                    </div>

                </div>


                {error && (

                    <div className="payment-modal-error">

                        <AlertCircle size={17} />

                        <span>
                            {error}
                        </span>

                    </div>

                )}


                <div className="payment-modal-actions">

                    <button
                        type="button"
                        className="payment-modal-cancel"
                        onClick={onClose}
                        disabled={processing}
                    >
                        Cancel
                    </button>


                    <button
                        type="button"
                        className="payment-modal-submit"
                        onClick={handlePayment}
                        disabled={
                            processing ||
                            !method
                        }
                    >

                        {processing ? (

                            <>
                                <LoaderCircle
                                    size={17}
                                    className="payment-spin"
                                />

                                Processing...
                            </>

                        ) : (

                            <>
                                <CreditCard size={17} />

                                Pay ₹{amount}
                            </>

                        )}

                    </button>

                </div>


                <div className="payment-modal-demo-note">

                    <CheckCircle2 size={15} />

                    <span>
                        Demo payment mode. A real payment gateway
                        will be connected later.
                    </span>

                </div>

            </div>

        </div>
    );
};


export default PaymentModal;
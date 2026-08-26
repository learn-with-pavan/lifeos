const {
    processEvent,
} = require("./automationService");

const emitServiceRequestEvent = async ({
    event,
    request,
    customerMessage,
    providerMessage,
}) => {

    const customerId =
        request.user?._id ||
        request.user;


    const providerId =
        request.serviceProvider?.user ||
        null;


    const entityId =
        request._id;

    console.log(customerId, providerId, customerMessage, providerMessage, "Notifications")
    /*
     * CUSTOMER
     */

    if (customerId) {

        await processEvent(
            event,
            {
                userId: customerId,

                assetId:
                    request.asset?._id ||
                    request.asset ||
                    null,

                entityId,

                serviceRequestId:
                    request._id,

                recipientRole:
                    "CUSTOMER",

                message:
                    customerMessage ||
                    "Your service request has been updated.",
            }
        );
    }


    /*
     * PROVIDER
     */

    if (providerId) {

        await processEvent(
            event,
            {
                userId: providerId,

                assetId:
                    request.asset?._id ||
                    request.asset ||
                    null,

                entityId,

                serviceRequestId:
                    request._id,

                recipientRole:
                    "PROVIDER",

                message:
                    providerMessage ||
                    "A service request has been updated.",
            }
        );
    }
};


module.exports = {
    emitServiceRequestEvent,
};
import { RefreshCw } from "lucide-react";

const LoadingState = ({ title = "Loading", message = "Please wait while we prepare this page." }) => {
    return (
        <div className="lifeos-loading-state">
            <RefreshCw
                size={28}
                className="lifeos-loading-spinner"
            />

            <h2>{title}</h2>
            <p>{message}</p>
        </div>
    );
};

export default LoadingState;

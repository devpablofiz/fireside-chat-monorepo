import { useEffect, useState, useRef } from "react";
import { useNetworkStatus } from "../context/NetworkStatusProvider.tsx";

const baseClass = "absolute bottom-5 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-md shadow-lg text-white text-center";

const OfflineBanner = () => {
    const { isOffline } = useNetworkStatus();
    const [showBanner, setShowBanner] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (isOffline) {
            // Show the banner when offline
            setShowBanner(true);

            // Clear any previous timeout when going offline
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        } else {
            timeoutRef.current = setTimeout(() => setShowBanner(false), 2000);
        }

        // Cleanup on unmount or change of status
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [isOffline]);

    if (!showBanner) return null;

    return (
        <div
            className={`${baseClass} ${isOffline ? "bg-red-500" : "bg-green-500 animate-fade"}`}
        >
            {isOffline ? "You are offline!" : "Back online!"}
        </div>
    );
};

export default OfflineBanner;

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface NetworkStatusContextType {
    isOffline: boolean;
}

const NetworkStatusContext = createContext<NetworkStatusContextType | undefined>(undefined);

export const NetworkStatusProvider = ({ children }: { children: ReactNode }) => {
    const [isOffline, setIsOffline] = useState(!navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    return (
        <NetworkStatusContext.Provider value={{ isOffline }}>
            {children}
        </NetworkStatusContext.Provider>
    );
};

export const useNetworkStatus = () => {
    const context = useContext(NetworkStatusContext);
    if (!context) {
        throw new Error("useNetworkStatus must be used within a NetworkStatusProvider");
    }
    return context;
};

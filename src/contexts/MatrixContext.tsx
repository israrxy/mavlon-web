import React, { createContext, useContext, useState, useEffect } from 'react';
import * as sdk from 'matrix-js-sdk';

interface MatrixContextType {
    client: sdk.MatrixClient | null;
    isLoggedIn: boolean;
    setClient: (client: sdk.MatrixClient | null) => void;
    logout: () => void;
}

const MatrixContext = createContext<MatrixContextType | undefined>(undefined);

export function MatrixProvider({ children }: { children: React.ReactNode }) {
    const [client, setClient] = useState<sdk.MatrixClient | null>(null);

    // Derive isLoggedIn from client
    const isLoggedIn = client !== null;

    useEffect(() => {
        // Try to restore session from local storage
        const accessToken = localStorage.getItem('matrix_access_token');
        const userId = localStorage.getItem('matrix_user_id');
        const deviceId = localStorage.getItem('matrix_device_id');
        const homeserverUrl = localStorage.getItem('matrix_homeserver_url');

        if (accessToken && userId && deviceId && homeserverUrl) {
            const newClient = sdk.createClient({
                baseUrl: homeserverUrl,
                accessToken,
                userId,
                deviceId,
            });
            newClient.startClient();
            setClient(newClient);
        }
    }, []);

    const logout = () => {
        if (client) {
            client.stopClient();
            client.logout();
        }
        setClient(null);
        localStorage.removeItem('matrix_access_token');
        localStorage.removeItem('matrix_user_id');
        localStorage.removeItem('matrix_device_id');
        localStorage.removeItem('matrix_homeserver_url');
    };

    return (
        <MatrixContext.Provider value={{ client, isLoggedIn, setClient, logout }}>
            {children}
        </MatrixContext.Provider>
    );
}

export function useMatrix() {
    const context = useContext(MatrixContext);
    if (context === undefined) {
        throw new Error('useMatrix must be used within a MatrixProvider');
    }
    return context;
}

import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface MusicContextType {
    isMusicVisible: boolean;
    setIsMusicVisible: (visible: boolean) => void;
    toggleMusic: () => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const useMusicContext = () => {
    const context = useContext(MusicContext);
    if (!context) {
        throw new Error('useMusicContext must be used within MusicProvider');
    }
    return context;
};

export const MusicProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isMusicVisible, setIsMusicVisible] = useState(false);

    const toggleMusic = () => setIsMusicVisible(prev => !prev);

    return (
        <MusicContext.Provider value={{ isMusicVisible, setIsMusicVisible, toggleMusic }}>
            {children}
        </MusicContext.Provider>
    );
};

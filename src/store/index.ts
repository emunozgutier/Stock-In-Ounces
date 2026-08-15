
import useStyle from './useStyle';
import useWindow from './useWindow';
import useState from './useState';

// Register stores with the Zustand browser extension
// https://github.com/pmndrs/zustand#using-zustand-without-react
declare global {
    interface Window {
        __registerZustandStore?: (store: unknown, name: string) => void;
    }
}

if (import.meta.env.DEV && typeof window !== 'undefined') {
    const register = window.__registerZustandStore;
    if (typeof register === 'function') {
        register(useStyle, 'StyleStore');
        register(useWindow, 'WindowStore');
        register(useState, 'AppState');
    }
}

export { useStyle, useWindow, useState };

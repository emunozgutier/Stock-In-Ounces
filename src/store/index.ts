
import useStyle from './useStyle';
import useWindow from './useWindow';
import useState from './useState';
import useSelection from './useSelection';
import useData from './useData';

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
        //register(useSelection, 'SelectionStore');
        register(useData, 'DataStore');
    }
}

export { useStyle, useWindow, useState, useSelection, useData };

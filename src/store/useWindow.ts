import { create } from 'zustand';

type DeviceType = 'Monitor' | 'Phone Vertical' | 'Phone Horizontal';

interface WindowState {
    deviceType: DeviceType;
    setDeviceType: (type: DeviceType) => void;
}

const useWindow = create<WindowState>((set) => ({
    deviceType: 'Monitor',
    setDeviceType: (type) => set({ deviceType: type }),
}));

export default useWindow;

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

type DeviceType = 'Monitor' | 'Phone Vertical' | 'Phone Horizontal';

interface WindowState {
    deviceType: DeviceType;
    setDeviceType: (type: DeviceType) => void;
}

const useWindow = create<WindowState>()(
    devtools(
        (set) => ({
            deviceType: 'Monitor',
            setDeviceType: (type) => set({ deviceType: type }, false, 'setDeviceType'),
        }),
        { name: 'WindowStore' }
    )
);

export default useWindow;

import { useState, useEffect } from 'react';

interface BatteryManager {
  level: number;
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
  addEventListener(type: string, listener: () => void): void;
}

interface NavigatorWithBattery extends Navigator {
  getBattery?: () => Promise<BatteryManager>;
}

interface BatteryState {
  supported: boolean;
  level: number;
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
}

export function useBattery() {
  const [state, setState] = useState<BatteryState>({ supported: false, level: 1, charging: false, chargingTime: 0, dischargingTime: 0 });
  useEffect(() => {
    const nav = navigator as NavigatorWithBattery;
    if (!nav.getBattery) return;
    nav.getBattery().then((battery: BatteryManager) => {
      const update = () => setState({ supported: true, level: battery.level, charging: battery.charging, chargingTime: battery.chargingTime, dischargingTime: battery.dischargingTime });
      update();
      battery.addEventListener('levelchange', update);
      battery.addEventListener('chargingchange', update);
    });
  }, []);
  return state;
}
export default useBattery;

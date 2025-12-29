import { useState, useEffect } from 'react';

interface BatteryState {
  level: number;
  charging: boolean;
}

interface BatteryManager extends EventTarget {
  level: number;
  charging: boolean;
  addEventListener(type: string, listener: EventListener): void;
  removeEventListener(type: string, listener: EventListener): void;
}

declare global {
  interface Navigator {
    getBattery?: () => Promise<BatteryManager>;
  }
}

export function useBattery(): BatteryState {
  const [battery, setBattery] = useState<BatteryState>({ level: 1, charging: false });

  useEffect(() => {
    let batteryManager: BatteryManager | null = null;
    let mounted = true;

    const handleLevelChange = () => {
      if (batteryManager && mounted) {
        setBattery({ level: batteryManager.level, charging: batteryManager.charging });
      }
    };

    const handleChargingChange = () => {
      if (batteryManager && mounted) {
        setBattery({ level: batteryManager.level, charging: batteryManager.charging });
      }
    };

    const initBattery = async () => {
      if (!navigator.getBattery) return;
      
      try {
        batteryManager = await navigator.getBattery();
        if (mounted) {
          setBattery({ level: batteryManager.level, charging: batteryManager.charging });
          batteryManager.addEventListener('levelchange', handleLevelChange);
          batteryManager.addEventListener('chargingchange', handleChargingChange);
        }
      } catch (error) {
        if (import.meta.env.DEV) console.error('Battery API error:', error);
      }
    };

    initBattery();

    // Cleanup function - prevents memory leak
    return () => {
      mounted = false;
      if (batteryManager) {
        batteryManager.removeEventListener('levelchange', handleLevelChange);
        batteryManager.removeEventListener('chargingchange', handleChargingChange);
      }
    };
  }, []);

  return battery;
}

import { useState, useEffect, useCallback } from "react";

interface NetworkConnection extends EventTarget {
  effectiveType?: "4g" | "3g" | "2g" | "slow-2g";
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
}

interface NavigatorWithConnection extends Navigator {
  connection?: NetworkConnection;
}

export interface NetworkStatus {
  isOnline: boolean;
  effectiveType?: "4g" | "3g" | "2g" | "slow-2g";
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
}

export interface UseNetworkStatusOptions {
  onStatusChange?: (status: NetworkStatus) => void;
}

export function useNetworkStatus(options: UseNetworkStatusOptions = {}) {
  const { onStatusChange } = options;

  const getNetworkStatus = useCallback((): NetworkStatus => {
    const connection = (navigator as NavigatorWithConnection).connection;
    return {
      isOnline: navigator.onLine,
      effectiveType: connection?.effectiveType,
      downlink: connection?.downlink,
      rtt: connection?.rtt,
      saveData: connection?.saveData,
    };
  }, []);

  const [status, setStatus] = useState<NetworkStatus>(getNetworkStatus);

  useEffect(() => {
    const updateStatus = () => {
      const newStatus = getNetworkStatus();
      setStatus(newStatus);
      onStatusChange?.(newStatus);
    };

    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);

    const connection = (navigator as NavigatorWithConnection).connection;
    if (connection) {
      connection.addEventListener("change", updateStatus);
    }

    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
      if (connection) {
        connection.removeEventListener("change", updateStatus);
      }
    };
  }, [getNetworkStatus, onStatusChange]);

  const isSlowConnection = status.effectiveType === "2g" || status.effectiveType === "slow-2g";
  const isFastConnection = status.effectiveType === "4g" && (status.downlink || 0) > 5;

  return { ...status, isSlowConnection, isFastConnection };
}

export default useNetworkStatus;

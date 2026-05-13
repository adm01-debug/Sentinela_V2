import { useState, useCallback, useEffect, useRef } from "react";

interface MonitorData {
  timestamp: Date;
  value: number;
  status: "normal" | "warning" | "critical";
}

export function useRealTimeMonitor(threshold = { warning: 70, critical: 90 }) {
  const [data, setData] = useState<MonitorData[]>([]);
  const [currentStatus, setCurrentStatus] = useState<MonitorData["status"]>("normal");
  const wsRef = useRef<WebSocket | null>(null);

  const addData = useCallback((value: any) => {
    const status = value >= threshold.critical ? "critical" : value >= threshold.warning ? "warning" : "normal";
    const entry: MonitorData = { timestamp: new Date(), value, status };
    setData(prev => [...prev.slice(-99), entry]);
    setCurrentStatus(status);
  }, [threshold]);

  return { data, currentStatus, addData };
}

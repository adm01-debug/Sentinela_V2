import { useState, useEffect } from "react";

type Quality = "excellent" | "good" | "fair" | "poor" | "offline";

export function useConnectionQuality() {
  const [quality, setQuality] = useState<Quality>("good");
  const [downlink, setDownlink] = useState<number>(0);
  const [rtt, setRtt] = useState<number>(0);

  useEffect(() => {
    const conn = (navigator as any).connection;
    if (!conn) return;

    const update = () => {
      setDownlink(conn.downlink || 0);
      setRtt(conn.rtt || 0);
      
      if (!navigator.onLine) setQuality("offline");
      else if (conn.downlink >= 10) setQuality("excellent");
      else if (conn.downlink >= 5) setQuality("good");
      else if (conn.downlink >= 1) setQuality("fair");
      else setQuality("poor");
    };

    conn.addEventListener("change", update);
    update();
    return () => conn.removeEventListener("change", update);
  }, []);

  return { quality, downlink, rtt, isOnline: quality !== "offline" };
}

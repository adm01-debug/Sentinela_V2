import { useState, useEffect, useMemo } from "react";

interface DeviceInfo {
  userAgent: string;
  platform: string;
  language: string;
  screenResolution: string;
  timezone: string;
  cookiesEnabled: boolean;
  doNotTrack: boolean;
}

function readKnownDevices(): string[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem("known_devices") || "[]");
    return Array.isArray(parsed)
      ? parsed.filter((value): value is string => typeof value === "string")
      : [];
  } catch {
    return [];
  }
}

export function useDeviceTrust() {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [trustScore, setTrustScore] = useState(0);
  const [isKnownDevice, setIsKnownDevice] = useState(false);

  const fingerprint = useMemo(() => {
    if (!deviceInfo) return "";
    return btoa(
      JSON.stringify([
        deviceInfo.userAgent,
        deviceInfo.platform,
        deviceInfo.screenResolution,
        deviceInfo.timezone,
      ])
    );
  }, [deviceInfo]);

  useEffect(() => {
    const info: DeviceInfo = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      cookiesEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack === "1",
    };
    setDeviceInfo(info);

    const knownDevices = readKnownDevices();
    const fp = btoa(
      JSON.stringify([info.userAgent, info.platform, info.screenResolution, info.timezone])
    );
    setIsKnownDevice(knownDevices.includes(fp));

    let score = 50;
    if (knownDevices.includes(fp)) score += 30;
    if (info.cookiesEnabled) score += 10;
    if (!info.doNotTrack) score += 10;
    setTrustScore(Math.min(100, score));
  }, []);

  const trustDevice = () => {
    if (!fingerprint) return;
    const known = readKnownDevices();
    if (!known.includes(fingerprint)) {
      known.push(fingerprint);
      localStorage.setItem("known_devices", JSON.stringify(known));
      setIsKnownDevice(true);
      setTrustScore((prev) => Math.min(100, prev + 30));
    }
  };

  const revokeDevice = () => {
    if (!fingerprint) return;
    const known = readKnownDevices().filter((d: string) => d !== fingerprint);
    localStorage.setItem("known_devices", JSON.stringify(known));
    setIsKnownDevice(false);
    setTrustScore((prev) => Math.max(0, prev - 30));
  };

  return { deviceInfo, fingerprint, trustScore, isKnownDevice, trustDevice, revokeDevice };
}

export default useDeviceTrust;

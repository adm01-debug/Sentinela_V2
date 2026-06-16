import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

interface DeviceInfo {
  fingerprint: string;
  ipAddress: string;
  userAgent: string;
  browserName: string;
  osName: string;
  deviceType: string;
}

function generateDeviceFingerprint(): DeviceInfo {
  const userAgent = navigator.userAgent;

  // Parse browser
  let browserName = "Unknown";
  if (userAgent.includes("Firefox")) browserName = "Firefox";
  else if (userAgent.includes("SamsungBrowser")) browserName = "Samsung Browser";
  else if (userAgent.includes("Opera") || userAgent.includes("OPR")) browserName = "Opera";
  else if (userAgent.includes("Trident")) browserName = "Internet Explorer";
  else if (userAgent.includes("Edge")) browserName = "Edge Legacy";
  else if (userAgent.includes("Edg")) browserName = "Edge";
  else if (userAgent.includes("Chrome")) browserName = "Chrome";
  else if (userAgent.includes("Safari")) browserName = "Safari";

  // Parse OS
  let osName = "Unknown";
  if (userAgent.includes("Windows NT 10")) osName = "Windows 10/11";
  else if (userAgent.includes("Windows")) osName = "Windows";
  else if (userAgent.includes("Mac OS X")) osName = "macOS";
  else if (userAgent.includes("Linux")) osName = "Linux";
  else if (userAgent.includes("Android")) osName = "Android";
  else if (userAgent.includes("iPhone") || userAgent.includes("iPad")) osName = "iOS";

  // Determine device type
  let deviceType = "Desktop";
  if (/Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
    deviceType = /iPad|Tablet/i.test(userAgent) ? "Tablet" : "Mobile";
  }

  // Create fingerprint from available data
  const screenInfo = `${screen.width}x${screen.height}x${screen.colorDepth}`;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const language = navigator.language;
  const platform = navigator.platform;

  const fingerprintData = `${browserName}-${osName}-${screenInfo}-${timezone}-${language}-${platform}`;
  const fingerprint = btoa(fingerprintData).slice(0, 32);

  return {
    fingerprint,
    ipAddress: "", // Will be filled by server
    userAgent,
    browserName,
    osName,
    deviceType,
  };
}

async function getPublicIP(): Promise<string> {
  try {
    const response = await fetch("https://api.ipify.org?format=json");
    const data = await response.json();
    return data.ip;
  } catch {
    return "unknown";
  }
}

export function useDeviceDetection() {
  const checkAndRegisterDevice = useCallback(async (userId: string, userEmail: string) => {
    try {
      const deviceInfo = generateDeviceFingerprint();
      const ipAddress = await getPublicIP();
      deviceInfo.ipAddress = ipAddress;

      // Create combined fingerprint with IP
      const fullFingerprint = `${deviceInfo.fingerprint}-${ipAddress}`;

      // Check if device is known
      const { data: existingDevices, error: fetchError } = await supabase
        .from("user_known_devices")
        .select("*")
        .eq("user_id", userId)
        .eq("device_fingerprint", fullFingerprint);

      if (fetchError) {
        logger.error("Error checking known devices:", fetchError);
        return { isNewDevice: false, deviceInfo };
      }

      if (existingDevices && existingDevices.length > 0) {
        // Update last seen
        await supabase
          .from("user_known_devices")
          .update({ last_seen_at: new Date().toISOString() })
          .eq("id", existingDevices[0].id);

        return { isNewDevice: false, deviceInfo };
      }

      // New device detected - register it
      const { error: insertError } = await supabase.from("user_known_devices").insert({
        user_id: userId,
        device_fingerprint: fullFingerprint,
        ip_address: ipAddress,
        user_agent: deviceInfo.userAgent,
        browser_name: deviceInfo.browserName,
        os_name: deviceInfo.osName,
        device_type: deviceInfo.deviceType,
        is_trusted: false,
      });

      if (insertError) {
        logger.error("Error registering device:", insertError);
        return { isNewDevice: true, deviceInfo };
      }

      // Send notification for new device
      try {
        await supabase.functions.invoke("notify-new-device", {
          body: {
            userId,
            email: userEmail,
            deviceInfo: {
              ipAddress,
              userAgent: deviceInfo.userAgent,
              browserName: deviceInfo.browserName,
              osName: deviceInfo.osName,
              deviceType: deviceInfo.deviceType,
            },
            loginTime: new Date().toISOString(),
          },
        });
      } catch (notifyError) {
        logger.error("Error sending new device notification:", notifyError);
      }

      return { isNewDevice: true, deviceInfo };
    } catch (error) {
      logger.error("Error in device detection:", error);
      return { isNewDevice: false, deviceInfo: null };
    }
  }, []);

  const getKnownDevices = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from("user_known_devices")
      .select("*")
      .eq("user_id", userId)
      .order("last_seen_at", { ascending: false });

    if (error) {
      logger.error("Error fetching known devices:", error);
      return [];
    }

    return data || [];
  }, []);

  const removeDevice = useCallback(async (deviceId: string) => {
    const { error } = await supabase.from("user_known_devices").delete().eq("id", deviceId);

    if (error) {
      logger.error("Error removing device:", error);
      return false;
    }

    return true;
  }, []);

  const trustDevice = useCallback(async (deviceId: string) => {
    const { error } = await supabase
      .from("user_known_devices")
      .update({ is_trusted: true })
      .eq("id", deviceId);

    if (error) {
      logger.error("Error trusting device:", error);
      return false;
    }

    return true;
  }, []);

  const getLoginEvents = useCallback(async (userId: string, limit = 10) => {
    const { data, error } = await supabase
      .from("login_security_events")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      logger.error("Error fetching login events:", error);
      return [];
    }

    return data || [];
  }, []);

  return {
    checkAndRegisterDevice,
    getKnownDevices,
    removeDevice,
    trustDevice,
    getLoginEvents,
  };
}

// lib/device.ts
import { STORAGE_KEYS } from "./pollConfig";

export function getOrCreateDeviceId(): string | null {
  if (typeof window === "undefined") return null;

  let deviceId = localStorage.getItem(STORAGE_KEYS.DEVICE_ID);
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEYS.DEVICE_ID, deviceId);
  }
  return deviceId;
}

export function markDeviceHasVoted(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.HAS_VOTED, "true");
}

export function hasDeviceVoted(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEYS.HAS_VOTED) === "true";
}

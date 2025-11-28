// lib/pollConfig.ts

// Server-side: Always enforce device-based voting restriction
export const ENFORCE_SINGLE_VOTE = true;

// Client-side: Enable/disable localStorage device checking (set to false to skip client-side check)
export const CLIENT_SIDE_DEVICE_CHECK = false;

// Maximum votes allowed per IP address (prevents spam from same network)
export const MAX_VOTES_PER_IP = 20;

// Mobile-only voting: If true, desktop users will see QR code page instead of home page
export const MOBILE_ONLY_VOTING = false;

export const STORAGE_KEYS = {
  DEVICE_ID: "poll_device_id",
  HAS_VOTED: "poll_has_voted",
} as const;

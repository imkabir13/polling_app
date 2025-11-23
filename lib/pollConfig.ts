// lib/pollConfig.ts

// Flip this to true/false to enable/disable one-vote-per-device
export const ENFORCE_SINGLE_VOTE = false;

export const STORAGE_KEYS = {
  DEVICE_ID: "poll_device_id",
  HAS_VOTED: "poll_has_voted",
} as const;

// lib/analyticsClient.ts
export type AnalyticsEventType =
  | "poll_opened"
  | "modal_opened"
  | "modal_closed"
  | "modal_timeout"
  | "vote_submitted";

interface TrackEventOptions {
  sessionId?: string | null;
  deviceId: string | null;
  context?: Record<string, any>;
}

export async function trackEvent(
  eventType: AnalyticsEventType,
  { sessionId = null, deviceId, context }: TrackEventOptions
) {
  try {
    if (!deviceId) return; // don't send if we don't know the device yet

    await fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventType,
        sessionId,
        deviceId,
        context: context ?? {},
      }),
      keepalive: true,
    });
  } catch (err) {
    console.error("Failed to send analytics event", err);
  }
}

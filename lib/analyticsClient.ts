// lib/analyticsClient.ts

export type AnalyticsEventType =
  | "poll_opened"
  | "user_info_modal_opened"
  | "user_info_modal_closed"
  | "user_info_modal_timeout"
  | "poll_question_modal_opened"
  | "poll_question_modal_closed"
  | "poll_question_modal_timeout"
  | "vote_submitted"
  | "vote_not_submitted";

export interface AnalyticsEventPayload {
  deviceId?: string | null;
  sessionId?: string | null;
  context?: Record<string, any>;
}

/**
 * Client-side helper to send analytics events.
 * Location / IP are resolved on the server.
 */
export async function trackEvent(
  type: AnalyticsEventType,
  payload: AnalyticsEventPayload = {}
) {
  if (typeof window === "undefined") return;

  try {
    await fetch("/api/analytics/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, ...payload }),
      // keepalive helps when user is navigating away
      keepalive: true,
    });
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Analytics error", err);
    }
  }
}

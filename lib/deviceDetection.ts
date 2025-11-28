// lib/deviceDetection.ts

/**
 * Detects if the user is on a mobile device based on User-Agent
 * Works on both client and server side
 */
export function isMobileDevice(userAgent?: string): boolean {
  // If no userAgent provided, try to get it from navigator (client-side)
  const ua = userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : '');

  if (!ua) return false;

  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i;
  return mobileRegex.test(ua);
}

/**
 * Get device type: mobile, tablet, or desktop
 */
export function getDeviceType(userAgent?: string): 'mobile' | 'tablet' | 'desktop' {
  const ua = userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : '');

  if (!ua) return 'desktop';

  const lowerUA = ua.toLowerCase();

  // Check for mobile first
  if (/mobi|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(lowerUA)) {
    return 'mobile';
  }

  // Check for tablet
  if (/ipad|tablet|kindle|silk|playbook/i.test(lowerUA)) {
    return 'tablet';
  }

  return 'desktop';
}

/**
 * Check if device is allowed to vote based on device type
 * Mobile and tablet are allowed, desktop is not (when mobile-only mode is enabled)
 */
export function isDeviceAllowedToVote(userAgent?: string, mobileOnly: boolean = false): boolean {
  if (!mobileOnly) return true;

  const deviceType = getDeviceType(userAgent);
  return deviceType === 'mobile' || deviceType === 'tablet';
}

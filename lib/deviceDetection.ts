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
 * Advanced device detection using multiple signals
 * Checks: User-Agent, Touch Support, Platform, Max Touch Points, Screen Size
 */
export function isActualMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;

  let mobileScore = 0;
  const debugInfo: any = {};

  // Check 1: User-Agent (weight: 2 points)
  const ua = navigator.userAgent.toLowerCase();
  const hasMobileUA = /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua);
  if (hasMobileUA) {
    mobileScore += 2;
  }
  debugInfo.userAgent = { value: ua, isMobile: hasMobileUA, points: hasMobileUA ? 2 : 0 };

  // Check 2: Touch points (weight: 2 points)
  // Real mobile devices have 5+ touch points, desktop with touch has 1-2
  const touchPoints = navigator.maxTouchPoints || 0;
  const hasTouchPoints = touchPoints > 2;
  if (hasTouchPoints) {
    mobileScore += 2;
  }
  debugInfo.touchPoints = { value: touchPoints, hasTouchPoints, points: hasTouchPoints ? 2 : 0 };

  // Check 3: Platform API (weight: 1 point)
  // @ts-ignore - userAgentData is experimental
  const platformMobile = navigator.userAgentData?.mobile === true;
  if (platformMobile) {
    mobileScore += 1;
  }
  debugInfo.platformAPI = { value: platformMobile, points: platformMobile ? 1 : 0 };

  // Check 4: Screen size (weight: 1 point)
  // Real mobile devices typically have smaller screens
  const screenWidth = window.screen.width;
  const screenHeight = window.screen.height;
  const smallerDimension = Math.min(screenWidth, screenHeight);
  const isSmallScreen = smallerDimension <= 768;
  if (isSmallScreen) {
    mobileScore += 1;
  }
  debugInfo.screenSize = { width: screenWidth, height: screenHeight, smallerDimension, isSmallScreen, points: isSmallScreen ? 1 : 0 };

  // Check 5: Device orientation API (weight: 1 point)
  // Mobile devices support orientation changes
  const hasOrientation = typeof window.orientation !== 'undefined';
  if (hasOrientation) {
    mobileScore += 1;
  }
  debugInfo.orientation = { hasOrientation, points: hasOrientation ? 1 : 0 };

  // Check 6: Pointer type (weight: 1 point)
  // 'coarse' pointer = touch screen
  const hasCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
  if (hasCoarsePointer) {
    mobileScore += 1;
  }
  debugInfo.pointerType = { hasCoarsePointer, points: hasCoarsePointer ? 1 : 0 };

  // Exclude desktop browsers with dev tools mobile emulation
  // Desktop browsers in mobile mode won't have real platform indicators
  // @ts-ignore
  const platform = navigator.platform || navigator.userAgentData?.platform || '';
  const isDesktopPlatform = /Win|Mac|Linux/i.test(platform);
  debugInfo.platform = { value: platform, isDesktopPlatform };

  // STRICT CHECK: If desktop platform detected, ALWAYS block regardless of score
  // Real mobile devices will NEVER have Windows/Mac/Linux platform
  if (isDesktopPlatform) {
    console.log('🚫 MOBILE DETECTION - BLOCKED (Desktop platform detected):', {
      ...debugInfo,
      totalScore: mobileScore,
      reason: 'Desktop platform: ' + platform,
      result: 'BLOCKED'
    });
    return false;
  }

  // Need at least 3 points to be considered a real mobile device
  // This ensures we're not fooled by browser emulation
  const isAllowed = mobileScore >= 3;

  console.log(isAllowed ? '✅ MOBILE DETECTION - ALLOWED' : '🚫 MOBILE DETECTION - BLOCKED', {
    ...debugInfo,
    totalScore: mobileScore,
    threshold: 3,
    result: isAllowed ? 'ALLOWED' : 'BLOCKED'
  });

  return isAllowed;
}

/**
 * Check if device is allowed to vote based on device type
 * Mobile and tablet are allowed, desktop is not (when mobile-only mode is enabled)
 * Uses advanced detection to prevent desktop browser emulation
 */
export function isDeviceAllowedToVote(userAgent?: string, mobileOnly: boolean = false): boolean {
  if (!mobileOnly) return true;

  // Use advanced client-side detection if available
  if (typeof window !== 'undefined') {
    return isActualMobileDevice();
  }

  // Fallback to User-Agent only on server-side
  const deviceType = getDeviceType(userAgent);
  return deviceType === 'mobile' || deviceType === 'tablet';
}

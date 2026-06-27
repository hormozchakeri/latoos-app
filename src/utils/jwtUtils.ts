/**
 * Decode a JWT payload without verifying the signature.
 * Safe to use client-side only for reading expiry / claims.
 */
function decodePayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join(""),
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/** Returns the expiry timestamp (seconds since epoch), or null if not present. */
export function getTokenExpiry(token: string): number | null {
  const payload = decodePayload(token);
  if (!payload || typeof payload.exp !== "number") return null;
  return payload.exp;
}

/** True if the token is already expired. */
export function isTokenExpired(token: string): boolean {
  const exp = getTokenExpiry(token);
  if (exp === null) return true;
  return Date.now() / 1000 >= exp;
}

/**
 * True if the token expires within `thresholdSeconds` seconds.
 * Default threshold = 120 s (2 minutes).
 */
export function isTokenExpiringSoon(
  token: string,
  thresholdSeconds = 120,
): boolean {
  const exp = getTokenExpiry(token);
  if (exp === null) return true;
  return Date.now() / 1000 >= exp - thresholdSeconds;
}

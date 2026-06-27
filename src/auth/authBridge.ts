/**
 * authBridge decouples apiClient (which has no access to React context) from
 * AuthContext.  When the interceptor detects an unrecoverable auth failure it
 * calls triggerAuthExpired(), which in turn invokes whatever callback
 * AuthContext registered via registerLogoutCallback().
 */

type LogoutCallback = () => void;

let _logoutCallback: LogoutCallback | null = null;

export function registerLogoutCallback(cb: LogoutCallback): void {
  _logoutCallback = cb;
}

export function triggerAuthExpired(): void {
  if (_logoutCallback) {
    _logoutCallback();
  }
}

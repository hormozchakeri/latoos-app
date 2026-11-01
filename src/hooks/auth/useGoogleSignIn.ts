import { useEffect, useState } from "react";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import {
  googleClientId,
  googleDiscovery,
  googleRedirectUri,
} from "@/services/googleAuth";

WebBrowser.maybeCompleteAuthSession();

export function useGoogleSignIn() {
  const [idToken, setIdToken] = useState<string | null>(null);
  const [exchanging, setExchanging] = useState(false);
  const [exchangeError, setExchangeError] = useState<string | null>(null);

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: googleClientId ?? "",
      scopes: ["openid", "profile", "email"],
      redirectUri: googleRedirectUri,
    },
    googleDiscovery,
  );

  useEffect(() => {
    if (response?.type !== "success" || !request) return;

    const { code } = response.params;
    setExchanging(true);
    setExchangeError(null);

    AuthSession.exchangeCodeAsync(
      {
        clientId: googleClientId ?? "",
        code,
        redirectUri: googleRedirectUri,
        extraParams: { code_verifier: request.codeVerifier ?? "" },
      },
      googleDiscovery,
    )
      .then((tokenResponse) => {
        if (!tokenResponse.idToken) {
          setExchangeError("Google did not return an ID token");
          return;
        }
        setIdToken(tokenResponse.idToken);
      })
      .catch((err) =>
        setExchangeError(err instanceof Error ? err.message : String(err)),
      )
      .finally(() => setExchanging(false));
  }, [response, request]);

  const promptError =
    response?.type === "error"
      ? response.error?.message ?? "Google sign-in failed"
      : null;

  return {
    promptAsync,
    ready: !!request && !!googleClientId,
    pending: exchanging,
    idToken,
    error: exchangeError ?? promptError,
  };
}

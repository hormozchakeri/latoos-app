import { Platform } from "react-native";
import * as AuthSession from "expo-auth-session";

export const googleDiscovery: AuthSession.DiscoveryDocument = {
  authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenEndpoint: "https://oauth2.googleapis.com/token",
  revocationEndpoint: "https://oauth2.googleapis.com/revoke",
};

const ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
const IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

export const googleClientId = Platform.select({
  android: ANDROID_CLIENT_ID,
  ios: IOS_CLIENT_ID,
  default: undefined,
});

// Google's native (Android/iOS) OAuth clients only accept their own reversed-client-id
// scheme as the redirect URI — an arbitrary app scheme (e.g. "latoos://") is rejected.
// This same scheme must also be added to app.json's "scheme" array once the real
// client IDs exist, so the OS routes the redirect back into the app.
function reversedClientIdScheme(clientId: string): string {
  return `com.googleusercontent.apps.${clientId.replace(/\.apps\.googleusercontent\.com$/, "")}`;
}

export const googleRedirectUri = AuthSession.makeRedirectUri({
  scheme: googleClientId
    ? reversedClientIdScheme(googleClientId)
    : "latoos",
  path: "oauthredirect",
});

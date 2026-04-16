import { authorize } from 'react-native-app-auth';

const config = {
  issuer: 'https://accounts.google.com',
  clientId: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
  redirectUrl: 'com.yourapp:/oauthredirect',
  scopes: ['openid', 'profile', 'email'],
};

export async function googleSignIn() {
  return authorize(config);
}

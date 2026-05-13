const DEV_API_URL = 'http://10.0.2.2:5171/api';
const PROD_API_URL = 'https://api.latoos.com/api';

export const config = {
  apiBaseUrl: __DEV__ ? DEV_API_URL : PROD_API_URL,
  apiTimeout: 10000,
  refreshEndpoint: '/auth/refresh',
} as const;


export type User = {
  id: string;
  username: string;
  email?: string;
};

export interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  error: string | null;

  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}
export type LoginResponse = {
  token: string;
  refreshToken: string;
  username: string;
  email: string;
};

export interface RefreshResponse {
  token: string;
  refreshToken: string;
  username: string;
  email: string;
}
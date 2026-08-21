import * as SecureStore from "expo-secure-store";

const ACCESS_TOKEN_KEY = "accessToken";
const USER_KEY = "authUser";
const SCHOOL_ID_KEY = "lastSchoolId"; // convenience: pre-fill on next login

export const secureStorage = {
  async getToken() {
    return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  },
  async setToken(token: string) {
    return SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
  },
  async getUser<T>(): Promise<T | null> {
    const raw = await SecureStore.getItemAsync(USER_KEY);
    return raw ? (JSON.parse(raw) as T) : null;
  },
  async setUser(user: unknown) {
    return SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
  },
  async getLastSchoolId() {
    return SecureStore.getItemAsync(SCHOOL_ID_KEY);
  },
  async setLastSchoolId(schoolId: string) {
    return SecureStore.setItemAsync(SCHOOL_ID_KEY, schoolId);
  },
  async clearSession() {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
    // deliberately keep lastSchoolId so re-login is faster
  },
};

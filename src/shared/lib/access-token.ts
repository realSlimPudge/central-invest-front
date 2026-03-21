import Cookies from "js-cookie";

import { ACCESS_TOKEN } from "@/shared/constants/auth-token";

function getAccessToken() {
  if (typeof window !== "undefined") {
    const localToken = window.localStorage.getItem(ACCESS_TOKEN);
    if (localToken) {
      return localToken;
    }
  }

  return Cookies.get(ACCESS_TOKEN) ?? null;
}

function setAccessToken(token: string) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(ACCESS_TOKEN, token);
  }

  Cookies.set(ACCESS_TOKEN, token);
}

function clearAccessToken() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(ACCESS_TOKEN);
  }

  Cookies.remove(ACCESS_TOKEN);
}

export { clearAccessToken, getAccessToken, setAccessToken };

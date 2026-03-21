import Cookies from "js-cookie";

import { ACCESS_TOKEN } from "@/shared/constants/auth-token";

function getAccessToken() {
  return Cookies.get(ACCESS_TOKEN) ?? null;
}

function setAccessToken(token: string) {
  Cookies.set(ACCESS_TOKEN, token);
}

function clearAccessToken() {
  Cookies.remove(ACCESS_TOKEN);
}

export { clearAccessToken, getAccessToken, setAccessToken };

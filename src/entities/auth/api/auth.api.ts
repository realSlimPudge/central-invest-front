import { apiClient } from "@/shared/api/api-client";
import type { LoginRes, LoginBody } from "./dto/login";
import type { MeRes } from "./dto/me";

const AUTH_BASE = "auth";

export const authApi = {
  login: (body: LoginBody) => {
    return apiClient.request<LoginRes>({
      method: "POST",
      path: `${AUTH_BASE}/login`,
      body,
    });
  },

  me: () => {
    return apiClient.request<MeRes>({
      path: `${AUTH_BASE}/me`,
    });
  },

  logout: () => {
    return apiClient.request({
      method: "POST",
      path: `${AUTH_BASE}/logout`,
    });
  },
};

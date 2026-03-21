import { apiClient } from "@/shared/api/api-client";
import type { LoginRes, AuthBody, RegisterRes } from "./dto/login";
import type { MeRes } from "./dto/me";

export const authApi = {
  login: (body: AuthBody) => {
    return apiClient.request<LoginRes>({
      method: "POST",
      path: `auth/login`,
      body,
    });
  },

  register: (body: AuthBody) => {
    return apiClient.request<RegisterRes>({
      method: "POST",
      path: "auth/register",
      body,
    });
  },

  me: () => {
    return apiClient.request<MeRes>({
      path: `auth/me`,
    });
  },

  logout: () => {
    return apiClient.request({
      method: "POST",
      path: `logout`,
    });
  },
};

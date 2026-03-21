import { apiClient } from "@/shared/api/api-client";
import type { LoginRes, LoginBody } from "./dto/login";
import type { MeRes } from "./dto/me";

export const authApi = {
  login: (body: LoginBody) => {
    return apiClient.request<LoginRes>({
      method: "POST",
      path: `login`,
      body,
    });
  },

  me: () => {
    return apiClient.request<MeRes>({
      path: `me`,
    });
  },

  logout: () => {
    return apiClient.request({
      method: "POST",
      path: `logout`,
    });
  },
};

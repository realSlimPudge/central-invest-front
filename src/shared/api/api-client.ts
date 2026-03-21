import axios, { type AxiosRequestConfig, type Method } from "axios";
import Cookies from "js-cookie";
import { ACCESS_TOKEN } from "../constants/auth-token";

const API_BASE_URL = import.meta.env.VITE_PUBLIC_API_URL;

type RequestParams = {
  method?: Method;
  path: string;
  body?: object;
  signal?: AbortSignal;
  headers?: Record<string, string>;
  responseType?: AxiosRequestConfig["responseType"];
};

class ApiClient {
  private static instance: ApiClient;

  private readonly baseUrl: string = API_BASE_URL;

  static getClient(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  private buildConfig({
    method = "GET",
    path,
    body,
    signal,
    headers,
    responseType,
  }: RequestParams): AxiosRequestConfig {
    return {
      method,
      url: `${this.baseUrl}/${path}`,
      data: body,
      signal,
      responseType,
      headers: {
        Authorization: `Bearer ${Cookies.get(ACCESS_TOKEN) || ""}`,
        credentials: "include",
        ...headers,
      },
    };
  }

  async request<T>(params: RequestParams): Promise<T> {
    const config = this.buildConfig(params);

    try {
      const response = await axios(config);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const serverMessage = error.response?.data?.message;
        if (serverMessage) {
          throw new Error(serverMessage);
        }
        throw new Error(
          error.message || "Произошла ошибка при запросе к серверу",
        );
      }

      throw new Error(
        "Неизвестная ошибка: " +
          (error instanceof Error ? error.message : String(error)),
      );
    }
  }
}

export const apiClient = ApiClient.getClient();

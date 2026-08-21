// src/api/error.ts
import { AxiosError } from "axios";

export function getErrorMessage(
  error: unknown,
  fallback = "Something went wrong",
) {
  console.log("=== API ERROR DEBUG ===");
  console.log("Is AxiosError:", error instanceof AxiosError);

  if (error instanceof AxiosError) {
    console.log("error.message:", error.message);
    console.log("error.code:", error.code);
    console.log("error.response?.status:", error.response?.status);
    console.log("error.response?.data:", error.response?.data);
    console.log("error.config?.url:", error.config?.url);
    console.log("error.config?.baseURL:", error.config?.baseURL);
  } else {
    console.log("Non-axios error:", error);
  }
  console.log("=======================");

  if (error instanceof AxiosError) {
    const message = error.response?.data?.message;
    if (Array.isArray(message)) return message[0];
    if (typeof message === "string") return message;

    if (error.code === "ECONNABORTED")
      return "Request timed out — check your server is reachable";
    if (error.message === "Network Error")
      return "Network Error — can't reach the server";
  }
  return fallback;
}

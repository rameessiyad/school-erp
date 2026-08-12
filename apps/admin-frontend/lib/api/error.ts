import axios from "axios";

export function getErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (axios.isAxiosError(error) && error.response) {
    return error.response.data?.message ?? fallback;
  }
  return fallback;
}

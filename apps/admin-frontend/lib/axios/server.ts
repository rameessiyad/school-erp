import axios from "axios";
import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function createServerApi() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  return axios.create({
    baseURL: API_URL,
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
}

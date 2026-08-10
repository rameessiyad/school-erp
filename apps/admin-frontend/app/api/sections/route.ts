import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { createServerApi } from "@/lib/axios/server";

export async function GET(req: NextRequest) {
  const api = await createServerApi();
  const { searchParams } = new URL(req.url);
  const classId = searchParams.get("classId");

  try {
    const { data } = await api.get("/section", {
      params: classId ? { classId } : undefined,
    });
    return NextResponse.json(data);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return NextResponse.json(error.response.data, {
        status: error.response.status,
      });
    }
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}

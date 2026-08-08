import { createServerApi } from "@/lib/axios/server";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const api = await createServerApi();

  try {
    const { data } = await api.get("/staff");
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

export async function POST(req: NextRequest) {
  const api = await createServerApi();
  const body = await req.json();

  try {
    const { data } = await api.post("/staff/create", body);
    return NextResponse.json(data, { status: 201 });
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

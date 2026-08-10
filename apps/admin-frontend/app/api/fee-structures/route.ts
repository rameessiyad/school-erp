import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { createServerApi } from "@/lib/axios/server";

export async function GET(req: NextRequest) {
  const api = await createServerApi();
  const { searchParams } = new URL(req.url);

  try {
    const { data } = await api.get("/fee-structure", {
      params: Object.fromEntries(searchParams),
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

export async function POST(req: NextRequest) {
  const api = await createServerApi();
  const body = await req.json();

  try {
    const { data } = await api.post("/fee-structure", body);
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

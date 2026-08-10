import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { createServerApi } from "@/lib/axios/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const api = await createServerApi();

  try {
    const { data } = await api.patch(`/fee-structures/${id}/deactivate`);
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

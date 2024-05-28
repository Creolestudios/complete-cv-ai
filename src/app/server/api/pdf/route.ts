"use server";
import { fetchDownloadedPdfBlob } from "@/components/server/helper/vercelBlob/listblobData";
import { Error } from "@/types/server/admin";
import { ServerError } from "@/utils/messagePopup";
import { NextRequest, NextResponse } from "next/server";

// For get Converted PDF url from vercel blob
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const user_id = formData.get("user_id") as string;
    const filenamePrefix = formData.get("filenamePrefix");
    const fileId = formData.get("file_id") as string;

    // function for get Downloaded PDF Url from vercel blob
    const result = await fetchDownloadedPdfBlob(user_id, fileId);
    // Ensure that result is always a string or null
    const validResult: string | null =
      typeof result === "string" ? result : null;

    return NextResponse.json<{ result: string | null }>(
      { result: validResult },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error:", error);
    return NextResponse.json<Error>(
      { error: ServerError.Internal },
      { status: 500 }
    );
  }
}

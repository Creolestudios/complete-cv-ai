"use server";
import { fetchCandidatePdfBlob } from "@/components/server/helper/vercelBlob/listblobData";
import { CandidateResponse, UploadError } from "@/types/server/upload";
import { ServerError } from "@/utils/messagePopup";
import { NextRequest, NextResponse } from "next/server";

// For get PDF Url from vercel blob
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const user_id = formData.get("user_id") as string;
    const fileId = formData.get("file_id") as string;

    // function for get PDF Url from vercel blob
    const result = await fetchCandidatePdfBlob(user_id, fileId);

    // Ensure that result is always a string or null
    const validResult: string | null =
      typeof result === "string" ? result : null;

    return NextResponse.json<CandidateResponse>(
      { result: validResult },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json<UploadError>(
      { errorMessage: ServerError.Internal },
      { status: 500 }
    );
  }
}

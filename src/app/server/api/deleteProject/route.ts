import { NextRequest, NextResponse } from "next/server";
import { del } from "@vercel/blob";
import {
  fetchCandidatePdfBlob,
  fetchDownloadedPdfBlob,
} from "@/components/server/helper/vercelBlob/listblobData";
import { ServerError } from "@/utils/messagePopup";
import { Error, Response } from "@/types/server/admin";

// Delete Project for Preview Route
export async function DELETE(request: NextRequest) {
  try {
    const { user_id, file_ids }: { user_id: string; file_ids: string[] } =
      await request.json();
    console.log(user_id, file_ids);

    if (!user_id || !file_ids || !Array.isArray(file_ids)) {
      return NextResponse.json<Error>(
        {
          message: "Invalid request format",
        },
        { status: 400 }
      );
    }

    const deletePromises = file_ids.map(async (file_id) => {
      try {
        const candidate_url = await fetchCandidatePdfBlob(user_id, file_id);
        const _url = await fetchDownloadedPdfBlob(user_id, file_id);

        if (candidate_url) {
          await del(candidate_url);
        }

        if (_url) {
          await del(_url);
        }
      } catch (error) {
        console.error(`Error deleting file ${file_id}:`, error);
      }
    });

    await Promise.all(deletePromises);

    return NextResponse.json<Response>(
      {
        message: "All files deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error", error);
    return NextResponse.json<Error>(
      {
        error,
        errorMessage: ServerError.Internal,
      },
      { status: 500 }
    );
  }
}

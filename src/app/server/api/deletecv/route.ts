import { NextRequest, NextResponse } from "next/server";
import { del } from "@vercel/blob";
import {
  fetchCandidatePdfBlob,
  fetchDownloadedPdfBlob,
} from "@/components/server/helper/vercelBlob/listblobData";
import { ServerError } from "@/utils/messagePopup";
import { Error } from "@/types/server/admin";

// Delete candidate cv for Preview Route
export async function DELETE(request: NextRequest) {
  try {
    const { file_id, user_id }: { file_id: string; user_id: string } =
      await request.json();
    console.log(file_id, user_id);
    const fileId = file_id;

    const candidate_url: any = await fetchCandidatePdfBlob(user_id, fileId);
    const _url: any = await fetchDownloadedPdfBlob(user_id, fileId);

    // Check if both result and _url are truthy (non-null and non-empty)
    if (candidate_url) {
      // Delete the candidate PDF blob if it exists
      console.log(candidate_url);
      await del(candidate_url);

      if (_url) {
        // Both URLs are available, proceed with deletion
        await del(_url);
        return NextResponse.json<Error>(
          {
            message: "Both files deleted successfully",
          },
          { status: 200 }
        );
      } else {
        // _url is missing, send a message for the second one
        return NextResponse.json<Error>({
          message: "Candidate PDF deleted successfully, but  PDF is missing",
        });
      }
    } else {
      // Candidate PDF URL is missing, send a message for the first one
      return NextResponse.json<Error>(
        {
          message: "Candidate PDF URL is missing",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.log("Error", error);
    return NextResponse.json<Error>(
      {
        error,
        errorMessage: ServerError.Internal,
      },
      { status: 500 }
    );
  }
}

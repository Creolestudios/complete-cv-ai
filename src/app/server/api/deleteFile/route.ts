"use server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ServerError } from "@/utils/messagePopup";
import { Error, Response } from "@/types/server/admin";

// Delete specific file API for Dashboard
export async function DELETE(request: NextRequest) {
  try {
    const formData = await request.formData();
    const fileId = formData.get("fileId");

    if (typeof fileId !== "string") {
      return NextResponse.json<Error>(
        {
          error: "Bad Request",
          message: "Invalid fileId",
        },
        { status: 400 }
      );
    }

    const parsedFileId = parseInt(fileId, 10);

    // Delete the file
    const deletedFile = await prisma.file.delete({
      where: { id: parsedFileId },
    });

    console.log("Delete file executed", deletedFile);
    return NextResponse.json<Response>(
      {
        message: "Deleted file successfully !",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error", error);
    return NextResponse.json<Error>(
      {
        error: ServerError.Internal,
      },
      { status: 500 }
    );
  }
}

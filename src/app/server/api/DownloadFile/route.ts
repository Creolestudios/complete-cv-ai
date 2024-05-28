"use server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ServerError } from "@/utils/messagePopup";
import { Error } from "@/types/server/admin";

// Get zip_url of a specific file API
export async function POST(request: NextRequest) {
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
    // Get the file
    const file = await prisma.file.findUnique({
      where: { id: parsedFileId },
    });

    if (!file) {
      return NextResponse.json<Error>(
        {
          error: "Not Found",
          message: "File not found",
        },
        { status: 404 }
      );
    }

    // Send the zip_url to the client
    return NextResponse.json<{ zip_url: string }>({ zip_url: file.zipUrl });
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

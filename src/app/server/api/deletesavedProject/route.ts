"use server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ServerError } from "@/utils/messagePopup";
import { Error, Response } from "@/types/server/admin";

// Delete project and associated files API for Dashboard
export async function DELETE(request: NextRequest) {
  try {
    const formData = await request.formData();
    const projectId = formData.get("projectId");

    if (typeof projectId !== "string") {
      return NextResponse.json<Error>(
        {
          error: "Bad Request",
          message: "Invalid projectId",
        },
        { status: 400 }
      );
    }

    const parsedProjectId = parseInt(projectId, 10);

    // Delete associated files first
    await prisma.file.deleteMany({
      where: { dashTableId: parsedProjectId },
    });

    // Then delete the project
    const deletedProject = await prisma.dashTable.delete({
      where: { id: parsedProjectId },
    });

    console.log("Delete project and associated files executed", deletedProject);
    return NextResponse.json<Response>({
      message: "Delete project and associated files successfully",
    },{
      status: 200
    });
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

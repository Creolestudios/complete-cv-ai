"use server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ServerError } from "@/utils/messagePopup";
import { Error } from "@/types/server/admin";

// Copy File Project API for Dashboard
export async function POST(request: NextRequest) {
  try {
    // Parse form data from the request
    const formData = await request.formData();
    const projectId = formData.get("projectId")?.toString() ?? "";
    const userId: any = formData.get("userId");

    // Find the existing project record based on projectId
    const existingProject = await prisma.dashTable.findUnique({
      where: {
        id: parseInt(projectId),
      },
      include: {
        files: true, // Include associated files with the project
      },
    });

    // If the existing project record doesn't exist, return 404 error
    if (!existingProject) {
      return NextResponse.json<Error>(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Generate a new name for the copied project
    let copyName = `${existingProject.ProjectName}(copy)`;
    let copyNumber = 1;

    // Check if a copy with the same name already exists
    while (
      await prisma.dashTable.findFirst({
        where: {
          ProjectName: copyName,
          // TemplateId: existingProject.TemplateId,
        },
      })
    ) {
      copyNumber++;
      copyName =
        copyNumber === 1
          ? copyName
          : `${existingProject.ProjectName}(copy ${copyNumber})`;
    }

    // Create a new project record with copied details
    const createdProject = await prisma.dashTable.create({
      data: {
        ProjectName: copyName,
        zipURL: existingProject.zipURL,
        LastSaved: new Date(),
        userId: parseInt(userId),
      },
      include: {
        files: true, // Include associated files with the new project
      },
    });

    // Copy associated files from the existing project
    for (const file of existingProject.files) {
      await prisma.file.create({
        data: {
          file_id: file.file_id,
          candidateFile_name: file.candidateFile_name,
          user_url: file.user_url,
          _url: file._url,
          zipUrl: file.zipUrl,
          lastsaved: new Date(),
          templateId: file.templateId,
          dashTableId: createdProject.id, // Set the copied project's id as the dashTableId
        },
      });
    }

    // Log the copied project data
    console.log("Copied Project Data: ", createdProject);

    // Return success response
    return NextResponse.json({ status: 200 });
  } catch (error) {
    // Handle errors and return appropriate response
    console.error(error);
    return NextResponse.json<Error>(
      { error: ServerError.Internal },
      { status: 500 }
    );
  }
}

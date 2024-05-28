"use server";
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import archiver from "archiver";
import { put } from "@vercel/blob";
import { ServerError } from "@/utils/messagePopup";
import prisma from "@/lib/prisma";
import { Error } from "@/types/server/admin";

// Download project Zip (Dashboard page)
export async function POST(request: NextRequest) {
  try {
    const requestData = await request.json();
    const { user_id, projectId }: { user_id: string; projectId: string } =
      requestData;

    console.log("Received request for project ID:", projectId);
    // Fetch project details using the provided project ID
    const project = await prisma.dashTable.findUnique({
      where: { id: parseInt(projectId) },
    });

    if (!project) {
      return NextResponse.json<Error>({
        message: `Project not found with ID ${projectId}`,
      });
    }

    const projectName = project.ProjectName;

    // Fetch files associated with the project
    const files = await prisma.file.findMany({
      where: { dashTableId: parseInt(projectId) },
    });

    // Initialize archive
    const archive = archiver("zip", { zlib: { level: 9 } });

    // Array to store promises for fetching file content
    const fetchPromises = [];

    // Iterate over files array to create fetch promises
    for (const file of files) {
      fetchPromises.push(fetchFileContent(file.zipUrl));
    }

    // Wait for all fetch promises to resolve
    const fileContents = await Promise.all(fetchPromises);

    // Create zip file with file data
    const zipBuffer: any = await createZip(archive, fileContents);

    // Upload the zip file to Vercel Blob
    const blobName = `${user_id}/${projectName}.zip`;
    const Blob = await put(blobName, zipBuffer, {
      access: "public",
      contentType: "application/zip",
    });

    // Return success response with zip URL
    return NextResponse.json(
      {
        message: "Success",
        zipUrl: Blob.url,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json<Error>(
      { message: ServerError.Internal },
      { status: 500 }
    );
  }
}

async function fetchFileContent(zipUrl: string) {
  try {
    const response = await axios.get(zipUrl, { responseType: "arraybuffer" });
    return response.data;
  } catch (error: any) {
    return NextResponse.json({
      message: `Failed to fetch file content from ${zipUrl}: ${error.message}`,
    });
  }
}

async function createZip(archive: any, fileContents: any) {
  return new Promise((resolve, reject) => {
    const chunks: any = [];

    archive.on("data", (chunk: any) => {
      chunks.push(chunk);
    });

    archive.on("end", () => {
      resolve(Buffer.concat(chunks));
    });

    archive.on("error", (error: any) => {
      reject(error);
    });

    // Append files to the archive
    fileContents.forEach((content: any, index: number) => {
      archive.append(content, { name: `file_${index}.zip` });
    });

    // Finalize the archive
    archive.finalize();
  });
}

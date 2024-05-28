"use server";

import { NextRequest, NextResponse } from "next/server";
import archiver from "archiver";
import axios from "axios";
import { put } from "@vercel/blob";
import prisma from "@/lib/prisma";
import { ServerError } from "@/utils/messagePopup";
import { Error } from "@/types/server/admin";

// API for downloading selected projects
export async function POST(request: NextRequest) {
  try {
    const { projectIds, userId } = await request.json();

    // Array to store fetched project data
    const projectData = [];

    // Iterate over each table ID
    for (const projectId of projectIds) {
      // Find table data from the database
      const data = await prisma.dashTable.findUnique({
        where: {
          id: parseInt(projectId),
        },
      });

      if (!data) {
        return NextResponse.json<Error>(
          {
            message: `No data found for the provided table ID ${projectId}`,
          },
          { status: 404 }
        );
      }

      // Push the project data to the array
      projectData.push({
        name: data.ProjectName,
        url: data.zipURL as any,
      });
    }

    const archive = archiver("zip", { zlib: { level: 9 } });

    // Iterate over fetched project data
    for (const { name, url } of projectData) {
      const response = await axios.get(url, { responseType: "arraybuffer" });
      if (response.status !== 200) {
        return NextResponse.json({
          message: `Failed to fetch data from ${url}`,
          status: response.status,
        });
      }
      // Append each project's zip file to the archive with its name
      archive.append(response.data, {
        name: `${name.replace(/\s+/g, "_")}.zip`,
      });
    }

    archive.finalize();

    // Create a buffer from the archive
    const zipBuffer = await new Promise<Buffer>((resolve, reject) => {
      const buffers: Uint8Array[] = [];
      archive.on("data", (data) => {
        buffers.push(data);
      });
      archive.on("end", () => {
        resolve(Buffer.concat(buffers));
      });
      archive.on("error", (error) => {
        reject(error);
      });
    });

    // Store the aggregated zip buffer in Vercel Blob
    const blobName = `${userId}/_Projects.zip`;
    const Blob = await put(blobName, zipBuffer, {
      access: "public",
      contentType: "application/zip",
    });

    console.log("Aggregated zip buffer stored in Vercel Blob successfully");

    // Return response with Blob
    return NextResponse.json<{ url: string }>(
      {
        url: Blob.url,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json<Error>(
      { message: ServerError.Internal },
      { status: 500 }
    );
  }
}

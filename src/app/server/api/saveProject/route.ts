// "use server";
import {
  fetchCandidatePdfBlob,
  fetchDownloadedPdfBlob,
} from "@/components/server/helper/vercelBlob/listblobData";
import axios from "axios";
import prisma from "@/lib/prisma";
import archiver from "archiver";
import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { ServerError } from "@/utils/messagePopup";
import { Error } from "@/types/server/admin";
const fs = require("fs");
export const maxDuration = 300;

export async function POST(request: NextRequest) {
  try {
    const requestData = await request.json();
    const { user_id, files, projectName } = requestData;

    const dashTable = await prisma.dashTable.create({
      data: {
        ProjectName: projectName,
        LastSaved: new Date(),
        userId: parseInt(user_id),
      },
    });
    const dashTableId = dashTable.id;

    // Array to store JSON objects for each file
    const jsonObjects = [];
    // Iterate over files array
    for (const { file_id, candidateFile_name, templateId } of files) {
      // Fetch CandidateFileURL and ConvertedFileURL
      const candidateFileURL: any = await fetchCandidatePdfBlob(
        user_id,
        file_id
      );
      const downloadedFileURL: any = await fetchDownloadedPdfBlob(
        user_id,
        file_id
      );

      // Initialize archive for each file
      const archive = archiver("zip", { zlib: { level: 9 } });
      const zipBuffer: any = await createZip(
        archive,
        candidateFile_name,
        candidateFileURL,
        downloadedFileURL
      );
      // Upload the zip file to Vercel Blob
      const blobName = `${user_id}/${projectName}.zip`;
      const Blob = await put(blobName, zipBuffer, {
        access: "public",
        contentType:
          "application/zip, application/octet-stream, application/x-zip-compressed, multipart/x-zip",
      });

      // Create a record in the database using Prisma
      const createdFile = await prisma.file.create({
        data: {
          file_id: file_id,
          candidateFile_name: candidateFile_name,
          user_url: candidateFileURL,
          _url: downloadedFileURL,
          zipUrl: Blob.url,
          lastsaved: new Date().toISOString(),
          templateId: templateId,
          dashTable: {
            connect: { id: dashTableId },
          },
        },
      });
      // Push the created file to the JSON objects array
      jsonObjects.push(createdFile);
    }

    // Initialize archive
    const archive = archiver("zip", { zlib: { level: 9 } });
    const zipFileName = `public/uploads/${projectName}.zip`;

    const zipBuffer: any = await new Promise(async (resolve, reject) => {
      const chunks: any = [];

      archive.on("data", (chunk) => {
        chunks.push(chunk);
      });

      archive.on("end", () => {
        resolve(Buffer.concat(chunks));
      });

      archive.on("error", (error) => {
        reject(error);
      });

      // Iterate over files array using for...of loop
      for (const { file_id, candidateFile_name } of files) {
        // Extract file extension from candidate_name
        const CandidateFileURL: any = await fetchCandidatePdfBlob(
          user_id,
          file_id
        );
        const ConvertedFileURL: any = await fetchDownloadedPdfBlob(
          user_id,
          file_id
        );
        // console.log(CandidateFileURL);
        // Fetch files
        const candidateFile = await axios.get(CandidateFileURL, {
          responseType: "arraybuffer",
        });
        const convertedFile = await axios.get(ConvertedFileURL, {
          responseType: "arraybuffer",
        });
        // Append files to the archive
        archive.append(candidateFile.data, { name: `${candidateFile_name}` });
        archive.append(convertedFile.data, {
          name: `_${candidateFile_name}`,
        });
        archive.finalize();
      }

      // Finalize the archive after all files are appended
    });

    const blobName = `${user_id}/${projectName}.zip`;
    const Blob = await put(blobName, zipBuffer, {
      access: "public",
      contentType:
        "application/zip, application/octet-stream, application/x-zip-compressed, multipart/x-zip",
    });

    await prisma.dashTable.update({
      where: { id: dashTableId },
      data: { zipURL: Blob.url },
    });
    return NextResponse.json(
      { message: "Success", data: jsonObjects, zip_url: Blob.url },
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
// Function for creating zip
async function createZip(
  archive: archiver.Archiver,
  candidateFile_name: any,
  candidateFileURL: any,
  downloadedFileURL: any
) {
  return new Promise((resolve, reject) => {
    const chunks: any = [];

    archive.on("data", (chunk) => {
      chunks.push(chunk);
    });

    archive.on("end", () => {
      resolve(Buffer.concat(chunks));
    });

    archive.on("error", (error) => {
      reject(error);
    });

    // Fetch files
    axios
      .get(candidateFileURL, { responseType: "arraybuffer" })
      .then((candidateFile) => {
        axios
          .get(downloadedFileURL, { responseType: "arraybuffer" })
          .then((convertedFile) => {
            // Append files to the archive
            archive.append(candidateFile.data, {
              name: `${candidateFile_name}`,
            });
            archive.append(convertedFile.data, {
              name: `_${candidateFile_name}`,
            });
            archive.finalize();
          });
      });
  });
}

"use server";
import {
  fetchCandidatePdfBlob,
  fetchDownloadedPdfBlob,
} from "@/components/server/helper/vercelBlob/listblobData";
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import archiver from "archiver";
import { put } from "@vercel/blob";
import { ServerError } from "@/utils/messagePopup";
import { Error } from "@/types/server/admin";
const fs = require("fs");

// Download Zip (Preview page)
export async function POST(request: NextRequest) {
  try {
    const requestData = await request.json();
    const {
      user_id,
      files,
      projectName,
    }: { user_id: string; files: any; projectName: string } = requestData;

    console.log('user id from downloadzip"', files);
    // Initialize archive
    const archive = archiver("zip", { zlib: { level: 9 } });
    const zipFileName = `public/uploads/${projectName}.zip`;

    const zipBuffer: any = await new Promise((resolve, reject) => {
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

      // archive.pipe(fs.createWriteStream(zipFileName));

      // Iterate over files array
      files.forEach(
        async (
          { file_id, candidate_name }: { file_id: any; candidate_name: any },
          index: number
        ) => {
          // Extract file extension from candidate_name
          const CandidateFileURL: any = await fetchCandidatePdfBlob(
            user_id,
            file_id
          );
          const ConvertedFileURL: any = await fetchDownloadedPdfBlob(
            user_id,
            file_id
          );

          // Fetch files
          const candidateFile = await axios.get(CandidateFileURL, {
            responseType: "arraybuffer",
          });
          const convertedFile = await axios.get(ConvertedFileURL, {
            responseType: "arraybuffer",
          });

          // Append files to the archive
          archive.append(candidateFile.data, { name: `${candidate_name}` });
          archive.append(convertedFile.data, { name: `_${candidate_name}` });

          if (index === files.length - 1) {
            // If this is the last file, finalize the archive
            archive.finalize();
          }
        }
      );
    });

    const blobName = `${user_id}/${projectName}.zip`;
    const Blob = await put(blobName, zipBuffer, {
      access: "public",
      contentType:
        "application/zip, application/octet-stream, application/x-zip-compressed, multipart/x-zip",
    });

    console.log("Zip file created successfully");

    return NextResponse.json(
      {
        message: "Success",
        data: Blob,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json<Error>(
      {
        message: ServerError.Internal,
      },
      { status: 500 }
    );
  }
}

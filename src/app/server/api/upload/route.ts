import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { saveFile } from "@/components/server/helper/saveFile";
import mammoth from "mammoth";
import {
  extractDetailsOpenAi,
  extractEducationOpenAi,
  extractLanguagesOpenAi,
  extractProjectOpenAi,
  extractProvisionalSummary,
  extract_Exp_ContentOpenAi,
  extract_profQualificationsOpenAi,
} from "@/components/server/helper/OpenAI/openAI";
import { extract_Skills_OpenAi } from "../../../../components/server/helper/OpenAI/openAI";
const extraction = require("pdf-extraction");
import { storeBlob } from "@/components/server/helper/vercelBlob/blobStorage";
import { generate as shortUuid } from "short-uuid";
import { ServerError } from "@/utils/messagePopup";
import { UploadError, UploadResponse } from "@/types/server/upload";
export const maxDuration = 300;

export async function POST(request: NextRequest) {
  try {
    // Generate UUID
    const fileId = shortUuid();
    const formData = await request.formData();

    // check file blob exists
    const file = formData.get("file") as any | null;
    const id = formData.get("cardId");
    const user_id = formData.get("user_id") as string;
    const file_name = file?.name;
    console.log("File data ", file);

    // return file
    if (!file) {
      return NextResponse.json<UploadError>(
        {
          error: "The server has not found anything matching the Request URL.",
        },
        { status: 404 }
      );
    }
    // check extension for store
    const isPDF = file.type === "application/pdf";
    const isDOCX =
      file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    const isDOC =
      file.type === "application/msword" || file.type === "application/doc";
    // const extension = isPDF ? "pdf" : isDOCX ? "docx" : "doc";
    const extension = isPDF
      ? "pdf"
      : isDOCX
      ? "docx"
      : isDOC
      ? "doc"
      : "unknown";

    const filenamePrefix = id;

    // save file in temp storage
    const tempFileName = await saveFile(file, extension);
    // console.log('temp file name ',tempFileName);

    // Save Candidate file in vercel blob
    const FileBlobName = `${user_id}/${fileId}/CandidateFileCv.${extension}`;
    const bufferData = Buffer.from(await file.arrayBuffer());
    // console.log(bufferData); // File Buffer

    const saveFileToBlob = await put(FileBlobName, bufferData, {
      access: "public",
      contentType: isPDF
        ? "application/pdf"
        : isDOCX || isDOC
        ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        : "application/msword",
    });
    console.log("-----------Candidate File Saved in Blob --------------");

    // Extract raw text from file
    let RawData;
    if (extension === "pdf") {
      try {
        const data = await extraction(bufferData);
        RawData = data.text;
      } catch (error) {
        console.error("Error parsing PDF:", error);
      }
    } else if (extension === "docx" || extension === "doc") {
      // Handle parsing logic for DOCX files
      const Data = await mammoth.extractRawText({ buffer: bufferData });
      RawData = Data.value;
    }

    // Extract experience information from open ai and put in to vercel blob
    const extractedExp: any = await extract_Exp_ContentOpenAi(RawData);
    const expBlobName = `${user_id}/${fileId}/experience.txt`;
    const expBlob = await put(expBlobName, JSON.stringify(extractedExp), {
      access: "public",
      contentType: "text/plain",
    });
    console.log("Experience data stored successfully:");

    // Extract skills information
    const extractedSkills = await extract_Skills_OpenAi(RawData);
    const skillsBlobName = `${user_id}/${fileId}/skills.txt`;
    const skillsBlob = await put(
      skillsBlobName,
      JSON.stringify(extractedSkills),
      { access: "public", contentType: "text/plain" }
    );
    console.log("Skills data stored successfully:");

    // Extract languages information and store in vercel blob
    const extractedLanguages = await extractLanguagesOpenAi(RawData);
    const languagesBlobName = `${user_id}/${fileId}/languages.txt`;
    const languagesBlob = await put(
      languagesBlobName,
      JSON.stringify(extractedLanguages),
      { access: "public", contentType: "text/plain" }
    );
    console.log("Languages data stored successfully:");

    // Extract education information
    const extractedEducation = await extractEducationOpenAi(RawData);
    const educationBlobName = `${user_id}/${fileId}/education.txt`;
    const educationBlob = await put(
      educationBlobName,
      JSON.stringify(extractedEducation),
      {
        access: "public",
        contentType: "text/plain",
      }
    );
    console.log("Education data stored successfully:");

    // extract project information
    const extractedProjects = await extractProjectOpenAi(RawData);
    const projectsBlobName = `${user_id}/${fileId}/projects.txt`;
    const projectsBlob = await put(
      projectsBlobName,
      JSON.stringify(extractedProjects),
      {
        access: "public",
        contentType: "text/plain",
      }
    );
    console.log("projectsBlob data stored successfully");

    // Extract details information
    const extractedDetails = await extractDetailsOpenAi(RawData);
    const detailsBlobName = `${user_id}/${fileId}/details.txt`;
    const detailsBlob = await storeBlob(
      user_id,
      extractedDetails,
      detailsBlobName
    );
    console.log("Details data stored successfully:");

    //Extract professional summary
    const extractProfessSummary = await extractProvisionalSummary(RawData);
    const summaryBlobName = `${user_id}/${fileId}/summary.txt`;
    const summaryBlob = await storeBlob(
      user_id,
      extractProfessSummary,
      summaryBlobName
    );
    console.log("Prof summary data stored successfully");

    // Extract Professional Qualifications
    const extractProfQualification = await extract_profQualificationsOpenAi(
      RawData
    );
    const qualificationBlobName = `${user_id}/${fileId}/profQualification.txt`;
    const qualificationBlob = await storeBlob(
      user_id,
      extractProfQualification,
      qualificationBlobName
    );
    console.log("prof Qualification data stored successfully");

    console.log(
      "------File successfully uploaded and stored successfully-----"
    );

    return NextResponse.json<UploadResponse>(
      {
        file_id: fileId,
        tempFileName,
        file_name,
        isProgress: true,
        message: "The request has succeeded.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json<UploadError>(
      {
        errorMessage: ServerError.Internal,
        error,
      },
      { status: 500 }
    );
  }
}

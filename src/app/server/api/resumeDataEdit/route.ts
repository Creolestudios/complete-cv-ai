"use server";
import { Error, Response } from "@/types/server/admin";
import { ServerError } from "@/utils/messagePopup";
import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

// Resume edited data store in vercel blob
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { user_id, file_id, FileData } = data;

    if (!FileData) {
      return NextResponse.json<Error>(
        {
          error: "The server has not found anything matching the Request URL.",
        },
        { status: 404 }
      );
    }

    // Store details information
    if (FileData?.details) {
      const detailsBlobName = `${user_id}/${file_id}/details.txt`;
      const detailsBlobContent = JSON.stringify(FileData.details);
      const detailsBlob = await put(detailsBlobName, detailsBlobContent, {
        access: "public",
        contentType: "text/plain",
      });
    }

    // Store skills information
    if (FileData?.skills) {
      const skillsBlobName = `${user_id}/${file_id}/skills.txt`;
      const skillsBlobContent = JSON.stringify(FileData.skills);
      const skillsBlob = await put(skillsBlobName, skillsBlobContent, {
        access: "public",
        contentType: "text/plain",
      });
    }

    // Store experience information
    if (FileData?.experience) {
      const experienceBlobName = `${user_id}/${file_id}/experience.txt`;
      const experienceBlobContent = JSON.stringify(FileData.experience);
      const experienceBlob = await put(
        experienceBlobName,
        experienceBlobContent,
        {
          access: "public",
          contentType: "text/plain",
        }
      );
    }

    // // Store languages information
    if (FileData?.languages) {
      const languagesBlobName = `${user_id}/${file_id}/languages.txt`;
      const languagesBlobContent = JSON.stringify(FileData.languages);
      const languagesBlob = await put(languagesBlobName, languagesBlobContent, {
        access: "public",
        contentType: "text/plain",
      });
    }

    // Store education information
    if (FileData?.education) {
      const educationBlobName = `${user_id}/${file_id}/education.txt`;
      const educationBlobContent = JSON.stringify(FileData.education);
      const educationBlob = await put(educationBlobName, educationBlobContent, {
        access: "public",
        contentType: "text/plain",
      });
    }

    // Store projects information
    if (FileData?.projects) {
      const projectsBlobName = `${user_id}/${file_id}/projects.txt`;
      const projectsBlobContent = JSON.stringify(FileData.projects);
      const projectsBlob = await put(projectsBlobName, projectsBlobContent, {
        access: "public",
        contentType: "text/plain",
      });
    }

    // Store summary information
    if (FileData?.summary) {
      const summaryBlobName = `${user_id}/${file_id}/summary.txt`;
      const summaryBlobContent = JSON.stringify(FileData.summary);
      const summaryBlob = await put(summaryBlobName, summaryBlobContent, {
        access: "public",
        contentType: "text/plain",
      });
    }

    // Store qualification information
    if (FileData?.qualification) {
      const qualificationBlobName = `${user_id}/${file_id}/profQualification.txt`;
      const qualificationBlobContent = JSON.stringify(FileData.qualification);
      const qualificationBlob = await put(
        qualificationBlobName,
        qualificationBlobContent,
        {
          access: "public",
          contentType: "text/plain",
        }
      );
    }

    return NextResponse.json<Response>(
      { message: "Data updated successfully !" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Internal server error", error);
    return NextResponse.json<Error>(
      {
        errorMessage: ServerError.Internal,
      },
      { status: 500 }
    );
  }
}

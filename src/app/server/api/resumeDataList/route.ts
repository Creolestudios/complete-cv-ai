"use server";
import {
  fetchDetailsBlob,
  fetchEducationBlob,
  fetchExperienceBlob,
  fetchLanguagesBlob,
  fetchLatestSkillBlob,
  fetchProfQualificationBlob,
  fetchProjectBlob,
  fetchSummaryBlob,
} from "@/components/server/helper/vercelBlob/listblobData";
import { Error } from "@/types/server/admin";
import { ServerError } from "@/utils/messagePopup";
import { NextRequest, NextResponse } from "next/server";

// Send resume data to client side from vercel using functions
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const user_id = formData.get("user_id") as string;
    const fileId = formData.get("file_id") as string;
    const skills = await fetchLatestSkillBlob(user_id, fileId);
    const details = await fetchDetailsBlob(user_id, fileId);
    const experience = await fetchExperienceBlob(user_id, fileId);
    const languages = await fetchLanguagesBlob(user_id, fileId);
    const projects = await fetchProjectBlob(user_id, fileId);
    const education = await fetchEducationBlob(user_id, fileId);
    const summary = await fetchSummaryBlob(user_id, fileId);
    const qualification = await fetchProfQualificationBlob(user_id, fileId);
    const FileData = {
      details,
      skills,
      experience,
      languages,
      projects,
      education,
      summary,
      qualification,
    };

    return NextResponse.json(
      { FileData, message: "success", fileId: fileId },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json<Error>(
      {
        errorMessage: ServerError.Internal,
      },
      { status: 500 }
    );
  }
}

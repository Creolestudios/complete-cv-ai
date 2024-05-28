import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Import Prisma client instance
import moment from "moment";
import { Error } from "@/types/server/admin";

export const dynamic = "force-dynamic"; // Being rendered for each user at request time.
const templateNameMap: { [key: string]: string } = {
  "1": "International Original",
  "2": "International Banking",
  "3": "Mainland",
  "4": "Staffing",
};

// Get project list for user Dashboard page
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const userId: string = (formData.get("userId") || "").toString();

  // Convert userId to an integer
  const userIdInt = parseInt(userId, 10);

  if (!userIdInt || isNaN(userIdInt)) {
    return NextResponse.json<Error>(
      {
        error: "User ID is missing or invalid in the request.",
      },
      { status: 400 }
    );
  }

  try {
    const userWithTables = await prisma.user.findUnique({
      where: { id: userIdInt },
      include: {
        dashTable: {
          include: {
            files: true,
          },
        },
      },
    });

    if (userWithTables) {
      const dashTableData = userWithTables.dashTable.map((table: any) => ({
        id: table.id,
        ProjectName: table.ProjectName,
        LastSaved: moment(table.LastSaved).fromNow(),
        Date: table.LastSaved,
        zipURL: table.zipURL,
        userId: table.userId,
        UserURL: table.UserURL,
        URL: table.URL,
        Files: table.files.map((file: any) => ({
          id: file.id,
          file_id: file.file_id,
          candidateFile_name: file.candidateFile_name,
          user_url: file.user_url,
          _url: file._url,
          zipUrl: file.zipUrl,
          lastsaved: moment(file.lastsaved).fromNow(),
          templateId:
            templateNameMap[file.templateId] || "International banking",
        })),
      }));

      // Reverse the data
      const reversedDashTableData = dashTableData.reverse();

      return NextResponse.json(
        {
          userDetails: reversedDashTableData,
          message: "The request has succeeded.",
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json<Error>(
        {
          error: "User not found",
          message:
            "The server has not found anything matching the Request URL.",
        },
        { status: 404 }
      );
    }
  } catch (error) {
    console.log(error);
    return NextResponse.json<Error>(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

"use server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ServerError } from "@/utils/messagePopup";
import { Error } from "@/types/server/admin";

//Search api for dashboard
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const searchTerm = formData.get("searchTerm");

    if (!searchTerm) {
      return NextResponse.json<Error>({ message: "search term is required" });
    }

    const result = await prisma.dashTable.findMany({
      where: {
        OR: [
          {
            ProjectName: {
              contains: searchTerm.toString().toLowerCase(),
              mode: "insensitive",
            },
          },
          // {
          //   TemplateId: {
          //     contains: searchTerm.toString().toLowerCase(),
          //     mode: "insensitive",
          //   },
          // },
          // Add more fields as needed
        ],
      },
    });
    if (result.length === 0) {
      return NextResponse.json<Error>(
        { message: "No results found" },
        { status: 404 }
      );
    }
    console.log(result);

    return NextResponse.json({ data: result }, { status: 200 });
  } catch (error) {
    console.log("Internal server error", error);

    return NextResponse.json<Error>(
      { message: ServerError.Internal },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ServerError } from "@/utils/messagePopup";
import { Error } from "@/types/server/admin";

// Team Member List
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const teamId = formData.get("teamId");

    // Get data from db
    const teamMembers = await prisma.user.findMany({
      where: {
        team: {
          some: {
            id: Number(teamId),
          },
        },
      },
      select: {
        id: true,
        username: true,
        Firstname: true,
        Lastname: true,
        Role: true,
      },
    });
    return NextResponse.json({ teamMembers }, { status: 200 });
  } catch (error) {
    return NextResponse.json<Error>(
      {
        message: ServerError.Internal,
      },
      { status: 500 }
    );
  }
}

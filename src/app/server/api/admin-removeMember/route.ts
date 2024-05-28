import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ServerError } from "@/utils/messagePopup";
import { Error, Response } from "@/types/server/admin";

export async function POST(request: NextRequest) {
  try {
    const requestData = await request.json();
    const { teamId, userId }: { teamId: number; userId: number } = requestData;

    if (!teamId || !userId) {
      return NextResponse.json<Error>(
        { message: "Invalid, Please provide teamId and userId!" },
        { status: 400 }
      );
    }

    // Check if the user exists in the team
    const userInTeam = await prisma.team.findFirst({
      where: {
        id: teamId,
        members: {
          some: { id: userId },
        },
      },
    });

    if (!userInTeam) {
      return NextResponse.json<Error>(
        { message: "User is not a member of the team." },
        { status: 404 }
      );
    }

    // Remove user from the team
    await prisma.team.update({
      where: { id: teamId },
      data: {
        members: {
          disconnect: { id: userId },
        },
      },
    });

    return NextResponse.json<Response>(
      { message: "User removed from the team successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error removing user from the team:", error);
    return NextResponse.json<Error>(
      {
        message: ServerError.Internal,
      },
      {
        status: 500,
      }
    );
  }
}

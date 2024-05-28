"use server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ServerError, listTeam } from "@/utils/messagePopup";
import { Error } from "@/types/server/admin";

// Team Member List
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const teamId = formData.get("teamId");

    // Get team details along with member details
    const teamDetails = await prisma.team.findUnique({
      where: {
        id: Number(teamId),
      },
      include: {
        members: {
          select: {
            id: true,
            username: true,
            Firstname: true,
            Lastname: true,
            email: true,
            Role: true,
            mobile: true,
            isActive: true,
          },
        },
      },
    });

    if (!teamDetails) {
      return NextResponse.json<Error>({ message: listTeam.notFound }, { status: 404 });
    }

    return NextResponse.json({ teamDetails }, { status: 200 });
  } catch (error) {
    console.error("Error fetching team details:", error);
    return NextResponse.json<Error>(
      {
        message: ServerError.Internal,
      },
      { status: 500 }
    );
  }
}

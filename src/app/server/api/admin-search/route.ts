"use server";

import { NextRequest, NextResponse } from "next/server";
import { ServerError } from "@/utils/messagePopup";
import prisma from "@/lib/prisma";
import moment from "moment";
import { Error } from "@/types/server/admin";

// Search api for team
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const query = formData.get("query");

    // Search for teams based on the provided query
    const teams = await prisma.team.findMany({
      where: {
        OR: [
          { teamName: { contains: query as string, mode: "insensitive" } },
          { status: { contains: query as string, mode: "insensitive" } },
        ],
      },
      include: {
        members: true,
      },
    });

    // Process search results to include additional fields
    const teamList = teams.map((team) => ({
      id: team.id,
      teamName: team.teamName,
      status: team.status,
      description: team.description,
      memberCount: team.members.length,
      activeSince: moment(team.activeSince).format("DD/MM/YYYY"),
    }));

    // Return response with search results
    return NextResponse.json({ teamList }, { status: 200 });
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

import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";
import { ServerError } from "@/utils/messagePopup";
import moment from "moment";
import { auth } from "@/utils/auth";
import { Error } from "@/types/server/admin";

// List Team for admin
export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  try {
    // Check if user is Authenticated
    const bearerToken: string | undefined =
      req.headers.get("Authorization") ?? undefined;
    const decoded = auth.processToken(bearerToken) as jwt.JwtPayload;
    if (decoded.role !== "admin" && decoded.role !== "superAdmin") {
      return NextResponse.json<Error>(
        { message: ServerError.Unauthorized },
        { status: 401 }
      );
    }
    // Include members associated with each team
    const teams = await prisma.team.findMany({
      include: {
        members: true,
      },
    });

    // Get team list from db
    const teamList = teams.map((team) => ({
      id: team.id,
      teamName: team.teamName,
      status: team.status,
      description: team.description,
      memberCount: team.members.length,
      activeSince: moment(team.activeSince).format("DD/MM/YYYY"),
    }));

    return NextResponse.json({ teamList }, { status: 200 });
  } catch (error) {
    return NextResponse.json<Error>(
      {
        message: ServerError.Internal,
        error,
      },
      { status: 500 }
    );
  }
}

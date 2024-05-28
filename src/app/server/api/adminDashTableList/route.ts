"use server";
import { NextRequest, NextResponse } from "next/server";
import { ServerError } from "@/utils/messagePopup";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { formatTime } from "@/utils/dateFormatter";
import { Error } from "@/types/server/admin";
import { auth } from "@/utils/auth";

// Api for super admin Dashboard
export async function GET(req: NextRequest, res: NextResponse) {
  try {
    // Check user role
    const bearerToken: string | undefined =
      req.headers.get("Authorization") ?? undefined;
    const decoded = auth.processToken(bearerToken) as jwt.JwtPayload;
    if (decoded.role !== "admin" && decoded.role !== "superAdmin") {
      return NextResponse.json<Error>(
        { message: ServerError.Unauthorized },
        { status: 401 }
      );
    }
    const userList = await prisma.user.findMany({
      include: {
        team: true,
        dashTable: {
          include: {
            files: true,
          },
        },
      },
    });
    const formattedUserList = userList.map((user) => {
      // Check if user has a team
      const teamName =
        user.team.length > 0 ? user.team[0].teamName : "#Individual user";
      const cvConvertedCount = user.dashTable.reduce((count, dashTable) => {
        return count + dashTable.files.length;
      }, 0);

      // Calculate time spent
      const timeSpentInSeconds: any = parseInt(user.timeSpend ?? "0", 10);
      const timeSpentFormatted = formatTime(timeSpentInSeconds);

      return {
        id: user.id,
        name: user.username,
        role: user.Role,
        teamName: teamName,
        cvConverted: cvConvertedCount,
        timeSpent: timeSpentFormatted,
      };
    });
    // Return response
    return NextResponse.json({ formattedUserList }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json<Error>(
      { error: ServerError.Internal },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Error } from "@/types/server/admin";
import { auth } from "@/utils/auth";
import jwt from "jsonwebtoken";
import { ServerError } from "@/utils/messagePopup";

// API for line graph data
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
    // Get the current date
    const currentDate: any = new Date();

    // Calculate the start date (7 days ago)
    const startDate = new Date(currentDate);
    startDate.setDate(startDate.getDate() - 6); // Subtract 6 days to get 7 days total

    // Retrieve all teams along with their members and dash tables with files within the last 7 days
    const teamsWithUserDailyConversions = await prisma.team.findMany({
      select: {
        teamName: true,
        members: {
          select: {
            id: true,
            dashTable: {
              include: {
                files: {
                  where: {
                    lastsaved: {
                      gte: startDate,
                      lte: currentDate,
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    // Calculate the daily conversion count for each user within each team
    const teamCombinedDailyConversions = teamsWithUserDailyConversions.map(
      (team) => {
        const combinedDailyConversions = new Array(7).fill(0); // Initialize array with 0s for each day
        team.members.forEach((user) => {
          user.dashTable.forEach((dashTable) => {
            dashTable.files.forEach((file) => {
              const fileDate: any = new Date(file.lastsaved);
              const dayDifference = Math.floor(
                (currentDate - fileDate) / (1000 * 60 * 60 * 24)
              );
              if (dayDifference < 7) {
                combinedDailyConversions[6 - dayDifference]++; // Increment the corresponding index based on the day
              }
            });
          });
        });
        return {
          teamName: team.teamName,
          cvConverted: combinedDailyConversions,
        };
      }
    );

    // Return the combined daily conversion count for each team
    return NextResponse.json({ teamCombinedDailyConversions }, { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json<Error>(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

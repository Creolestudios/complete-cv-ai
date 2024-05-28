import { NextRequest, NextResponse } from "next/server";
import { ServerError } from "@/utils/messagePopup";
import prisma from "@/lib/prisma";
import { Error } from "@/types/server/admin";
import jwt from "jsonwebtoken";
import { auth } from "@/utils/auth";

// Define the mapping of template IDs to template names
const templateNameMap: { [key: string]: string } = {
  "1": "International Original",
  "2": "International Banking",
  "3": "Mainland",
  "4": "Staffing",
  // Add more mappings as needed
};

export async function POST(req: NextRequest) {
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
    const formData = await req.formData();
    const timePeriod: any = formData.get("timePeriod");
    console.log("time period", timePeriod); // Default to weekly if no time period is specified

    // Get the current date
    const currentDate = new Date();

    let startDate;
    let endDate = currentDate;

    // Calculate start and end dates based on time period
    switch (timePeriod) {
      case "daily":
        startDate = new Date(currentDate);
        startDate.setDate(startDate.getDate() - 1);
        break;
      case "weekly":
        startDate = new Date(currentDate);
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "monthly":
        startDate = new Date(currentDate);
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      default:
        return NextResponse.json<Error>(
          { message: `Invalid time period: ${timePeriod}` },
          { status: 400 }
        );
    }

    // Retrieve template usage data within the specified time period
    const templateUsage = await prisma.file.groupBy({
      by: ["templateId"],
      _count: {
        templateId: true,
      },
      where: {
        lastsaved: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Map the results to format the template usage response
    const formattedTemplateUsage = templateUsage.map(
      ({ templateId, _count }) => ({
        [templateNameMap[templateId] || templateId]: _count.templateId,
      })
    );
    // Convert the array of objects to a single object
    const templateUsageObject = Object.assign({}, ...formattedTemplateUsage);

    console.log("templateUsage", templateUsageObject);

    // Declare variables for weekly and monthly conversions
    let weeklyConversions: any = [];
    let monthlyConversions: any = [];
    let dailyConversion: any = [];

    // Conditionally fetch either the weekly or monthly conversions based on the time period
    if (timePeriod === "weekly") {
      weeklyConversions = await getTeamConversions(
        startDate,
        endDate,
        timePeriod
      );
    } else if (timePeriod === "monthly") {
      monthlyConversions = await getTeamConversions(
        startDate,
        endDate,
        timePeriod
      );
    } else if (timePeriod === "daily") {
      dailyConversion = await getTeamConversions(
        startDate,
        endDate,
        timePeriod
      );
    }

    return NextResponse.json(
      {
        templateUsageObject: templateUsageObject,
        weeklyConversions: timePeriod === "weekly" ? weeklyConversions : [],
        monthlyConversions: timePeriod === "monthly" ? monthlyConversions : [],
        dailyConversion: timePeriod === "daily" ? dailyConversion : [],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json<Error>(
      { error: ServerError.Internal },
      { status: 500 }
    );
  }
}

async function getTeamConversions(
  startDate: Date,
  endDate: Date,
  timePeriod: string
) {
  // Retrieve all teams along with their members and dash tables with files within the specified time period
  const teamsWithUserConversions = await prisma.team.findMany({
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
                    lte: endDate,
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  // Initialize an array to hold team conversions with team names
  let teamConversions: { teamName: string; cvConverted: number[] }[] = [];

  // Initialize an object to hold conversion counts indexed by team name
  let teamConversionCounts: { [key: string]: number[] } = {};

  // Calculate the conversion count for each team
  teamsWithUserConversions.forEach((team) => {
    let conversionCounts: number[] = [];

    // Calculate the conversion count for each month separately
    for (let i = 0; i < 12; i++) {
      let monthStartDate = new Date(startDate);
      monthStartDate.setMonth(startDate.getMonth() + i); // Move to next month

      let monthEndDate = new Date(monthStartDate);
      monthEndDate.setMonth(monthEndDate.getMonth() + 1); // Set to end of month

      let monthConversionCount = 0;

      // Count conversions within the current month
      team.members.forEach((user) => {
        user.dashTable.forEach((dashTable) => {
          dashTable.files.forEach((file) => {
            if (
              file.lastsaved >= monthStartDate &&
              file.lastsaved < monthEndDate
            ) {
              monthConversionCount++;
            }
          });
        });
      });

      conversionCounts.push(monthConversionCount);
    }

    // Push an object with team name and conversion counts array to the teamConversions array
    teamConversions.push({
      teamName: team.teamName,
      cvConverted: conversionCounts,
    });
  });

  return teamConversions;
}

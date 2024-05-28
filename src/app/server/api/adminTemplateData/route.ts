"use server";
import { NextRequest, NextResponse } from "next/server";
import { ServerError } from "@/utils/messagePopup";
import prisma from "@/lib/prisma";
import { Error } from "@/types/server/admin";
import { auth } from "@/utils/auth";
import jwt from "jsonwebtoken";

// Define the mapping of template IDs to template names
const templateNameMap: { [key: string]: string } = {
  "1": "International Original",
  "2": "International Banking",
  "3": "Mainland",
  "4": "Staffing",
  // Add more mappings as needed
};
// Template usage count
export async function GET(request: NextRequest) {
  try {
    // Check user role
    const bearerToken: string | undefined =
      request.headers.get("Authorization") ?? undefined;
    const decoded = auth.processToken(bearerToken) as jwt.JwtPayload;
    if (decoded.role !== "admin" && decoded.role !== "superAdmin") {
      return NextResponse.json<Error>(
        { message: ServerError.Unauthorized },
        { status: 401 }
      );
    }
    // Retrieve the template usage count
    const templateUsage = await prisma.file.groupBy({
      by: ["templateId"],
      _count: {
        templateId: true,
      },
    });

    // Map the results to format the response
    const formattedTemplateUsage = templateUsage.map(
      ({ templateId, _count }) => ({
        [templateNameMap[templateId] || templateId]: _count,
      })
    );
    // Convert the array of objects to a single object
    const templateUsageObject = Object.assign({}, ...formattedTemplateUsage);

    // Create a new object with simplified structure
    const simplifiedTemplateUsage: any = {};
    for (const key in templateUsageObject) {
      simplifiedTemplateUsage[key] = templateUsageObject[key].templateId;
    }
    // Get the current date and the date a week ago
    const currentDate = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(currentDate.getDate() - 7);

    // Retrieve the template usage count for the current week and the previous week
    const currentWeekUsage = await prisma.file.count({
      where: {
        lastsaved: {
          gte: oneWeekAgo,
          lte: currentDate,
        },
      },
    });
    const previousWeekUsage = await prisma.file.count({
      where: {
        lastsaved: {
          gte: new Date(oneWeekAgo.getTime() - 7 * 24 * 60 * 60 * 1000),
          lt: oneWeekAgo,
        },
      },
    });
    // Calculate the weekly increase in template usage
    let weeklyIncrease;
    if (currentWeekUsage === 0 && previousWeekUsage === 0) {
      weeklyIncrease = 0;
    } else if (currentWeekUsage <= previousWeekUsage) {
      // If current week usage is less than previous week, set increase to 0
      weeklyIncrease = 0;
    } else {
      weeklyIncrease = Math.round(
        ((currentWeekUsage - previousWeekUsage) / (previousWeekUsage || 1)) *
          100
      );
      weeklyIncrease = Math.min(weeklyIncrease, 100);
    }

    // Return the response
    return NextResponse.json(
      {
        templateUsageObject: simplifiedTemplateUsage,
        weeklyIncrease: `${weeklyIncrease}`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json<Error>(
      { error: ServerError.Internal },
      { status: 500 }
    );
  }
}

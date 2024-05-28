"use server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ServerError } from "@/utils/messagePopup";
import moment from "moment";
import { Error } from "@/types/server/admin";

// Fetch team list based on the provided status
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const status = formData.get("status");

    let teams;
    if (status === "Active") {
      // Fetch teams with isActive status as true (active)
      teams = await prisma.team.findMany({
        where: {
          isActive: true,
        },
        include: {
          members: true, // Include members for active teams
        },
      });
    } else if (status === "Suspended") {
      // Fetch teams with isActive status as false (suspended)
      teams = await prisma.team.findMany({
        where: {
          isActive: false,
        },
        include: {
          members: true, // Include members for suspended teams
        },
      });
    } else if (status === "Active,Suspended") {
      // Fetch all teams (both active and suspended)
      teams = await prisma.team.findMany({
        include: {
          members: true, // Include members for all teams
        },
      });
    } else if (status === "all") {
      // Fetch all teams (both active and suspended)
      teams = await prisma.team.findMany({
        include: {
          members: true, // Include members for all teams
        },
      });
    } else {
      // Invalid status provided, return a 400 response
      return NextResponse.json<Error>({ message: "Invalid status provided" });
    }

    if (teams.length === 0) {
      // If no teams found, return a 404 response
      return NextResponse.json<Error>(
        { message: "No teams found" },
        { status: 404 }
      );
    }

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
    console.error(error);
    return NextResponse.json<Error>(
      { message: ServerError.Internal },
      { status: 500 }
    );
  }
}

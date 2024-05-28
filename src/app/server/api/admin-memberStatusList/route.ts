"use server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ServerError } from "@/utils/messagePopup";
import { Error } from "@/types/server/admin";

// Fetch team members based on the provided status
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const teamId = formData.get("teamId");
    const status = formData.get("status");

    // Validate if teamId and status are present in the form data
    if (!teamId || !status) {
      return NextResponse.json<Error>(
        { message: "Team ID and status are required" },
        { status: 400 }
      );
    }

    let teamDetails;

    // Fetch team members based on the provided status
    if (status === "Active") {
      // Fetch active team members
      teamDetails = await prisma.team.findUnique({
        where: { id: Number(teamId) },
        include: {
          members: {
            where: { isActive: true },
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
    } else if (status === "Suspended") {
      // Fetch suspended team members
      teamDetails = await prisma.team.findUnique({
        where: { id: Number(teamId) },
        include: {
          members: {
            where: { isActive: false },
            select: {
              id: true,
              username: true,
              Firstname: true,
              Lastname: true,
              Role: true,
              isActive: true,
            },
          },
        },
      });
    } else if (status === "Active,Suspended") {
      teamDetails = await prisma.team.findUnique({
        where: { id: Number(teamId) },
        include: {
          members: {
            select: {
              id: true,
              username: true,
              Firstname: true,
              Lastname: true,
              Role: true,
              isActive: true,
            },
          },
        },
      });
    } else if (status === "all") {
      teamDetails = await prisma.team.findUnique({
        where: { id: Number(teamId) },
        include: {
          members: {
            select: {
              id: true,
              username: true,
              Firstname: true,
              Lastname: true,
              Role: true,
              isActive: true,
            },
          },
        },
      });
    } else {
      return NextResponse.json(
        { message: "Invalid status provided" }
        // { status: 400 }
      );
    }

    if (!teamDetails) {
      // If no teams found, return a 404 response
      return NextResponse.json<Error>({ message: "No teams found" }, { status: 404 });
    }

    return NextResponse.json({ teamDetails }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json<Error>(
      { message: ServerError.Internal },
      { status: 500 }
    );
  }
}

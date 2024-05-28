"use server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword } from "@/utils/hashPassword";
import { ServerError, admin } from "@/utils/messagePopup";
import { Error, Response } from "@/types/server/admin";

// Function for edit team API
export async function POST(request: NextRequest) {
  try {
    const requestData = await request.json();
    const {
      teamId,
      teamName,
      status,
      teamDescription,
      members,
    }: {
      teamId: number;
      teamName: string;
      status: string;
      teamDescription: string;
      members: any;
    } = requestData;

    if (
      !teamId ||
      !teamName ||
      !teamDescription ||
      !members
      // members.length < 2
    ) {
      return NextResponse.json<Error>(
        { message: admin.checkData },
        { status: 400 }
      );
    }
    // Validate each member's data
    const validationResults = members.map(validateMember);
    const invalidMemberIndex = validationResults.findIndex(
      (result: any) => !result.valid
    );
    if (invalidMemberIndex !== -1) {
      return NextResponse.json<Error>(
        {
          message: `Invalid member data: ${validationResults[invalidMemberIndex].message}`,
        },
        { status: 400 }
      );
    }
    // Active status
    let isActive;
    if (status === "Active") {
      isActive = true;
    } else if (status === "Suspended") {
      isActive = false;
    }
    // Update team name and description
    await prisma.team.update({
      where: { id: teamId },
      data: {
        teamName: teamName,
        description: teamDescription,
        status: status,
        isActive: isActive,
      },
    });

    // Fetch the current team members from the database
    const currentMembers = await prisma.user.findMany({
      where: {
        team: {
          some: { id: teamId },
        },
      },
    });

    // Update existing members
    for (const newMember of members) {
      const existingMember = currentMembers.find(
        (member) => member.email === newMember.email
      );
      console.log("existing @", existingMember);

      if (existingMember) {
        if (existingMember.username !== newMember.username) {
          try {
            // Update existing member's username
            await prisma.user.update({
              where: { id: existingMember.id },
              data: {
                username: newMember.username,
              },
            });
          } catch (error) {
            return NextResponse.json<Error>(
              { message: "username Record to update not found." },
              { status: 404 }
            );
          }
        }
        try {
          const NewDetails = await prisma.user.update({
            where: { id: existingMember.id },
            data: {
              // username: newMember.username,
              Firstname: newMember.Firstname,
              Lastname: newMember.Lastname,
              mobile: newMember.mobile,
              Role: newMember.Role,
            },
          });
          console.log(NewDetails, "update successfully");
        } catch (error: any) {
          // prisma error handling with status code
          if (error.code === "P2002" && error.meta.modelName === "User") {
            return NextResponse.json<Error>(
              { message: "User not found for update. & username constraint" },
              { status: 404 }
            );
          } else if (
            error.code === "P2025" &&
            error.meta.modelName === "Team"
          ) {
            return NextResponse.json<Error>(
              { message: "Record to update not found." },
              { status: 404 }
            );
          } else {
            return NextResponse.json<Error>(
              { message: "Invalid data." },
              { status: 400 }
            );
          }
        }
      } else {
        // Create new member
        try {
          const CommonPass = "admin";
          const hashedPassword = await hashPassword(CommonPass);
          await prisma.user.create({
            data: {
              email: newMember.email,
              username: newMember.username,
              password: hashedPassword,
              Firstname: newMember.Firstname,
              Lastname: newMember.Lastname,
              mobile: newMember.mobile,
              Role: newMember.Role,
              team: {
                connect: { id: teamId },
              },
            },
          });
        } catch (error: any) {
          // Handle specific errors
          if (error.code === "P2002" && error.meta.target.includes("email")) {
            return NextResponse.json<Error>(
              { message: "Email address already in use." },
              { status: 400 }
            );
          } else if (
            error.code === "P2025" &&
            error.meta.fields.includes("team")
          ) {
            return NextResponse.json<Error>(
              { message: "Invalid team ID." },
              { status: 400 }
            );
          } else {
            throw error; // Rethrow if it's not a known error
          }
        }
        console.log("create successfully");
      }
    }

    return NextResponse.json<Response>(
      { message: "Team updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating team:", error);
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

// Validate member data
function validateMember(member: any) {
  const requiredFields = [
    "username",
    "email",
    "Firstname",
    "Lastname",
    "mobile",
    "Role",
  ];
  for (const field of requiredFields) {
    if (!member[field]) {
      return {
        valid: false,
        message: `${field} is required for each member`,
      };
    }
  }
  return { valid: true };
}

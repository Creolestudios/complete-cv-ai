"use server";
import { NextRequest, NextResponse } from "next/server";
import { ServerError } from "@/utils/messagePopup";
import prisma from "@/lib/prisma";
import { hashPassword } from "@/utils/hashPassword";
import { Error, SettingsType } from "@/types/server/admin";
import { sendVerificationEmail } from "@/utils/emailConfig";
import { utils } from "@/utils/registerUtils";

// Invite team member
export async function POST(request: NextRequest) {
  try {
    const {
      teamId,
      username,
      email,
      Firstname,
      Lastname,
      mobile,
      Role,
      status,
    }: SettingsType = await request.json();

    if (
      !teamId ||
      !username ||
      !email ||
      !Firstname ||
      !Lastname ||
      !mobile ||
      !Role
    ) {
      return NextResponse.json<Error>(
        { message: "Missing required fields" },
        { status: 404 }
      );
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json<Error>(
        { message: "Invalid email format" },
        { status: 400 }
      );
    }

    // Check if email is already in use
    let existingEmailUser = await prisma.user.findFirst({
      where: { email },
    });

    if (existingEmailUser) {
      // Check if user is already in the team
      const existingTeamMember = await prisma.team.findFirst({
        where: { id: teamId, members: { some: { id: existingEmailUser.id } } },
      });

      if (existingTeamMember) {
        return NextResponse.json<Error>(
          { message: "User is already in the team" },
          { status: 400 }
        );
      } else {
        // Add existing user to the team
        const updatedTeam = await prisma.team.update({
          where: { id: teamId },
          data: {
            members: {
              connect: { id: existingEmailUser.id },
            },
          },
        });

        console.log("Existing user added to the team successfully");
        return NextResponse.json(
          {
            message: "Existing user added to the team successfully",
            user: existingEmailUser,
            team: updatedTeam,
          },
          { status: 201 }
        );
      }
    } else {
      // Check if username is already in use
      const existingUsernameUser = await prisma.user.findFirst({
        where: { username },
      });

      if (existingUsernameUser) {
        return NextResponse.json<Error>(
          { message: "Username is already in use" },
          { status: 400 }
        );
      }

      let isActive;
      if (status === "active") {
        isActive = true;
      } else if (status === "suspended") {
        isActive = false;
      }
      // generate password for new account
      const CommonPass = utils.generateRandomPassword();
      const hashedPassword = await hashPassword(CommonPass);

      // Create new user
      const newUser = await prisma.user.create({
        data: {
          username: username,
          email: email,
          password: hashedPassword,
          Firstname: Firstname,
          Lastname: Lastname,
          mobile: mobile,
          Role: Role,
          isActive: isActive, // Assuming status "Active" means isActive is true
        },
      });
      console.log("User created successfully", newUser);

      // Add user to the team
      const updatedTeam = await prisma.team.update({
        where: { id: teamId },
        data: {
          members: {
            connect: { id: newUser.id },
          },
        },
      });
      // Function for sending verification email
      await sendVerificationEmail(newUser.email, newUser.Firstname, CommonPass);

      console.log("User added to the team successfully");
      // Return response
      return NextResponse.json(
        {
          message: "User created and added to the team successfully",
          user: newUser,
          team: updatedTeam,
        },
        { status: 201 }
      );
    }
  } catch (error) {
    return NextResponse.json<Error>(
      {
        message: ServerError.Internal,
      },
      { status: 500 }
    );
  }
}

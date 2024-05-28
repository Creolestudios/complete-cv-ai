"use server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt, { Secret } from "jsonwebtoken";
import * as postmark from "postmark";

import { hashPassword } from "@/utils/hashPassword";
import { ServerError, admin } from "@/utils/messagePopup";
import { Error } from "@/types/server/admin";
import { utils } from "@/utils/registerUtils";
import { auth } from "@/utils/auth";

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
function generateJWTToken(email: string) {
  return jwt.sign({ email }, process.env.NEXT_PUBLIC_JWT_SECRET as Secret, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
}
async function sendVerifyEmail(
  email: string,
  verifyLink: string,
  firstname: string
) {
  const client = new postmark.ServerClient(process.env.POSTMARK_SERVER_TOKEN!);

  // Send email
  await client.sendEmail({
    From: process.env.POSTMARK_FROM_EMAIL as string,
    To: email,
    Subject: ` Cv Registration Successful ${firstname} `,
    HtmlBody: `
    <body style="background-color: #F5F3EB">
      <table style="width: 100%; max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6;background-color:white">
      <tr>
       <td style="text-align: center;">
         <h2 style="font-size: 18px;color:orangered;margin:5px"><strong>${firstname}</strong></h2>
         <p style="font-size: 16px;margin:5px"><strong>Congratulations !!!</strong></p>
         <p>You have successfully registered on . Welcome to our community!</p>
         <p>We're excited to have you join us. Here are a few things you can do:</p>
         <p>Please use the following link to verify your account:</p>
         <a href="${verifyLink}"style="display: inline-block; padding: 10px 20px; background-color: orangered; color: #ffffff; font-size: 18px; text-decoration: none; border-radius: 5px;">Verify Email</a>
         <ul style="list-style-type: none;">
           <li>Explore our platform and discover new features.</li>
           <li>Connect with other users and start engaging in discussions.</li>
           <li>Customize your profile to make it uniquely yours.</li>
         </ul>

         <p>If you have any questions or need assistance, feel free to contact our support team at .</p>

         <p>Thank you once again for choosing us. We look forward to seeing you around!</p>

         <p>Best regards</p>
         <h3 style="font-size: 18px;color:orangered"> Team</h3>
          </td>
         </tr>
       </table>
    </body>
      `,
  });
}
// Create Team
export async function POST(request: NextRequest) {
  try {
    const requestData = await request.json();
    const {
      teamName,
      teamDescription,
      status,
      members,
    }: {
      teamName: string;
      status: string;
      teamDescription: string;
      members: any;
    } = requestData;

    // Check User role
    const bearerToken: string | undefined =
      request.headers.get("Authorization") ?? undefined;
    const decoded = auth.processToken(bearerToken) as jwt.JwtPayload;
    if (decoded.role !== "admin" && decoded.role !== "superAdmin") {
      return NextResponse.json<Error>(
        { message: ServerError.Unauthorized },
        { status: 401 }
      );
    }

    if (!teamName || !teamDescription || !members) {
      return NextResponse.json<Error>(
        { message: admin.InvalidData },
        { status: 400 }
      );
    }

    // Validate each member's data
    const validationResults = members.map(validateMember);
    const invalidMemberIndex = validationResults.findIndex(
      (result: any) => !result.valid
    );
    if (invalidMemberIndex !== -1) {
      return NextResponse.json(
        {
          message: `Invalid member data: ${validationResults[invalidMemberIndex].message}`,
        },
        { status: 400 }
      );
    }

    const validMembers = members.filter((member: any) => member?.id);

    // Check if any member is already associated with a team
    const usersWithTeam = await prisma.user.findMany({
      where: {
        id: {
          in: validMembers.map((member: any) => member.id),
        },
        team: {
          none: {},
        },
      },
    });

    if (usersWithTeam.length > 0) {
      const userNamesWithTeam = usersWithTeam
        .map((user) => user.email)
        .join(", ");
      return NextResponse.json<Error>(
        {
          message: admin.alreadyIn(userNamesWithTeam),
        },
        { status: 400 }
      );
    }
    // Check if any member's email or username already exists
    const existingUsers = await prisma.user.findMany({
      where: {
        OR: members.map((member: any) => ({
          OR: [{ email: member.email }, { username: member.username }],
        })),
      },
      include: {
        team: true,
      },
    });

    // Find any duplicate emails or usernames
    const duplicateUsernames: any = new Set();

    existingUsers.forEach((user) => {
      if (members.some((member: any) => member.username === user.username)) {
        duplicateUsernames.add(user.username);
      }
    });

    if (duplicateUsernames.size > 0) {
      return NextResponse.json<Error>(
        {
          message: admin.duplicateUsernames(duplicateUsernames),
        },
        { status: 400 }
      );
    }
    // Array to store created users
    const createdUsers: any = [];
    const usersToAddToTeam: any = [];

    // Create users for each member
    await Promise.all(
      members.map(async (member: any) => {
        try {
          // Check if the user already exists
          const existingUser = existingUsers.find(
            (user) => user.email === member.email
          );
          console.log("existing user", existingUser);

          if (!existingUser) {
            // Hash password
            const CommonPass = "admin"; // Note: You might want to use a different password for each user
            const hashedPassword = await hashPassword(CommonPass);

            // Create user
            const newUser = await prisma.user.create({
              data: {
                email: member.email,
                username: member.username,
                password: hashedPassword,
                Firstname: member.Firstname,
                Lastname: member.Lastname,
                mobile: member.mobile,
                Role: member.Role,
              },
            });

            // Generate JWT token
            const jwtToken = generateJWTToken(member.email);
            // Construct reset password link with JWT token
            const verifyLink = `${utils.getBaseURL()}/verified?jwt=${jwtToken}`;
            // Send mail
            await sendVerifyEmail(member.email, verifyLink, member.Firstname);
            // Add user to team
            createdUsers.push(newUser);
            // Add user to team for existing users
            usersToAddToTeam.push(newUser);
          } else if (existingUser.team.length === 0) {
            // If the user exists but is not associated with any team, connect them to the team
            usersToAddToTeam.push(existingUser);
          } else {
            console.log(
              `User ${existingUser.username} is already associated with a team.`
            );
            return NextResponse.json(
              {
                message: admin.alreadyIn(existingUser.username),
              },
              { status: 400 }
            );
          }
        } catch (error) {
          console.error(
            `Error creating user for email ${member.email}:`,
            error
          );
          return NextResponse.json({
            message: admin.createUser(member.email),
          });
        }
      })
    );

    // Check if no new users were added
    if (createdUsers.length === 0 && usersToAddToTeam.length === 0) {
      return NextResponse.json<Error>(
        {
          message: "Email is already in use or username is already taken.",
        },
        { status: 400 }
      );
    }

    // active Status
    let isActive;
    if (status === "Active") {
      isActive = true;
    } else if (status === "Suspended") {
      isActive = false;
    }

    // Create the team
    const team = await prisma.team.create({
      data: {
        teamName,
        description: teamDescription,
        status: status,
        isActive: isActive,
        members: {
          connect: [
            ...createdUsers.map((user: any) => ({ id: user.id })),
            ...usersToAddToTeam.map((user: any) => ({ id: user.id })),
          ],
        },
        activeSince: new Date(),
      },
      include: {
        members: true,
      },
    });
    console.log("Created team:", team);
    // Return the created team
    return NextResponse.json(
      { message: admin.successful, team },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating team:", error);
    return NextResponse.json<Error>(
      {
        message: ServerError.Internal,
        error,
      },
      { status: 500 }
    );
  }
}

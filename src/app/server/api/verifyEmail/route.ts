"use server";
import jwt, { Secret } from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Popup, PopupError, ServerError } from "@/utils/messagePopup";
import * as postmark from "postmark";
import { utils } from "@/utils/registerUtils";
import { Error, Response } from "@/types/server/admin";

// Function to generate JWT token
function generateJWTToken(userId: number, email: string) {
  return jwt.sign(
    { userId, email },
    process.env.NEXT_PUBLIC_JWT_SECRET as Secret,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );
}

// Function to send reset password email
async function sendResetPasswordEmail(email: string, resetLink: string) {
  // Configure Postmark client
  const client = new postmark.ServerClient(process.env.POSTMARK_SERVER_TOKEN!);

  // Send email
  await client.sendEmail({
    From: process.env.POSTMARK_FROM_EMAIL as string,
    To: email,
    Subject: " Cv Password Reset Link",
    HtmlBody: `
    <table
      style="margin: 0 auto; border-collapse: collapse; border-spacing: 0; width: 100%; max-width: 600px;font-size: 14px"
      align="center"
      width="100%"
      cellpadding="0"
      cellspacing="0"
    >
    <h3>Reset Password</h3>
    <p>
      You recently requested to reset your password for your 
      account. Use the button below to reset it.Please do not share it with anyone
      </p>
      <p>
      <strong style="color: orangered;font-size: 14px">This password reset is only valid for the next 1 hours.</strong>
      </p>
    <!-- Action -->
      <tr>
        <td align="center">
          <table width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td align="center">
                <table border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <td>
                      <a
                        href="${resetLink}"
                        style="display: inline-block; padding: 10px 20px; background-color: orangered; color: #ffffff; font-size: 16px; text-decoration: none; border-radius: 5px;"
                        target="_blank"
                      >Reset your password</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
      <td>
      <p style="font-size: 14px; color: #666666; margin-top: 15px; line-height: 1.5;">
      If you did not request a password reset, please ignore
      this email or <a href="/" style="color: blue; text-decoration: underline;">contact support</a> if you have
      questions.
      </p>
      </td>
      </tr>
      <p>Thanks, <br />The  Team</p>
      </table>
    <!-- Sub copy -->
    <table
      style="margin: 20px auto; border-collapse: collapse; border-spacing: 0; width: 100%; max-width: 600px;"
      align="center"
      width="100%"
      cellpadding="0"
      cellspacing="0"
    >
      <tr>
        <td>
          <p style="font-size: 14px; color: #666666; margin: 0; line-height: 1.5;">
            If you’re having trouble with the button above, copy and paste the URL
            below into your web browser.
          </p>
          <p style="font-size: 14px; color: #666666; margin: 0; line-height: 1.5;">${resetLink}</p>
        </td>
      </tr>
    </table>
  `,
  });
}

// verify email API
export async function POST(request: NextRequest) {
  try {
    const { email }: { email: string } = await request.json();

    // Check if the user exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    // Check if the user exists
    if (!existingUser) {
      return NextResponse.json<Error>(
        {
          message: PopupError.userNotFound,
        },
        { status: 404 }
      );
    }

    // Check if the user is already verified
    if (!existingUser.verified) {
      return NextResponse.json<Error>(
        {
          message: PopupError.userNotVerified,
        },
        { status: 400 }
      );
    }
    // Generate JWT token
    const jwtToken = generateJWTToken(existingUser.id, existingUser.email);

    // Construct reset password link with JWT token
    const resetLink = `${utils.getBaseURL()}/reset-password?jwt=${jwtToken}`;

    // Send reset password email
    await sendResetPasswordEmail(email, resetLink);

    // Return success response
    return NextResponse.json<Response>(
      {
        message: Popup.resentLinkSend,
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

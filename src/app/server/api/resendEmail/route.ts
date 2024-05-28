"use server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt, { Secret } from "jsonwebtoken";
import * as postmark from "postmark";
import { Popup, ServerError } from "@/utils/messagePopup";
import { utils } from "@/utils/registerUtils";
import { Error, Response } from "@/types/server/admin";

function generateJWTToken(email: string) {
  return jwt.sign({ email }, process.env.NEXT_PUBLIC_JWT_SECRET as Secret, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
}
// Re-send verify link to email address
export async function POST(req: NextRequest) {
  try {
    const { email }: { email: string } = await req.json();

    // Check if user with the provided email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (!existingUser) {
      return NextResponse.json<Error>(
        {
          message:
            "Your email not found in our records, Please check your email or Register",
        },
        { status: 404 }
      );
    }
    if (existingUser.verified) {
      return NextResponse.json<Error>(
        {
          message: "Email already verified",
        },
        { status: 400 }
      );
    }
    // Generate JWT token
    const jwtToken = generateJWTToken(email);
    // Construct reset password link with JWT token
    const resetLink = `${utils.getBaseURL()}/verified?jwt=${jwtToken}`;
    // html content
    const htmlContent = `
      <body style="background-color:#F5F3EB">
        <table style="width: 100%; max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6;background-color:white">
        <tr>
         <td style="text-align: center;">
           <h2 style="font-size: 18px;color:orangered;margin:5px"><strong>${existingUser?.Firstname} ${existingUser?.Lastname}</strong></h2>
           <p style="font-size: 16px;margin:5px"><strong>Congratulations !!!</strong></p>
           <p>You have successfully registered on . Welcome to our community!</p>
           <p>We're excited to have you join us. Here are a few things you can do:</p>
           <p>Please use the following link to verify your account:</p>
           <a href="${resetLink}"style="display: inline-block; padding: 10px 20px; background-color: orangered; color: #ffffff; font-size: 18px; text-decoration: none; border-radius: 5px;">Verify Email</a>
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
        `;

    // Sending mail for verify email
    const client = new postmark.ServerClient(
      process.env.POSTMARK_SERVER_TOKEN!
    );

    await client.sendEmail({
      From: process.env.POSTMARK_FROM_EMAIL as string,
      To: email,
      Subject: ` Cv Registration Successful ${existingUser?.Firstname} `,
      HtmlBody: htmlContent,
    });

    return NextResponse.json<Response>(
      { message: Popup.emailSent },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json<Error>(
      { message: ServerError.Internal },
      { status: 500 }
    );
  }
}

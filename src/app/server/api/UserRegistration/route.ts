"use server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import jwt, { Secret } from "jsonwebtoken";
import { Popup, PopupError, ServerError } from "@/utils/messagePopup";
import * as postmark from "postmark";
import { utils } from "@/utils/registerUtils";
import { Error } from "@/types/server/admin";
import { UserRegistration, RequestData } from "@/types/server/auth";

// Function to hash password
async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

// Function to generate random symbol for username
function generateRandomSymbol() {
  const symbols = ["@", "#", "$", "*"];
  const randomIndex = Math.floor(Math.random() * symbols.length);
  return symbols[randomIndex];
}

// Function to generate JWT token
function generateJWTToken(email: string) {
  return jwt.sign({ email }, process.env.NEXT_PUBLIC_JWT_SECRET as Secret, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
}
// Function to validate email address using regular expression
function isValidEmail(email: string): boolean {
  const pattern = /^[^\s@+]+@[^\s@]+\.[^\s@]+$/;

  return pattern.test(email);
}

// Register user api
export async function POST(request: NextRequest) {
  const { email, password, firstname, lastname }: RequestData =
    await request.json();

  try {
    if (!email || !password || !firstname || !lastname) {
      return NextResponse.json<Error>(
        {
          message: "Email, password, firstname, and lastname are required",
        },
        { status: 400 }
      );
    }

    // Validate email address
    if (!isValidEmail(email)) {
      return NextResponse.json<Error>(
        { message: "Invalid email address format" },
        { status: 400 }
      );
    }

    // Check if user with the provided email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json<Error>(
        {
          message: PopupError.userExists,
        },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);
    const username = `${firstname}${lastname}${generateRandomSymbol()}`;

    // Create new user in db
    const user = await prisma.user.create({
      data: {
        username: username,
        password: hashedPassword,
        email,
        Firstname: firstname,
        Lastname: lastname,
        mobile: "",
        Role: "user",
      },
    });

    // Generate JWT token
    const jwtToken = generateJWTToken(email);
    // Construct reset password link with JWT token
    const resetLink = `${utils.getBaseURL()}/verified?jwt=${jwtToken}`;
    // Html content
    const htmlContent = `
    <body style="background-color: #F5F3EB">
      <table style="width: 100%; max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6;background-color:white">
      <tr>
       <td style="text-align: center;">
         <h2 style="font-size: 18px;color:orangered;margin:5px"><strong>${firstname}</strong></h2>
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
    // Send email
    await client.sendEmail({
      From: process.env.POSTMARK_FROM_EMAIL as string,
      To: email,
      Subject: ` Cv Registration Successful ${firstname} `,
      HtmlBody: htmlContent,
    });

    // Return success response
    return NextResponse.json<UserRegistration>(
      {
        message: Popup.registerSuccess,
        user_id: user.id,
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json<Error>(
      {
        message: ServerError.Internal,
      },
      { status: 500 }
    );
  }
}

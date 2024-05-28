"use server";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import prisma from "@/lib/prisma";
import { ServerError } from "@/utils/messagePopup";
import { Error } from "@/types/server/admin";

// convert hash password function
async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

//Password change API
export async function PUT(request: NextRequest) {
  try {
    const {
      email,
      password,
      confirmPassword,
    }: { email: string; password: string; confirmPassword: string } =
      await request.json();

    // Check if the user exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    // Check if the old password matches the current password
    if (!existingUser) {
      return NextResponse.json<Error>(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Check if the new password and confirm password match
    if (password !== confirmPassword) {
      return NextResponse.json<Error>(
        {
          message: "Password and confirm password do not match",
        },
        { status: 400 }
      );
    }

    // Hash the password using bcrypt if provided
    let hashedPassword = existingUser.password;
    if (password) {
      hashedPassword = await hashPassword(password);
    }

    // Update user information in the database
    const updatedUser = await prisma.user.update({
      where: {
        email,
      },
      data: {
        password: hashedPassword,
      },
    });

    console.log("User data updated successfully", updatedUser);

    return NextResponse.json({
      message: "Password updated successfully",

      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        // ... other fields specific to your user model
      },
      status: 200,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json<Error>(
      { error: ServerError.Internal },
      { status: 500 }
    );
  }
}

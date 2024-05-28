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

// Password change API
export async function PUT(request: NextRequest) {
  try {
    const {
      id,
      oldPassword,
      password,
      confirmPassword,
    }: {
      id: number;
      oldPassword: string;
      password: string;
      confirmPassword: string;
    } = await request.json();

    // Check if the user exists
    const existingUser = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    // Check if the old password matches the current password

    if (!existingUser) {
      return NextResponse.json<Error>(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const isOldPasswordValid = await bcrypt.compare(
      oldPassword,
      existingUser.password
    );

    if (!isOldPasswordValid) {
      return NextResponse.json<Error>(
        {
          error: "Old password is Incorrect",
        },
        { status: 401 }
      );
    }

    // Check if the new password and confirm password match
    if (password !== confirmPassword) {
      return NextResponse.json<Error>(
        { error: "Password do not match" },
        { status: 400 }
      );
    }

    // Check if the new password is different from the old password
    if (oldPassword === password) {
      return NextResponse.json<Error>(
        {
          error: "New password must be different from the old password",
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
        id,
      },
      data: {
        password: hashedPassword,
      },
    });

    console.log("User data updated successfully");

    return NextResponse.json({
      message: "Password updated successfully",

      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
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

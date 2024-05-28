"use server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ServerError } from "@/utils/messagePopup";
import { Error } from "@/types/server/admin";
import { Settings } from "@/types/server/auth";

// Settings list Api
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const userId = formData.get("userId") as string;
    const parsedUserId = parseInt(userId, 10);

    // Check if the user exists
    console.log("userId for SettingList", userId);

    if (!userId) {
      return NextResponse.json<Error>(
        { error: "User ID is missing" },
        { status: 404 }
      );
    }

    // Check if the user exists
    const existingUser = await prisma.user.findUnique({
      where: {
        id: parsedUserId,
      },
    });

    // Check if the user exists
    if (!existingUser) {
      return NextResponse.json<Error>(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json<Settings>(
      {
        user: {
          id: existingUser.id,
          username: existingUser.username,
          email: existingUser.email,
          Firstname: existingUser.Firstname,
          Lastname: existingUser.Lastname,
          mobile: existingUser.mobile,
          Role: existingUser.Role,
          isActive: existingUser.isActive,
        },
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

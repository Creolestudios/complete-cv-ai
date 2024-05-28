"use server";
import { Popup, PopupError, ServerError } from "@/utils/messagePopup";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Error, VerifyResponse } from "@/types/server/admin";

//  User verification using email
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const email = formData.get("email") as string;
    const verification = formData.get("verification");

    // Find the user by their email address
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    // Check if user exists
    if (!user) {
      return NextResponse.json<Error>(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Check if verification code matches
    if (!verification) {
      return NextResponse.json<Error>(
        { message: PopupError.verificationNotFound },
        { status: 404 }
      );
    }

    // Update user verification status
    if (email) {
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          verified: true,
        },
      });
    }
    return NextResponse.json<VerifyResponse>(
      { success: true, message: Popup.verified },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json<Error>(
      { error: ServerError.Internal },
      { status: 500 }
    );
  }
}

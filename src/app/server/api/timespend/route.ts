"use server";
import { ServerError } from "@/utils/messagePopup";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Error, TimeSpend } from "@/types/server/admin";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const userId = formData.get("userId");
    const timeToAddString: any = formData.get("time");
    const timeToAdd: any = timeToAddString ? parseInt(timeToAddString, 10) : 0;

    // Check if userId is provided
    if (!userId) {
      return NextResponse.json<Error>({ message: "User ID is missing" });
    }

    // Fetch the existing time value from the database
    const existingRecord = await prisma.user.findUnique({
      where: { id: parseInt(userId as string, 10) } as any,
    });

    if (!existingRecord) {
      return NextResponse.json<Error>({ message: "Record not found" });
    }

    // Parse existing time as integer and handle null
    const existingTime = parseInt(existingRecord.timeSpend ?? "0", 10);

    // Calculate the new time value by adding the existing time and the value to add
    const newTime: any = existingTime + timeToAdd;

    // Update the time in the database
    await prisma.user.update({
      where: { id: parseInt(userId as any, 10) } as any,
      data: { timeSpend: newTime.toString() },
    });

    // Return the updated time value
    return NextResponse.json<TimeSpend>(
      { success: true, newTime: newTime, existingTime: existingTime },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json<Error>({ error: ServerError.Internal });
  }
}

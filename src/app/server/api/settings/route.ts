"use server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ServerError } from "@/utils/messagePopup";
import { Error, SettingsType } from "@/types/server/admin";
import { Settings } from "@/types/server/auth";

// A simple regular expression for validating international phone numbers
function isValidMobileNumber(mobile: string): boolean {
  const mobileRegex = /^\d{10}$/; // only ten digit number
  return mobileRegex.test(mobile);
}

// setting api
export async function PUT(request: NextRequest) {
  try {
    const {
      id,
      username,
      email,
      Firstname,
      Lastname,
      mobile,
      Role,
    }: SettingsType = await request.json();
    console.log("setting change id", id);

    // Input Validation
    if (
      !id ||
      !username ||
      !email ||
      !Firstname ||
      !Lastname ||
      !mobile ||
      !Role
    ) {
      return NextResponse.json<Error>({ error: "Missing required fields" });
    }
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json<Error>({ error: "Invalid email format" });
    }
    // Check if the user exists
    const existingUser: any = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    // Check if the old password matches the current password

    if (!existingUser) {
      return NextResponse.json<Error>({ error: "User not found" });
    }

    // Construct the data object based on the fields that have changed
    const dataToUpdate: Record<string, any> = {};

    // Helper function to check if a field is present and different
    const hasChanged = (field: string) =>
      existingUser[field] !== undefined && existingUser[field] !== eval(field);

    if (hasChanged("username")) {
      dataToUpdate.username = username;
    }

    if (hasChanged("email")) {
      dataToUpdate.email = email;
    }

    if (hasChanged("Firstname")) {
      dataToUpdate.Firstname = Firstname;
    }

    if (hasChanged("Lastname")) {
      dataToUpdate.Lastname = Lastname;
    }

    if (hasChanged("mobile")) {
      dataToUpdate.mobile = mobile;
    }

    if (hasChanged("Role")) {
      dataToUpdate.Role = Role;
    }
    // Update user information in the database
    const updatedUser = await prisma.user.update({
      where: {
        id,
      },
      data: dataToUpdate,
    });

    console.log("User data updated successfully");

    return NextResponse.json<Settings>(
      {
        message: "Profile updated successfully!",

        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          Firstname: updatedUser.Firstname,
          Lastname: updatedUser.Lastname,
          mobile: updatedUser.mobile,
          Role: updatedUser.Role,
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

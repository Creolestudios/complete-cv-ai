"use server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ServerError, admin } from "@/utils/messagePopup";
import { Error, SettingsType } from "@/types/server/admin";
import { Settings } from "@/types/server/auth";

// Edit user in Team api
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
      status,
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
      return NextResponse.json<Error>(
        { error: "Missing required fields" },
        { status: 404 }
      );
    }
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }
    // Check if the username is already in use
    const existingUsernameUser = await prisma.user.findFirst({
      where: {
        username: username,
        NOT: {
          id: id, // Exclude the current user from the check
        },
      },
    });

    if (existingUsernameUser) {
      return NextResponse.json<Error>(
        { message: admin.usernameInUse },
        { status: 400 }
      );
    }

    // Check if the user exists
    const existingUser: any = await prisma.user.findUnique({
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

    // Update isActive based on status
    if (status === "Active") {
      dataToUpdate.isActive = true;
    } else if (status === "Suspended") {
      dataToUpdate.isActive = false;
    }
    // Update user information in the database
    const updatedUser = await prisma.user.update({
      where: {
        id,
      },
      data: dataToUpdate,
    });

    console.log("User data updated successfully");

    // Return the updated user data
    return NextResponse.json<Settings>(
      {
        message: admin.updated,

        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          Firstname: updatedUser.Firstname,
          Lastname: updatedUser.Lastname,
          mobile: updatedUser.mobile,
          Role: updatedUser.Role,
          isActive: updatedUser.isActive,
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

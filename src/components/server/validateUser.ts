import { message } from "antd";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function validateUser(userData: any) {
  // Check if the email is already in use
  const existingUser = await prisma.user.findUnique({
    where: { email: userData.email },
  });
  if (existingUser) {
    return NextResponse.json(
      {
        message: `User with email ${userData.email} already exists`,
      },
      { status: 400 }
    );
  }

  // Check if role is valid
  const validRoles = ["user", "admin"];
  if (!validRoles.includes(userData.Role)) {
    return NextResponse.json(
      { message: `Invalid role: ${userData.Role}` },
      { status: 400 }
    );
  }

  const requiredFields = [
    "Firstname",
    "Lastname",
    "mobile",
    "email",
    "username",
  ];
  const missingFields = requiredFields.filter((field) => !userData[field]);
  if (missingFields.length > 0) {
    return NextResponse.json(
      {
        message: `${missingFields.join(", ")} is required`,
        // Bad Request
      },
      { status: 400 }
    );
  }
}

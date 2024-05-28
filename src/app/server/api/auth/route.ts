// "use server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import jwt, { Secret } from "jsonwebtoken";
import { ServerError, auth } from "@/utils/messagePopup";
import { LoginRequest, LoginResponse } from "@/types/server/auth";

// login api
export async function POST(request: NextRequest): Promise<NextResponse> {
  const { email, password }: LoginRequest = await request.json();

  try {
    if (!email || !password) {
      return NextResponse.json<LoginResponse>(
        {
          isLoggedIn: false,
          message: auth.bothRequired,
        },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json<LoginResponse>(
        {
          isLoggedIn: false,
          message: auth.invalidUsername,
        },
        { status: 401 }
      );
    }
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json<LoginResponse>(
        {
          isLoggedIn: false,
          message: auth.invalidPassword,
        },
        { status: 401 }
      );
    }
    if (!user.verified) {
      return NextResponse.json<LoginResponse>(
        {
          isLoggedIn: false,
          message: auth.verify,
        },
        { status: 401 }
      );
    }
    if (!user.isActive) {
      return NextResponse.json<LoginResponse>(
        {
          isLoggedIn: false,
          message: auth.accountSuspended,
        },
        { status: 401 }
      );
    }

    const token = jwt.sign(
      { userId: user.id, UserName: email, role: user.Role },
      process.env.NEXT_PUBLIC_JWT_SECRET as Secret,
      {
        expiresIn: process.env.JWT_EXPIRES_IN,
      }
    );
    console.log(user);
    return NextResponse.json<LoginResponse>(
      {
        isLoggedIn: true,
        message: auth.loginSuccess,
        user_id: user.id,
        user,
        token,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json<LoginResponse>(
      {
        isLoggedIn: false,
        message: ServerError.Internal,
      },
      { status: 500 }
    );
  }
}

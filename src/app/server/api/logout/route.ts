import { ServerError } from "@/utils/messagePopup";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// Logout API
export async function GET(req: NextRequest) {
  try {
    cookies().delete("isLoggedIn"); // remove isLoggedIn cookie
    return NextResponse.json(
      { message: "The request has succeeded.", success: true },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: ServerError.Internal }, { status: 500 });
  }
}

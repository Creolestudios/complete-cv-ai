import { NextResponse } from "next/server";

// check the user is logged in or not and redirect to login page
export default function middleware(req: any) {
  let verify = req.cookies.get("isLoggedIn");
  let url = req.url;

  if (!verify && url.includes("/home")) {
    const absoluteURL = new URL("/", req.nextUrl.origin);
    return NextResponse.redirect(absoluteURL.toString());
  }
  if (!verify && url.includes("/dashboard")) {
    const absoluteURL = new URL("/", req.nextUrl.origin);
    return NextResponse.redirect(absoluteURL.toString());
  }
  if (!verify && url.includes("/preview")) {
    const absoluteURL = new URL("/", req.nextUrl.origin);
    return NextResponse.redirect(absoluteURL.toString());
  }
  if (!verify && url.includes("/settings")) {
    const absoluteURL = new URL("/", req.nextUrl.origin);
    return NextResponse.redirect(absoluteURL.toString());
  }
}

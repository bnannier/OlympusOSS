import { NextResponse } from "next/server";

export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:2000";
  const response = NextResponse.redirect(new URL("/", appUrl));
  response.cookies.delete("demo_iam_session");
  return response;
}

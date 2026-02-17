import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");

  if (!code) {
    return NextResponse.json({ error: "Missing authorization code" }, { status: 400 });
  }

  const hydraUrl = process.env.CIAM_HYDRA_PUBLIC_URL || "http://localhost:5002";
  const clientId = process.env.CIAM_CLIENT_ID || "demo-ciam-client";
  const clientSecret = process.env.CIAM_CLIENT_SECRET || "demo-ciam-secret";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:2000";
  const redirectUri = `${appUrl}/callback/ciam`;

  try {
    const tokenRes = await fetch(`${hydraUrl}/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }).toString(),
    });

    if (!tokenRes.ok) {
      const error = await tokenRes.text();
      console.error("CIAM token exchange failed:", error);
      return NextResponse.redirect(new URL(`/?error=ciam_token_exchange_failed`, appUrl));
    }

    const tokens = await tokenRes.json();

    // Decode ID token claims
    let claims: Record<string, unknown> = {};
    if (tokens.id_token) {
      const parts = tokens.id_token.split(".");
      if (parts.length === 3) {
        claims = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf-8"));
      }
    }

    const sessionData = {
      access_token: tokens.access_token,
      id_token: tokens.id_token,
      refresh_token: tokens.refresh_token,
      token_type: tokens.token_type,
      expires_in: tokens.expires_in,
      scope: tokens.scope,
      claims,
    };

    const response = NextResponse.redirect(new URL("/", appUrl));
    response.cookies.set("demo_ciam_session", JSON.stringify(sessionData), {
      httpOnly: false,
      path: "/",
      maxAge: tokens.expires_in || 3600,
      sameSite: "lax",
    });

    return response;
  } catch (err) {
    console.error("CIAM callback error:", err);
    return NextResponse.redirect(new URL("/?error=ciam_callback_failed", appUrl));
  }
}

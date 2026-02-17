import { cookies } from "next/headers";

interface TokenData {
  access_token: string;
  id_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in: number;
  scope: string;
  claims: {
    sub: string;
    email?: string;
    [key: string]: unknown;
  };
}

function decodeJwtPayload(token: string): Record<string, unknown> {
  const parts = token.split(".");
  if (parts.length !== 3) return {};
  const payload = Buffer.from(parts[1], "base64url").toString("utf-8");
  return JSON.parse(payload);
}

export default async function HomePage() {
  const cookieStore = await cookies();

  let ciamData: TokenData | null = null;
  let iamData: TokenData | null = null;

  const ciamCookie = cookieStore.get("demo_ciam_session");
  if (ciamCookie) {
    try {
      ciamData = JSON.parse(ciamCookie.value);
    } catch {}
  }

  const iamCookie = cookieStore.get("demo_iam_session");
  if (iamCookie) {
    try {
      iamData = JSON.parse(iamCookie.value);
    } catch {}
  }

  const ciamHydraUrl = process.env.NEXT_PUBLIC_CIAM_HYDRA_URL || "http://localhost:3102";
  const iamHydraUrl = process.env.NEXT_PUBLIC_IAM_HYDRA_URL || "http://localhost:4102";
  const ciamClientId = process.env.CIAM_CLIENT_ID || "demo-ciam-client";
  const iamClientId = process.env.IAM_CLIENT_ID || "demo-iam-client";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:2000";

  const ciamAuthUrl = `${ciamHydraUrl}/oauth2/auth?client_id=${ciamClientId}&response_type=code&scope=openid+profile+email&redirect_uri=${encodeURIComponent(`${appUrl}/callback/ciam`)}&state=ciam-demo`;
  const iamAuthUrl = `${iamHydraUrl}/oauth2/auth?client_id=${iamClientId}&response_type=code&scope=openid+profile+email&redirect_uri=${encodeURIComponent(`${appUrl}/callback/iam`)}&state=iam-demo`;

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", color: "#e2e8f0", padding: "48px 24px" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, textAlign: "center", marginBottom: 8 }}>
          OlympusOSS Identity Platform — Demo
        </h1>
        <p style={{ textAlign: "center", color: "#94a3b8", marginBottom: 48, fontSize: 16 }}>
          Test OAuth2 authentication flows against both identity domains
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
          {/* CIAM Card */}
          <div style={{ background: "#1e293b", borderRadius: 12, padding: 32, border: "1px solid #334155" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <span style={{ background: "#6366f1", borderRadius: 8, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700 }}>C</span>
              <h2 style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>Customer Identity (CIAM)</h2>
            </div>
            <p style={{ color: "#94a3b8", fontSize: 14, marginBottom: 24 }}>
              Authenticate as a customer through CIAM Hydra (port 3102) → CIAM Hera (port 3001) → CIAM Medusa (port 3002)
            </p>

            {ciamData ? (
              <div>
                <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                  <span style={{ background: "#059669", color: "white", padding: "4px 12px", borderRadius: 9999, fontSize: 12, fontWeight: 600 }}>Authenticated</span>
                  <a href="/logout/ciam" style={{ background: "#dc2626", color: "white", padding: "4px 12px", borderRadius: 9999, fontSize: 12, fontWeight: 600, textDecoration: "none" }}>Logout</a>
                </div>
                <SessionDisplay data={ciamData} />
              </div>
            ) : (
              <a
                href={ciamAuthUrl}
                style={{ display: "inline-block", background: "#6366f1", color: "white", padding: "12px 24px", borderRadius: 8, textDecoration: "none", fontWeight: 600, fontSize: 15 }}
              >
                Login to CIAM
              </a>
            )}
          </div>

          {/* IAM Card */}
          <div style={{ background: "#1e293b", borderRadius: 12, padding: 32, border: "1px solid #334155" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <span style={{ background: "#f59e0b", borderRadius: 8, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: "#0f172a" }}>E</span>
              <h2 style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>Employee Identity (IAM)</h2>
            </div>
            <p style={{ color: "#94a3b8", fontSize: 14, marginBottom: 24 }}>
              Authenticate as an employee through IAM Hydra (port 4102) → IAM Hera (port 4001) → IAM Medusa (port 4002)
            </p>

            {iamData ? (
              <div>
                <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                  <span style={{ background: "#059669", color: "white", padding: "4px 12px", borderRadius: 9999, fontSize: 12, fontWeight: 600 }}>Authenticated</span>
                  <a href="/logout/iam" style={{ background: "#dc2626", color: "white", padding: "4px 12px", borderRadius: 9999, fontSize: 12, fontWeight: 600, textDecoration: "none" }}>Logout</a>
                </div>
                <SessionDisplay data={iamData} />
              </div>
            ) : (
              <a
                href={iamAuthUrl}
                style={{ display: "inline-block", background: "#f59e0b", color: "#0f172a", padding: "12px 24px", borderRadius: 8, textDecoration: "none", fontWeight: 600, fontSize: 15 }}
              >
                Login to IAM
              </a>
            )}
          </div>
        </div>

        {/* Admin Panels */}
        <h2 style={{ fontSize: 22, fontWeight: 600, textAlign: "center", marginTop: 48, marginBottom: 24, color: "#94a3b8" }}>
          Admin Panels
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
          {/* CIAM Athena */}
          <div style={{ background: "#1e293b", borderRadius: 12, padding: 32, border: "1px solid #334155" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <span style={{ background: "#dc2626", borderRadius: 8, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700 }}>A</span>
              <h2 style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>CIAM Athena</h2>
            </div>
            <p style={{ color: "#94a3b8", fontSize: 14, marginBottom: 24 }}>
              Admin panel for managing customer identities, schemas, and OAuth2 clients on the CIAM domain.
            </p>
            <a
              href="http://localhost:3003"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "inline-block", background: "#dc2626", color: "white", padding: "12px 24px", borderRadius: 8, textDecoration: "none", fontWeight: 600, fontSize: 15 }}
            >
              Open CIAM Admin
            </a>
          </div>

          {/* IAM Athena */}
          <div style={{ background: "#1e293b", borderRadius: 12, padding: 32, border: "1px solid #334155" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <span style={{ background: "#059669", borderRadius: 8, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700 }}>A</span>
              <h2 style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>IAM Athena</h2>
            </div>
            <p style={{ color: "#94a3b8", fontSize: 14, marginBottom: 24 }}>
              Admin panel for managing employee identities, schemas, and OAuth2 clients on the IAM domain.
            </p>
            <a
              href="http://localhost:4003"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "inline-block", background: "#059669", color: "white", padding: "12px 24px", borderRadius: 8, textDecoration: "none", fontWeight: 600, fontSize: 15 }}
            >
              Open IAM Admin
            </a>
          </div>
        </div>

        <div style={{ marginTop: 48, textAlign: "center", color: "#64748b", fontSize: 13 }}>
          <p>
            This demo app is an OAuth2 client that tests the full authorization code flow.
            Each login button redirects to Ory Hydra, which routes through Hera (authentication) and Medusa (consent) before returning here with an authorization code.
          </p>
        </div>
      </div>
    </div>
  );
}

function SessionDisplay({ data }: { data: TokenData }) {
  return (
    <div style={{ fontSize: 13 }}>
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: "#cbd5e1", marginBottom: 8 }}>User Info</h3>
        <div style={{ background: "#0f172a", borderRadius: 8, padding: 16 }}>
          <div style={{ marginBottom: 6 }}>
            <span style={{ color: "#94a3b8" }}>Subject: </span>
            <span style={{ color: "#e2e8f0", fontFamily: "monospace", fontSize: 12 }}>{data.claims.sub}</span>
          </div>
          {data.claims.email && (
            <div style={{ marginBottom: 6 }}>
              <span style={{ color: "#94a3b8" }}>Email: </span>
              <span style={{ color: "#e2e8f0" }}>{data.claims.email as string}</span>
            </div>
          )}
          <div>
            <span style={{ color: "#94a3b8" }}>Scopes: </span>
            <span style={{ color: "#e2e8f0" }}>{data.scope}</span>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: "#cbd5e1", marginBottom: 8 }}>ID Token Claims</h3>
        <pre style={{ background: "#0f172a", borderRadius: 8, padding: 16, overflow: "auto", margin: 0, color: "#a5b4fc", fontSize: 11, lineHeight: 1.5 }}>
          {JSON.stringify(data.claims, null, 2)}
        </pre>
      </div>

      <div>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: "#cbd5e1", marginBottom: 8 }}>Tokens</h3>
        <div style={{ background: "#0f172a", borderRadius: 8, padding: 16 }}>
          <div style={{ marginBottom: 6 }}>
            <span style={{ color: "#94a3b8" }}>Access Token: </span>
            <span style={{ color: "#e2e8f0", fontFamily: "monospace", fontSize: 11, wordBreak: "break-all" }}>
              {data.access_token.substring(0, 40)}...
            </span>
          </div>
          <div style={{ marginBottom: 6 }}>
            <span style={{ color: "#94a3b8" }}>Token Type: </span>
            <span style={{ color: "#e2e8f0" }}>{data.token_type}</span>
          </div>
          <div>
            <span style={{ color: "#94a3b8" }}>Expires In: </span>
            <span style={{ color: "#e2e8f0" }}>{data.expires_in}s</span>
          </div>
        </div>
      </div>
    </div>
  );
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Demo App — OAuth2 Test Client",
  description: "Test application for CIAM and IAM OAuth2 authentication flows",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, -apple-system, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}

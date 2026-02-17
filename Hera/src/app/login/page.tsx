import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getLoginRequest, acceptLoginRequest } from "@/lib/hydra";
import { getSession, getEmail } from "@/lib/kratos";
import { LoginForm } from "./login-form";

export default async function LoginPage({
	searchParams,
}: {
	searchParams: Promise<{ login_challenge?: string }>;
}) {
	const { login_challenge: challenge } = await searchParams;

	if (!challenge) {
		return <p>Missing login_challenge</p>;
	}

	// Check if Hydra says we can skip
	const loginRequest = await getLoginRequest(challenge);
	if (loginRequest.skip) {
		const result = await acceptLoginRequest(challenge, {
			subject: loginRequest.subject,
		});
		redirect(result.redirect_to);
	}

	// Check for existing Kratos session
	const hdrs = await headers();
	const cookie = hdrs.get("cookie");
	const session = await getSession(cookie);

	if (session?.identity) {
		const result = await acceptLoginRequest(challenge, {
			subject: session.identity.id,
			context: { email: getEmail(session.identity) },
		});
		redirect(result.redirect_to);
	}

	// No session — render login form
	return <LoginForm challenge={challenge} />;
}

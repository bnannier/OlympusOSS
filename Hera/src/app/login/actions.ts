"use server";

import { redirect } from "next/navigation";
import { acceptLoginRequest } from "@/lib/hydra";
import { createLoginFlow, submitLoginFlow, extractCsrfToken, getEmail } from "@/lib/kratos";

export async function loginAction(
	_prevState: { error: string | null },
	formData: FormData,
): Promise<{ error: string | null }> {
	const challenge = formData.get("login_challenge") as string;
	const email = formData.get("email") as string;
	const password = formData.get("password") as string;

	if (!challenge || !email || !password) {
		return { error: "Email and password are required." };
	}

	try {
		const flow = await createLoginFlow();
		const csrfToken = extractCsrfToken(flow);
		const loginResult = await submitLoginFlow(flow.id, email, password, csrfToken);

		if (!loginResult.session?.identity) {
			return { error: "Invalid email or password." };
		}

		const identity = loginResult.session.identity;
		const result = await acceptLoginRequest(challenge, {
			subject: identity.id,
			context: { email: getEmail(identity) },
		});

		redirect(result.redirect_to);
	} catch (err) {
		// Re-throw redirect errors (Next.js uses throw for redirect)
		if (err instanceof Error && err.message === "NEXT_REDIRECT") throw err;
		return { error: "Invalid email or password." };
	}
}

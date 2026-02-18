const HYDRA_ADMIN_URL = process.env.HYDRA_ADMIN_URL || "http://localhost:4103";

async function hydraAdmin(path: string, method = "GET", body?: unknown) {
	const opts: RequestInit = {
		method,
		headers: { "Content-Type": "application/json" },
	};
	if (body) opts.body = JSON.stringify(body);

	const res = await fetch(`${HYDRA_ADMIN_URL}${path}`, opts);
	if (!res.ok) {
		const text = await res.text();
		throw new Error(`Hydra ${method} ${path} failed (${res.status}): ${text}`);
	}
	return res.json();
}

export function getLoginRequest(challenge: string) {
	return hydraAdmin(`/admin/oauth2/auth/requests/login?login_challenge=${challenge}`);
}

export function acceptLoginRequest(challenge: string, body: Record<string, unknown>) {
	return hydraAdmin(`/admin/oauth2/auth/requests/login/accept?login_challenge=${challenge}`, "PUT", body);
}

// --- Consent ---

export function getConsentRequest(challenge: string) {
	return hydraAdmin(`/admin/oauth2/auth/requests/consent?consent_challenge=${challenge}`);
}

export function acceptConsentRequest(challenge: string, body: Record<string, unknown>) {
	return hydraAdmin(`/admin/oauth2/auth/requests/consent/accept?consent_challenge=${challenge}`, "PUT", body);
}

// --- Logout ---

export function getLogoutRequest(challenge: string) {
	return hydraAdmin(`/admin/oauth2/auth/requests/logout?logout_challenge=${challenge}`);
}

export function acceptLogoutRequest(challenge: string) {
	return hydraAdmin(`/admin/oauth2/auth/requests/logout/accept?logout_challenge=${challenge}`, "PUT");
}

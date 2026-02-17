const HYDRA_ADMIN_URL = process.env.HYDRA_ADMIN_URL || "http://localhost:7003";

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

import { redirect } from "next/navigation";
import { getConsentRequest, acceptConsentRequest } from "@/lib/hydra";

export default async function ConsentPage({
	searchParams,
}: {
	searchParams: Promise<{ consent_challenge?: string }>;
}) {
	const { consent_challenge: challenge } = await searchParams;

	if (!challenge) {
		return <p>Missing consent_challenge</p>;
	}

	const consentRequest = await getConsentRequest(challenge);

	// If the user has already granted consent to this client (remembered),
	// Hydra sets skip=true — auto-accept without re-prompting.
	if (consentRequest.skip) {
		const result = await acceptConsentRequest(challenge, {
			grant_scope: consentRequest.requested_scope,
			grant_access_token_audience:
				consentRequest.requested_access_token_audience,
			session: {
				id_token: {
					email: consentRequest.context?.email || "",
					sub: consentRequest.subject,
				},
			},
		});
		redirect(result.redirect_to);
	}

	// First-time consent: auto-accept and remember so subsequent logins skip consent
	const result = await acceptConsentRequest(challenge, {
		grant_scope: consentRequest.requested_scope,
		grant_access_token_audience:
			consentRequest.requested_access_token_audience,
		remember: true,
		remember_for: 0, // 0 = remember forever (until consent is revoked)
		session: {
			id_token: {
				email: consentRequest.context?.email || "",
				sub: consentRequest.subject,
			},
		},
	});

	redirect(result.redirect_to);
}

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

	// Auto-accept: grant all requested scopes for internal apps
	const result = await acceptConsentRequest(challenge, {
		grant_scope: consentRequest.requested_scope,
		grant_access_token_audience: consentRequest.requested_access_token_audience,
		session: {
			id_token: {
				email: consentRequest.context?.email || "",
				sub: consentRequest.subject,
			},
		},
	});

	redirect(result.redirect_to);
}

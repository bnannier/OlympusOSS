import { redirect } from "next/navigation";
import { acceptLogoutRequest } from "@/lib/hydra";

export default async function LogoutPage({
	searchParams,
}: {
	searchParams: Promise<{ logout_challenge?: string }>;
}) {
	const { logout_challenge: challenge } = await searchParams;

	if (!challenge) {
		return <p>Missing logout_challenge</p>;
	}

	const result = await acceptLogoutRequest(challenge);
	redirect(result.redirect_to);
}

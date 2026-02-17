"use client";

import { useActionState } from "react";
import { loginAction } from "./actions";

export function LoginForm({ challenge }: { challenge: string }) {
	const [state, formAction, pending] = useActionState(loginAction, { error: null });

	return (
		<div style={styles.body}>
			<div style={styles.card}>
				<h1 style={styles.h1}>Sign In</h1>
				<p style={styles.subtitle}>Authenticate with your Athena credentials</p>

				{state.error && <div style={styles.error}>{state.error}</div>}

				<form action={formAction}>
					<input type="hidden" name="login_challenge" value={challenge} />

					<label htmlFor="email" style={styles.label}>Email</label>
					<input
						type="email"
						id="email"
						name="email"
						required
						autoFocus
						placeholder="you@example.com"
						style={styles.input}
					/>

					<label htmlFor="password" style={styles.label}>Password</label>
					<input
						type="password"
						id="password"
						name="password"
						required
						placeholder="Your password"
						style={styles.input}
					/>

					<button type="submit" disabled={pending} style={styles.button}>
						{pending ? "Signing in..." : "Sign In"}
					</button>
				</form>
			</div>
		</div>
	);
}

const styles: Record<string, React.CSSProperties> = {
	body: {
		fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
		background: "#0f172a",
		color: "#e2e8f0",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		minHeight: "100vh",
	},
	card: {
		background: "#1e293b",
		borderRadius: 12,
		padding: "2.5rem",
		width: "100%",
		maxWidth: 400,
		boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
	},
	h1: {
		fontSize: "1.5rem",
		fontWeight: 600,
		marginBottom: "0.25rem",
	},
	subtitle: {
		color: "#94a3b8",
		fontSize: "0.875rem",
		marginBottom: "1.5rem",
	},
	label: {
		display: "block",
		fontSize: "0.875rem",
		fontWeight: 500,
		marginBottom: "0.375rem",
		color: "#cbd5e1",
	},
	input: {
		width: "100%",
		padding: "0.625rem 0.75rem",
		border: "1px solid #334155",
		borderRadius: 8,
		background: "#0f172a",
		color: "#e2e8f0",
		fontSize: "0.9375rem",
		marginBottom: "1rem",
		outline: "none",
	},
	button: {
		width: "100%",
		padding: "0.625rem",
		background: "#6366f1",
		color: "#fff",
		border: "none",
		borderRadius: 8,
		fontSize: "0.9375rem",
		fontWeight: 600,
		cursor: "pointer",
	},
	error: {
		background: "#451a1a",
		border: "1px solid #7f1d1d",
		color: "#fca5a5",
		padding: "0.625rem 0.75rem",
		borderRadius: 8,
		fontSize: "0.875rem",
		marginBottom: "1rem",
	},
};

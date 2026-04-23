export async function sendEmail(
	to: string,
	subject: string,
	body: string,
): Promise<void> {
	console.log(
		`\n📧 Email to: ${to}\n   Subject: ${subject}\n   Body: ${body}\n`,
	);
}

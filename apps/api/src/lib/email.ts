import { Resend } from "resend";
import { getEnv } from "../config/env.js";

let _resend: Resend | null = null;

function getResend(): Resend {
	if (!_resend) {
		_resend = new Resend(getEnv().RESEND_API_KEY);
	}
	return _resend;
}

export async function sendEmail(
	to: string,
	subject: string,
	body: string,
): Promise<void> {
	const { RESEND_FROM_EMAIL } = getEnv();
	const { error } = await getResend().emails.send({
		from: RESEND_FROM_EMAIL,
		to,
		subject,
		html: body,
	});
	if (error) {
		throw new Error(`Failed to send email: ${error.message}`);
	}
}

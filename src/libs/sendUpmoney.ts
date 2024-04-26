import nodemailer, { Transporter } from "nodemailer";

module.exports = async (
	email: string,
	subject: string,
	upmoneyNumber: string,
) => {
	const transporter: Transporter = nodemailer.createTransport({
		service: process.env.SERVICE_EMAIL,
		auth: {
			user: process.env.USER_EMAIL,
			pass: process.env.PASS_EMAIL,
		},
	});

	function formatNumber(number: string): string {
    const cleaned = (`${number}`).replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{3})(\d{1})$/);

    if (match) {
        return `${match[1]} ${match[2]} ${match[3]} ${match[4]}`;
    }

    return number; // Retorna o número original se não estiver no formato esperado
	}

	await transporter.sendMail({
		from: process.env.USER_EMAIL,
		to: email,
		subject: subject,
		html: `<div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5; border-radius: 10px; text-align: center;">
						<h1 style="color: #ff6600;">Levantamento sem cartão</h1>
						<p style="margin-bottom: 20px;">Abaixo estão os dados do levantamento</p>
						<p style="margin-bottom: 20px;">Código do levantamento</p>
						<p style="color: black; font-size: 28px; letter-spacing: 10px; font-weight: 600;">${formatNumber(upmoneyNumber)}</p>
						<p style="margin-top: 10px;">Não compartilhe este email com ninguém.</p>
					</div>`,
		});
};

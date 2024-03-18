import nodemailer, { Transporter } from "nodemailer";

module.exports = async (email: string, subject: string) => {
	const transporter: Transporter = nodemailer.createTransport({
		service: process.env.SERVICE_EMAIL,
		auth: {
			user: process.env.USER_EMAIL,
			pass: process.env.PASS_EMAIL,
		},
	});
	
	
	function getDate() {
		const data = new Date();
		const dia = String(data.getDate()).padStart(2, '0');
		const mes = String(data.getMonth() + 1).padStart(2, '0');
		const ano = String(data.getFullYear()).slice(-4);
		const horas = String(data.getHours()).padStart(2, '0');
		const minutos = String(data.getMinutes()).padStart(2, '0');
		return `${dia}/${mes}/${ano} - ${horas}:${minutos}`;
	}
	
	await transporter.sendMail({
		from: process.env.USER_EMAIL,
		to: email,
		subject: subject,
		html: `<div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5; border-radius: 10px; text-align: center;">
                <h1 style="color: #ff6600;">Código de acesso alterado</h1>
                <p style="margin-bottom: 20px;">O seu código de acesso foi alterado!</p>
								<p>Data da alteração: ${getDate()}</p>
                <p style="margin-top: 20px;">Se você não tentou realizar esta operação, entre em contacto com nosso suporte em <a href="https://www.bfa.ao/pt/particulares/apoio-ao-cliente/linha-de-atendimento-bfa/" style="color: #ff6600; text-decoration: underline;">Linha de Atendimento do BFA</a>. Por favor, não compartilhe este email com ninguém.</p>
            </div>`,
	});
};

import crypto from "crypto";
import { Request, Response } from "express";
import { prismaClient } from "../../infra/database/prismaClient";
const bcrypt = require("bcryptjs");
const sendMail = require("../../libs/sendEmail");

export class ResetPasswordUseCase {
	async encrypt(token: string): Promise<string> {
		const salt = await bcrypt.genSalt(12);
		const tokenHash = await bcrypt.hash(token, salt);
		return tokenHash;
	}

	async resetPassword(email: string, response: Response) {
		try {
			const client_email = await prismaClient.client_email.findFirst({
				where: { email_address: email },
				select: { client_id: true },
			});
			if (client_email) {
				const token = crypto.randomBytes(32).toString("hex");
				const tokenHash = await this.encrypt(token);
				const url = `${process.env.BASE_URL}/email/${email}/resetPassword/${token}`;
				const client = await prismaClient.client.update({
					where: { client_id: client_email?.client_id || 0 },
					data: {
						token: tokenHash,
					},
				});
				sendMail(email, "Redefinição de credenciais", url);
				response
					.status(201)
					.json({ message: "Email enviado para a sua caixa de entrada." });
			} else {
				response
					.status(200)
					.json({ message: "Este email não está associado à uma conta!" });
			}
		} catch {
			response
				.status(500)
				.json({ message: "Erro interno! Tente novamente mais tarde." });
		}
	}

	async execute(request: Request, response: Response) {
		const email = request.params.email;
		await this.resetPassword(email, response);
	}
}

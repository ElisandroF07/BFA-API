import crypto from "crypto";
import { Request, Response } from "express";
import { prismaClient } from "../../infra/database/prismaClient";
const sendMail = require("../../libs/sendEmail");
const bcrypt = require("bcryptjs");

export class VerifyEmailUseCase {
	async encrypt(token: string): Promise<string> {
		const salt = await bcrypt.genSalt(12);
		const tokenHash = await bcrypt.hash(token, salt);
		return tokenHash;
	}

	async sendToken(email: string, response: Response) {
		const res = await prismaClient.client_email.findFirst({
			where: { email_address: email },
			select: { verified: true, email_id: true },
		});

		if (res) {
			if (res.verified) {
				return response
					.status(400)
					.json({ message: "O email já está associado à uma conta!" });
			}

			try {
				const token = crypto.randomBytes(32).toString("hex");
				const tokenHash = await this.encrypt(token);
				await prismaClient.client_email.update({
					where: {
						email_id: res.email_id,
					},
					data: {
						token: tokenHash,
					},
				});
				const url = `${process.env.BASE_URL}/email/${email}/verify/${token}`;
				await sendMail(email, "Confirmar Email", url);
				return response
					.status(201)
					.json({ message: `Email enviado para o endereço: ${email}` });
			} catch {
				return response
					.status(500)
					.json({ message: "Erro interno! Tente mais tarde." });
			}
		} else {
			try {
				const token = crypto.randomBytes(32).toString("hex");
				const tokenHash = await this.encrypt(token);
				await prismaClient.client_email.create({
					data: {
						email_address: email,
						verified: false,
						role_id: 1,
						token: tokenHash,
					},
				});
				const url = `${process.env.BASE_URL}/email/${email}/verify/${token}`;
				await sendMail(email, "Confirmar Email", url);
				response
					.status(201)
					.json({ message: `Email enviado para o endereço: ${email}` });
			} catch {
				return response
					.status(500)
					.json({ message: "Erro interno! Tente mais tarde." });
			}
		}
	}

	execute(response: Response, request: Request) {
		const email = request.params.email;
		this.sendToken(email, response);
	}
}

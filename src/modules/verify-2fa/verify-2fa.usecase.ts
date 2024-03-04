import { Request, Response } from "express";
import { prismaClient } from "../../infra/database/prismaClient";
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

export class Verify2FAUseCase {
	async compareToken(tokenHash: string, token: string) {
		const response = await bcrypt.compare(token, tokenHash);
		if (response) {
			return true;
		}

		return false;
	}

	async verifyToken(email: string, user_token: string, response: Response) {
		try {
			const client_email = await prismaClient.client_email.findFirst({
				where: {
					email_address: email,
				},
				select: {
					client_id: true,
				}
			});
			const client = await prismaClient.client.findFirst({
				where: { client_id: client_email?.client_id || 0 },
				select: {
					token: true,
					client_id: true,
					address: true,
					personal_data: true,
					bi_number: true,
					membership_number: true,
				}
			});
			if (client) {
				if (await this.compareToken(client.token || "", user_token)) {
					await prismaClient.client.update({
						where: { client_id: client.client_id || 0 },
						data: { token: "" },
					});
					const secret = process.env.SECRET;
					const token = jwt.sign(
						{
							id: client.client_id,
						},
						secret,
						{ expiresIn: "1h" },
					);
					response.redirect(
						`http://localhost:3000/dashboard?token=${token}?user=${client}`,
					);
				} else response.redirect("http://localhost:3000/login/error");
			} else {
				response.redirect("http://localhost:3000/login/error");
			}
		} catch {
			response
				.status(500)
				.json({ message: "Erro interno! Tente novamente mais tarde." });
		}
	}

	execute(response: Response, request: Request) {
		const email = request.params.email;
		const token = request.params.token;
		this.verifyToken(email, token, response);
	}
}

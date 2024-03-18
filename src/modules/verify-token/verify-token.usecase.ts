import { Request, Response } from "express";
import { prismaClient } from "../../infra/database/prismaClient";
const bcrypt = require("bcryptjs");

export class VerifyTokenUseCase {
	async compareToken(tokenHash: string, token: string) {
		const response = await bcrypt.compare(token, tokenHash);
		if (response) {
			return true;
		}
		return false;
	}

	async verifyToken(email: string, user_token: string, response: Response) {
		const token = await prismaClient.client_email.findFirst({
			where: {
				email_address: email,
			},
			select: {
				token: true,
				verified: true,
				email_id: true,
			}
		});

		if (token) {
			if (token.verified) {
				return response.redirect("http://localhost:3000/expired-token");
			}
			if (await bcrypt.compare(user_token, token.token || "")) {
				await prismaClient.client_email.update({
					where: { email_id: token.email_id },
					data: {
						verified: true,
						token: "",
					},
				});
				const client_email = await prismaClient.client_email.findFirst({where: {email_address: email}, select: {complete: true, client_id: true}})
				const client = await prismaClient.client.findFirst({where: {client_id: client_email?.client_id || 0}})
				if (client) {
					await prismaClient.client_images.deleteMany({where: {client_id: client_email?.client_id}})
					await prismaClient.client.update({where: {client_id: client_email?.client_id || 0}, data: {
						access_code: "",
						address: {},
						authentication_otp: "",
						bi_number: "",
						membership_number: "",
						personal_data: {},
						professional_data: {},
					}})
					return response.redirect("http://localhost:3000/verified-token");
				}
				return response.redirect("http://localhost:3000/verified-token");
			}
			return response.redirect("http://localhost:3000/expired-token");
		}

		return response.redirect("http://localhost:3000/expired-token");
	}

	execute(response: Response, request: Request) {
		const email = request.params.email;
		const token = request.params.token;
		this.verifyToken(email, token, response);
	}
}

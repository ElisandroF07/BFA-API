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
			},
			cacheStrategy: {
				ttl: 30,
				swr: 60,
			}
		});

		if (token) {
			if (token.verified) {
				return response.redirect("http://localhost:3000/email/error");
			}

			if (await bcrypt.compare(user_token, token.token || "")) {
				await prismaClient.client_email.update({
					where: { email_id: token.email_id },
					data: {
						verified: true,
						token: "",
					},
				});
				return response.redirect("http://localhost:3000/email/verified");
			}

			return response.redirect("http://localhost:3000/email/error");
		}

		return response.redirect("http://localhost:3000/email/error");
	}

	execute(response: Response, request: Request) {
		const email = request.params.email;
		const token = request.params.token;
		this.verifyToken(email, token, response);
	}
}

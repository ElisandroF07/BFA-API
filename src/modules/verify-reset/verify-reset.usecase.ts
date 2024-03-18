import crypto from "crypto";
import { Request, Response } from "express";
import { prismaClient } from "../../infra/database/prismaClient";
const bcrypt = require("bcryptjs");
const sendMail = require("../../libs/sendEmail");

export class VerifyResetUseCase {
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
				client_id: true,
			}
		});
		const client = await prismaClient.client.findFirst({
			where: { client_id: token?.client_id || 0 },
			select: { token: true },
		});

		if (client) {
			if (client.token === "") {
				return response.redirect("http://localhost:3000/expired-token");
			}

			if (await bcrypt.compare(user_token, client.token || "")) {
				await prismaClient.client.update({
					where: { client_id: token?.client_id || 0 },
					data: {
						token: "",
					},
				});
				return response.redirect(
					"http://localhost:3000/forgot-password/set-credentials",
				);
			}

			return response.redirect("http://localhost:3000/expired-token");
		}

		return response.redirect("http://localhost:3000/expired-token");
	}

	async execute(request: Request, response: Response) {
		const email = request.params.email;
		const token = request.params.token;
		await this.verifyToken(email, token, response);
	}
}

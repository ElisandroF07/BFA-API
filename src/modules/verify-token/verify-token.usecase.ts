import { Request, Response } from "express";
import { prismaClient } from "../../infra/database/prismaClient";
const bcrypt = require("bcryptjs");

export class VerifyTokenUseCase {
	async compareToken(tokenHash: string, token: string) {
		// Compara o token fornecido com o token armazenado
		const response = await bcrypt.compare(token, tokenHash);
		if (response) {
			return true; // Retorna true se os tokens coincidirem
		}
		return false; // Retorna false se os tokens não coincidirem
	}

	async verifyToken(email: string, user_token: string, response: Response) {
		// Procura o token do usuário com base no endereço de e-mail fornecido
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
				// Redireciona para uma página de token expirado se o e-mail já estiver verificado
				return response.redirect("https://bfanet.vercel.app/expired-token");
			}
			if (await bcrypt.compare(user_token, token.token || "")) {
				// Se os tokens coincidirem, atualiza o status do e-mail para verificado e remove o token
				await prismaClient.client_email.update({
					where: { email_id: token.email_id },
					data: {
						verified: true,
						token: "",
					},
				});
				// Limpa os dados do cliente associados ao e-mail verificado
				const client_email = await prismaClient.client_email.findFirst({where: {email_address: email}, select: {complete: true, client_id: true}})
				const client = await prismaClient.client.findFirst({where: {client_id: client_email?.client_id || 0}})
				if (client) {
					if (!client_email?.complete) {
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
					}
					return response.redirect("https://bfanet.vercel.app/verified-token");
				}
				return response.redirect("https://bfanet.vercel.app/verified-token");
			}
			// Redireciona para uma página de token expirado se os tokens não coincidirem
			return response.redirect("https://bfanet.vercel.app/expired-token");
		}

		// Redireciona para uma página de token expirado se o token não for encontrado
		return response.redirect("https://bfanet.vercel.app/expired-token");
	}

	execute(response: Response, request: Request) {
		const email = request.params.email;
		const token = request.params.token;
		this.verifyToken(email, token, response);
	}
}

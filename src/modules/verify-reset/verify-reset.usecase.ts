import crypto from "crypto";
import { Request, Response } from "express";
import { prismaClient } from "../../infra/database/prismaClient";
const bcrypt = require("bcryptjs");
const sendMail = require("../../libs/sendEmail");

export class VerifyResetUseCase {
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
				client_id: true,
			}
		});
		// Encontra o token armazenado no banco de dados
		const client = await prismaClient.client.findFirst({
			where: { client_id: token?.client_id || 0 },
			select: { token: true },
		});

		if (client) {
			if (client.token === "") {
				// Redireciona para uma página de token expirado se não houver token armazenado
				return response.redirect("http://localhost:3000/expired-token");
			}

			if (await bcrypt.compare(user_token, client.token || "")) {
				// Se os tokens coincidirem, atualiza o token armazenado para vazio e redireciona para uma página para definir novas credenciais
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

			// Redireciona para uma página de token expirado se os tokens não coincidirem
			return response.redirect("http://localhost:3000/expired-token");
		}

		// Redireciona para uma página de token expirado se não encontrar o usuário
		return response.redirect("http://localhost:3000/expired-token");
	}

	async execute(request: Request, response: Response) {
		const email = request.params.email;
		const token = request.params.token;
		await this.verifyToken(email, token, response);
	}
}

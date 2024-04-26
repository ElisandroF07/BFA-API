import crypto from "crypto";
import { Request, Response } from "express";
import { prismaClient } from "../../infra/database/prismaClient";
const sendMail = require("../../libs/sendEmail");
const bcrypt = require("bcryptjs");

export class ResendEmailUseCase {
	// Função para gerar um hash a partir de um token
	async encrypt(token: string): Promise<string> {
		const salt = await bcrypt.genSalt(12);
		const tokenHash = await bcrypt.hash(token, salt);
		return tokenHash;
	}

	// Função para reenviar o email de verificação
	async sendToken(email: string, response: Response) {
		// Busca o registro de email no banco de dados
		const res = await prismaClient.client_email.findFirst({
			where: { email_address: email },
			select: { verified: true, email_id: true, token: true }
		});
		if (res) {
			// Verifica se o email já foi verificado
			if (res.verified) {
				return response
					.status(200)
					.json({ message: "O email já foi verificado!" });
			}

			try {
				// Gera um novo token e cria um hash
				const token = crypto.randomBytes(32).toString("hex");
				const tokenHash = await this.encrypt(token);
				// Atualiza o token no banco de dados
				await prismaClient.client_email.update({
					where: { email_id: res.email_id },
					data: {
						token: tokenHash,
					},
				});
				// Monta a URL de verificação com o novo token e envia o email
				const url = `${process.env.BASE_URL}/email/${email}/verify/${token}`;
				await sendMail(email, "Confirmar Email", url);
				response
					.status(201)
					.json({ message: `Email reenviado para o endereço: ${email}` });
			} catch {
				return response
					.status(500)
					.json({ message: "Erro interno! Tente mais tarde." });
			}
		} else {
			return response
				.status(200)
				.json({ message: "Endereço de email inválido!" });
		}
	}

	// Função executada ao chamar o caso de uso
	execute(response: Response, request: Request) {
		const email = request.params.email;
		this.sendToken(email, response);
	}
}

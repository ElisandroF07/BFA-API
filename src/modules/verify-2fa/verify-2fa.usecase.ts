import { Request, Response } from "express";
import { prismaClient } from "../../infra/database/prismaClient";
const bcrypt = require("bcryptjs");
import jwt from "jsonwebtoken";

export class Verify2FAUseCase {

	// Método para comparar o OTP fornecido com o hash na base de dados
	async compareOTP(OTP: string, OTPHash: string) {
		const response = await bcrypt.compare(OTP, OTPHash);
		if (response) {
			return true;
		}
		return false;
	}

	// Método para verificar o OTP e gerar o token de autenticação JWT
	async verifyOTP(email: string, user_OTP: string, response: Response) {
		try {
			// Procura o cliente pelo email
			const client_email = await prismaClient.client_email.findFirst({
				where: {
					email_address: email,
				},
				select: {
					client_id: true,
				}
			});
			// Procura o cliente pelo ID encontrado no passo anterior
			const client = await prismaClient.client.findFirst({
				where: { client_id: client_email?.client_id || 0 },
				select: {
					authentication_otp: true,
					client_id: true,
					address: true,
					personal_data: true,
					bi_number: true,
				}
			});
			if (client) {
				// Compara o OTP fornecido com o OTP armazenado na base de dados
				if (await this.compareOTP(user_OTP, client.authentication_otp || "")) {
					// Atualiza o OTP na base de dados para vazio, indicando que foi utilizado
					await prismaClient.client.update({
						where: { client_id: client.client_id || 0 },
						data: { authentication_otp: "" },
					});
					// Gera o token de autenticação JWT
					const secret = process.env.SECRET || "";
					const token = jwt.sign(
						{
							id: client.client_id,
						},
						secret,
					);
					// Obtém o caminho da imagem de perfil do cliente
					const pictureProfile = await prismaClient.client_images.findFirst({
						where: {client_id: client.client_id, image_role: 5}, select: {path: true}
					})
					// Retorna a resposta com o token e os dados do usuário
					response.status(201).json({success: true, token, user: {biNumber: client.bi_number, email}})
				} else {
					// Retorna uma mensagem de erro se o OTP for inválido
					return response.status(200).json({message: "Código de autenticação inválido!"})
				};
			} else {
				// Retorna uma mensagem de erro se o email não estiver associado a nenhum cliente
				return response.status(200).json({message: "Endereço de email inválido!"});
			}
		} catch {
			// Retorna uma mensagem de erro genérica em caso de exceção
			response
				.status(500)
				.json({ message: "Erro interno! Tente novamente mais tarde." });
		}
	}

	// Método para executar a verificação do OTP
	execute(response: Response, request: Request) {
		const email = request.body.email;
		const OTP = request.body.OTP;
		this.verifyOTP(email, OTP, response);
	}
}
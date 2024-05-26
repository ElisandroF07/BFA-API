import { Request, Response } from "express";
import { prismaClient } from "../../infra/database/prismaClient";
const sendOTP = require("../../libs/sendOTP");
const bcrypt = require("bcryptjs");

export class TwoFactorAuthUseCase {
	// Método para encriptar o OTP
	async encrypt(OTP: string): Promise<string> {
		const salt = await bcrypt.genSalt(12);
		const OTPHash = await bcrypt.hash(OTP, salt);
		return OTPHash;
	}

	// Método para gerar um OTP de 6 dígitos
	generateOTP(): number {
		return Math.floor(Math.random() * 900000) + 100000;
	}

	// Método para enviar o token de autenticação de dois fatores
	async sendToken(membership_number: string, response: Response) {
		try {
			// Verifica se o membership_number é um email
			if (membership_number.includes("@")) {
				// Encontra o cliente pelo email na base de dados
				const client_email = await prismaClient.client_email.findFirst({
					where: { email_address: membership_number },
					select: { client_id: true },
					cacheStrategy: { ttl: 3600 }
				});
				if (client_email) {
					// Gera um OTP e encripta
					const OTP = this.generateOTP();
					const OTPHash = await this.encrypt(OTP.toString());
					// Atualiza o OTP do cliente na base de dados
					await prismaClient.client.update({
						where: { client_id: client_email?.client_id || 0 },
						data: { authentication_otp: OTPHash },
					});
					// Envia o OTP para o email do cliente
					sendOTP(membership_number, "Autenticação de dois fatores", OTP);
					response
						.status(201)
						.json({ message: "Email enviado para a sua caixa de entrada." });
				} else {
					response.status(200).json({ message: "Email inválido!" });
				}
			} else {
				// Encontra o cliente pelo número de adesão na base de dados
				const idCLIENT = await prismaClient.client.findFirst({
					where: { membership_number: membership_number },
					select: { client_id: true },
					cacheStrategy: { ttl: 3600 }
				});
				const idEMAIL = await prismaClient.client_email.findFirst({
					where: { client_id: idCLIENT?.client_id || 0 },
					select: { email_address: true },
					cacheStrategy: { ttl: 3600 }
				});
				if (idCLIENT) {
					// Gera um OTP e encripta
					const OTP = this.generateOTP();
					const OTPHash = await this.encrypt(OTP.toString());
					// Atualiza o OTP do cliente na base de dados
					await prismaClient.client.update({
						where: { client_id: idCLIENT?.client_id || 0 },
						data: { authentication_otp: OTPHash },
					});
					// Envia o OTP para o email do cliente
					sendOTP(idEMAIL?.email_address, "Autenticação de dois fatores", OTP);
					response
						.status(201)
						.json({ message: "Email enviado para a sua caixa de entrada." });
				} else {
					response.status(200).json({ message: "Número de adesão inválido!" });
				}
			}
		} catch {
			response
				.status(500)
				.json({ message: "Ocorreu um erro ao processar a sua solicitação! Tente novamente mais tarde." });
		}
	}

	// Método para executar a ação de enviar o token
	execute(response: Response, request: Request) {
		const membership_number = request.params.membership_number;
		this.sendToken(membership_number, response);
	}
}

import { Request, Response } from "express";
import { prismaClient } from "../../infra/database/prismaClient";
const sendOTP = require("../../libs/sendOTP"); // Importa a função sendOTP do arquivo sendOTP.js
const bcrypt = require("bcryptjs");

export class SendOTPUseCase {

	async encrypt(OTP: string): Promise<string> {
		const salt = await bcrypt.genSalt(12);
		const OTPHash = await bcrypt.hash(OTP, salt);
		return OTPHash;
	}

	// Gera um número de seis dígitos para ser utilizado como OTP
	generateOTP():number{
		return Math.floor(Math.random() * 900000) + 100000
	}

	async sendToken(email: string, biNumber: string, response: Response) {
		try {
			// Verifica se o número de BI é válido
			const client = await prismaClient.client.findFirst({where: {bi_number: biNumber}, select: {client_id: true}})
			if (client) {
				// Gera e encripta um novo OTP
				const OTP = this.generateOTP();
				const OTPHash = await this.encrypt(OTP.toString());
				// Atualiza o OTP na tabela do cliente
				await prismaClient.client.update({where: {client_id: client.client_id}, data: {authentication_otp: OTPHash}})
				// Envia o OTP por email
				sendOTP(email, "Autenticação de dois fatores", OTP);
				return response.status(201).json({ message: "Foi enviado para a sua caixa de entrada o código de verificação!" });
			}
			return response.status(200).json({ message: "Número de BI inválido!" });
			
		} catch {
			return response
				.status(500)
				.json({ message: "Ocorreu um erro ao processar a sua solicitação! Tente novamente mais tarde." });
		}
	}

	// Executa a função sendToken com os parâmetros recebidos
	execute(request: Request, response: Response) {
		const biNumber = request.params.biNumber;
		const email = request.params.email
		this.sendToken(email, biNumber, response);
	}
}

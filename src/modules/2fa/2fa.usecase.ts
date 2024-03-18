import { Request, Response } from "express";
import { prismaClient } from "../../infra/database/prismaClient";
const sendOTP = require("../../libs/sendOTP");
const bcrypt = require("bcryptjs");

export class TwoFactorAuthUseCase {

	async encrypt(OTP: string): Promise<string> {
		const salt = await bcrypt.genSalt(12);
		const OTPHash = await bcrypt.hash(OTP, salt);
		return OTPHash;
	}

	generateOTP():number{
		return Math.floor(Math.random() * 900000) + 100000
	}

	async sendToken(membership_number: string, response: Response) {
		try {
			const idCLIENT = await prismaClient.client.findFirst({
				where: { membership_number: membership_number },
				select: { client_id: true },
			});
			const idEMAIL = await prismaClient.client_email.findFirst({
				where: { client_id: idCLIENT?.client_id || 0 },
				select: { email_address: true },
			});
			if (idCLIENT) {
				const OTP = this.generateOTP();
				const OTPHash = await this.encrypt(OTP.toString());
				await prismaClient.client.update({
					where: { client_id: idCLIENT?.client_id || 0 },
					data: {
						authentication_otp: OTPHash
					},
				});
				sendOTP(idEMAIL?.email_address, "Autenticação de dois fatores", OTP);
				
				response
					.status(201)
					.json({ message: "Email enviado para a sua caixa de entrada." });
			} else {
				response.status(200).json({ message: "Número de adesão inválido!" });
			}
		} catch {
			response
				.status(500)
				.json({ message: "Ocorreu um erro ao processar a sua solicitação! Tente novamente mais tarde." });
		}
	}

	execute(response: Response, request: Request) {
		const membership_number = request.params.membership_number;
		this.sendToken(membership_number, response);
	}
}

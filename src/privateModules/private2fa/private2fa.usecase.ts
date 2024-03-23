import { Request, Response } from "express";
import { prismaClient } from "../../infra/database/prismaClient";
const sendOTP = require("../../libs/sendOTP");
const bcrypt = require("bcryptjs");

export class PrivateTwoFactorAuthUseCase {

	async encrypt(OTP: string): Promise<string> {
		const salt = await bcrypt.genSalt(12);
		const OTPHash = await bcrypt.hash(OTP, salt);
		return OTPHash;
	}

	generateOTP():number{
		return Math.floor(Math.random() * 900000) + 100000
	}

	async sendToken(email: string, biNumber: string, response: Response) {
		try {
			const client_email = await prismaClient.client_email.findFirst({where: {email_address: email}, select: {client_id: true}})
			if (client_email) {
				return response.json({message: "Este email já está associado à uma conta! Tente outro."})
			}
			const client = await prismaClient.client.findFirst({where: {bi_number: biNumber}, select: {client_id: true}})
			if (client) {
				const OTP = this.generateOTP();
				const OTPHash = await this.encrypt(OTP.toString());
				await prismaClient.client.update({where: {client_id: client.client_id}, data: {authentication_otp: OTPHash}})
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

	execute(response: Response, request: Request) {
		const biNumber = request.params.biNumber;
		const email = request.params.email
		this.sendToken(email, biNumber, response);
	}
}

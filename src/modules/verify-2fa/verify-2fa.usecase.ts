import { Request, Response } from "express";
import { prismaClient } from "../../infra/database/prismaClient";
const bcrypt = require("bcryptjs");
import jwt from "jsonwebtoken";

export class Verify2FAUseCase {

	async compareOTP(OTP: string, OTPHash: string,) {
		const response = await bcrypt.compare(OTP, OTPHash);
		if (response) {
			return true;
		}
		return false;
	}

	async verifyOTP(email: string, user_OTP: string, response: Response) {
		try {
			const client_email = await prismaClient.client_email.findFirst({
				where: {
					email_address: email,
				},
				select: {
					client_id: true,
				}
			});
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
				if (await this.compareOTP(user_OTP, client.authentication_otp || "")) {
					await prismaClient.client.update({
						where: { client_id: client.client_id || 0 },
						data: { authentication_otp: "" },
					});
					const secret = process.env.SECRET || "";
					const token = jwt.sign(
						{
							id: client.client_id,
						},
						secret,
					);
					const pictureProfile = await prismaClient.client_images.findFirst({
						where: {client_id: client.client_id, image_role: 5}, select: {path: true}
					})
					response.status(201).json({message: "Autenticação concluida!", token, user: {personalData: client.personal_data, address: client.address, biNumber: client.bi_number, email: email, pictureProfilePath: pictureProfile?.path}})
				} else {
					return response.status(200).json({message: "Código de autenticação inválido!"})
				};
			} else {
				return response.status(200).json({message: "Endereço de emial inválido!"});
			}
		} catch {
			response
				.status(500)
				.json({ message: "Erro interno! Tente novamente mais tarde." });
		}
	}

	execute(response: Response, request: Request) {
		const email = request.body.email;
		const OTP = request.body.OTP;
		this.verifyOTP(email, OTP, response);
	}
}

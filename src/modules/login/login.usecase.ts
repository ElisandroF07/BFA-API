import { Response } from "express";
import { prismaClient } from "../../infra/database/prismaClient";
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

export class LoginUseCase {
	async login(membership: string, access_code: string, response: Response) {
		if (membership.includes("@")) {
			const client_email = await prismaClient.client_email.findFirst({where: {email_address: membership.toLowerCase()}, select: {client_id: true}})
			const client = await prismaClient.client.findFirst({
				where: {
					client_id: client_email?.client_id || 0,
				},
				select: {
					access_code: true,
					client_id: true,
					membership_number: true,
					bi_number: true,
					personal_data: true,
					professional_data: true,
					address: true,
					role_id: true,
				}
			});
			if (client) {
				if (await bcrypt.compare(access_code, client.access_code)) {
					return response.status(201).json({ message: "Sucesso!", email: membership, membership_number: client.membership_number});
				}
				return response
					.status(200)
					.json({ message: "Código de acesso incorreto!" });
			}
	
			return response
				.status(200)
				.json({ message: "Email não encontrado!" });
		}
		const client = await prismaClient.client.findFirst({
			where: {
				membership_number: membership,
			},
			select: {
				access_code: true,
				client_id: true,
				membership_number: true,
				bi_number: true,
				personal_data: true,
				professional_data: true,
				address: true,
				role_id: true,
			}
		});
		if (client) {
			const email = await prismaClient.client_email.findFirst({where: {client_id: client.client_id}, select: {email_address: true}})

			if (await bcrypt.compare(access_code, client.access_code)) {
				return response.status(201).json({ message: "Sucesso!", email: email?.email_address, membership_number: membership});
			}
			return response
				.status(200)
				.json({ message: "Código de acesso incorreto!" });
		}

		return response
			.status(200)
			.json({ message: "Número de adesão não encontrado!" });
	}

	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	async execute(data: any, response: Response) {
		const { membership_number, access_code } = data;
		await this.login(membership_number, access_code, response);
	}
}

import { Request, Response } from "express";
import { prismaClient } from "../../infra/database/prismaClient";
const bcrypt = require("bcryptjs");
const sendCredentials = require("../../libs/sendCredentials");

export class GenerateCredentialsUseCase {
	async encrypt(pin: string) {
		const salt = await bcrypt.genSalt(12);
		const OTPHash = await bcrypt.hash(pin, salt);
		return OTPHash;
	}

	createIBAN(): string {
		const numeroAleatorio = Math.floor(Math.random() * 100000000000000);
		const numeroFormatado = numeroAleatorio.toString().padStart(15, "0");
		return `AO06004000${numeroFormatado}`;
	}

	createAccountNumber(): string {
		const numerosAleatorios = Array.from({ length: 9 }, () =>
			Math.floor(Math.random() * 10),
		).join("");
		return `${numerosAleatorios}.10.001`;
	}

	createCardNumber(): number {
		let numero = "";
		for (let i = 0; i < 16; i++) {
			numero += Math.floor(Math.random() * 10).toString(); // Gera um dígito aleatório de 0 a 9 e concatena à string
		}
		return parseInt(numero, 10); // Converte a string para um número inteiro
	}

	generatePin(): number {
		return Math.floor(Math.random() * 9000) + 1000; // Gera um número aleatório entre 1000 e 9999
	}

	createMembershipNumber(): number {
		let numero = "";
		for (let i = 0; i < 8; i++) {
			numero += Math.floor(Math.random() * 10).toString(); // Gera um dígito aleatório de 0 a 9 e concatena à string
		}
		return parseInt(numero, 10); // Converte a string para um número inteiro
	}

	createAccessCode(): number {
		let numero = "";
		for (let i = 0; i < 6; i++) {
			numero += Math.floor(Math.random() * 10).toString(); // Gera um dígito aleatório de 0 a 9 e concatena à string
		}
		return parseInt(numero, 10); // Converte a string para um número inteiro
	}

	async generateCredentials(email: string, response: Response) {
		try {
			const membership_number = this.createMembershipNumber();
			const accessCode = this.createAccessCode();
			const accessCodeHash = await this.encrypt(accessCode.toString());

			const client = await prismaClient.client_email.findFirst({
				where: { email_address: email },
				select: { client_id: true },
			});
			const verify = await prismaClient.account.findFirst({
				where: { client_id: client?.client_id || 0 },
			});
			if (verify) {
				return response
					.status(200)
					.json({ message: "Este email já está associado à uma conta." });
			}
			await prismaClient.client.update({
				where: { client_id: client?.client_id || 0 },
				data: {
					membership_number: membership_number.toString(),
					access_code: accessCodeHash,
				},
			});
			const emailID = await prismaClient.client_email.findFirst({where: {client_id: client?.client_id || 0}, select: {email_id: true}})
			await prismaClient.client_email.update({where: {email_id: emailID?.email_id || 0}, data: {complete: true}})
			const account = await prismaClient.account.create({
				data: {
					client_id: client?.client_id,
					account_number: this.createAccountNumber(),
					account_iban: this.createIBAN(),
					account_nbi: this.createIBAN(),
					currency: 'Kwanza (KZ)',
					authorized_balance: 0.00,
					available_balance: 0.00,
					account_role: 1,
					bic: "BFMAXLOU",
					state: "Ativa",
					created_at: Date.now().toString(),
				},
			});

			const pin = this.generatePin();
			const pinHash = await this.encrypt(pin.toString());
			const card = await prismaClient.card.create({
				data: {
					number: this.createCardNumber(),
					account_id: account.account_id,
					role_id: 1,
					pin: pinHash,
					created_at: Date.now().toString(),
				},
			});
			await sendCredentials(
				email,
				"Credenciais",
				account.account_number,
				account.account_iban,
				card.number,
				Date.UTC,
				membership_number,
				accessCode,
				pin,
			);
			return response.status(201).json({
				message: "As suas credenciais já foram enviadas para o seu email!",
			});
		} catch (err) {
			return response.status(200).json({
				message: `Erro ao processar solicitação! Tente novamente mais tarde.${err}`,
			});
		}
	}

	async execute(request: Request, response: Response) {
		const email = request.params.email;
		await this.generateCredentials(email, response);
	}
}

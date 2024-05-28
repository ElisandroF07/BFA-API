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
		// Gera um número aleatório formatado para IBAN
		const numeroAleatorio = Math.floor(Math.random() * 10000000000000);
		const numeroFormatado = numeroAleatorio.toString().padStart(17, "0");
		return `AO060006${numeroFormatado}`;
	}

	createAccountNumber(): string {
		// Gera um número aleatório formatado para número da conta
		const numerosAleatorios = Array.from({ length: 9 }, () =>
			Math.floor(Math.random() * 10),
		).join("");
		return `${numerosAleatorios}.30.001`;
	}

	createCardNumber(): number {
		// Gera um número de cartão de crédito aleatório
		let numero = "";
		for (let i = 0; i < 16; i++) {
			numero += Math.floor(Math.random() * 10).toString();
		}
		return parseInt(numero, 10);
	}

	generatePin(): number {
		// Gera um PIN de 4 dígitos
		return Math.floor(Math.random() * 9000) + 1000;
	}

	createMembershipNumber(): number {
		// Gera um número de membro aleatório
		let numero = "";
		for (let i = 0; i < 8; i++) {
			numero += Math.floor(Math.random() * 10).toString();
		}
		return parseInt(numero, 10);
	}

	createAccessCode(): number {
		// Gera um código de acesso de 6 dígitos
		let numero = "";
		for (let i = 0; i < 6; i++) {
			numero += Math.floor(Math.random() * 10).toString();
		}
		return parseInt(numero, 10);
	}

	async generateCredentials(email: string, account_type: string, area: string, local: string, response: Response) {
		try {
			// Gera um número de membro e um código de acesso
			const membership_number = this.createMembershipNumber();
			const accessCode = this.createAccessCode();
			const accessCodeHash = await this.encrypt(accessCode.toString());

			// Encontra o cliente com base no email
			const client = await prismaClient.client_email.findFirst({
				where: { email_address: email },
				select: { client_id: true }
			});
			// Atualiza o número de membro e o código de acesso do cliente
			await prismaClient.client.update({
				where: { client_id: client?.client_id || 0 },
				data: {
					membership_number: membership_number.toString(),
					access_code: accessCodeHash,
				},
			});
			// Atualiza o email para marcá-lo como completo e verificado
			const emailID = await prismaClient.client_email.findFirst({where: {client_id: client?.client_id || 0}, select: {email_id: true}})
			await prismaClient.client_email.update({where: {email_id: emailID?.email_id || 0}, data: {complete: true, verified: true}})
			// Cria uma nova conta para o cliente
			const iban = this.createIBAN()
			const account = await prismaClient.account.create({
				data: {
					client_id: client?.client_id,
					account_number: this.createAccountNumber(),
					account_iban: iban,
					account_nbi: iban.replace('AO06', ''),
					currency: 'Kwanza (KZ)',
					authorized_balance: 20000.000,
					available_balance: 20000.000,
					up_balance: 0.00,
					account_role: account_type === "c1" ? 1 : 2,
					bic: "BFMAXLOU",
					state: "Inatíva",
					created_at: Date.now().toString(),
					local: local,
					area: area
				},
			});

			// Gera um PIN para o cartão
			const pin = this.generatePin();
			const pinHash = await this.encrypt(pin.toString());
			// Cria um novo cartão para o cliente
			const card = await prismaClient.card.create({
				data: {
					number: this.createCardNumber(),
					account_id: account.account_id,
					role_id: 1,
					pin: pinHash,
					created_at: Date.now().toString(),
					state: "Ativo"
				},
			});
			// Envia as credenciais para o cliente por email
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
			// Retorna um erro se houver algum problema durante o processo
			return response.status(200).json({
				message: `Erro ao processar solicitação! Tente novamente mais tarde. ${err}`,
			});
		}
	}

	// Método principal que executa a lógica do caso de uso
	async execute(request: Request, response: Response) {
		const email = request.params.email;
		const account_type = request.params.accountType;
		const local = request.params.local;
		const area = request.params.area;
		await this.generateCredentials(email, account_type, area, local, response);
	}
}

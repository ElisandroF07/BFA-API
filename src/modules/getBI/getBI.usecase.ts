import { parse } from "date-fns";
import { Request, Response } from "express";
import { prismaClient } from "../../infra/database/prismaClient";

export class GetBIUseCase {
	async getBi(request: Request, response: Response, email: string) {
		// Encontra o cliente com base no endereço de email fornecido
		const client_email = await prismaClient.client_email.findFirst({
			where: {
				email_address: email,
			},
			select: {
				client_id: true,
			},
		});
		// Encontra o número do BI associado ao cliente encontrado
		const client = await prismaClient.client.findFirst({
			where: {
				client_id: client_email?.client_id || 0,
			},
			select: {
				bi_number: true,
			}
		});
		// Retorna o número do BI encontrado ou null se não for encontrado
		return response.status(200).json({ biNumber: client?.bi_number });
	}

	async execute(request: Request, response: Response) {
		const email = request.params.email;
		// Chama a função getBi para encontrar o número do BI e retorna a resposta
		await this.getBi(request, response, email);
	}
}

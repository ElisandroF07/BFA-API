import { parse } from "date-fns";
import { Request, Response } from "express";
import { prismaClient } from "../../infra/database/prismaClient";

export class GetBIUseCase {
	async getBi(request: Request, response: Response, email: string) {
		const client_email = await prismaClient.client_email.findFirst({
			where: {
				email_address: email,
			},
			select: {
				client_id: true,
			},
		});
		const client = await prismaClient.client.findFirst({
			where: {
				client_id: client_email?.client_id || 0,
			},
			select: {
				bi_number: true,
			}
		});
		return response.status(200).json({ biNumber: client?.bi_number });
	}

	async execute(request: Request, response: Response) {
		const email = request.params.email;
		await this.getBi(request, response, email);
	}
}

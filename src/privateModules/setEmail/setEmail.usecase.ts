import { Request, Response } from "express";
import { prismaClient } from "../../infra/database/prismaClient";
const SendNoteEmail = require("../../libs/sendNoteEmail");

export class SetEmailUseCase {

	async setEmail(email: string, biNumber: string, response: Response) {
		try {
			// Procura o cliente pelo número de BI
			const client  = await prismaClient.client.findFirst({where: {bi_number: biNumber}, select: {client_id: true}});
      // Procura o email do cliente pelo ID do cliente
      const client_email = await prismaClient.client_email.findFirst({where: {client_id: client?.client_id||0}, select: {email_id: true}});
      // Atualiza o email do cliente
      await prismaClient.client_email.update({where: {email_id: client_email?.email_id||0}, data: {email_address: email}});
      // Envia uma nota por email sobre a alteração do email
      SendNoteEmail(email, "Alteração do email");
      return response.status(201).json({message: "Email alterado com sucesso!"});		
		} catch {
			return response
				.status(500)
				.json({ message: "Ocorreu um erro ao processar a sua solicitação! Tente novamente mais tarde." });
		}
	}

	execute(request: Request, response: Response) {
		const biNumber = request.params.biNumber;
		const email = request.params.email;
		this.setEmail(email, biNumber, response);
	}
}

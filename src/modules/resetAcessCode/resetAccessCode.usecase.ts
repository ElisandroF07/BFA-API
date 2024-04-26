import { Request, Response } from "express";
import { prismaClient } from "../../infra/database/prismaClient";
const bcrypt = require("bcryptjs");
const sendNote = require("../../libs/sendNote");

export class ResetAccessCodeUseCase {
	async encrypt(token: string): Promise<string> {
		const salt = await bcrypt.genSalt(12);
		const tokenHash = await bcrypt.hash(token, salt);
		return tokenHash;
	}

	// Função para definir um novo código de acesso
	async setCode(email: string, accessCode: string, response: Response) {
    // Verifica se o código de acesso tem 6 dígitos
    if (accessCode.length < 6) {
      return response.status(200).json({message: "O código de acesso deve conter 6 dígitos!"})
    }

    // Gera um hash para o novo código de acesso
    const accessCodeHash = await this.encrypt(accessCode);

    // Atualiza o código de acesso no banco de dados
    const email_client = await prismaClient.client_email.findFirst({where: {email_address: email}, select: {client_id: true, email_id: true}})
    await prismaClient.client.update({where: {client_id: email_client?.client_id||0}, data:{access_code: accessCodeHash, first_login: false}});

    // Envia uma nota para o cliente informando sobre a alteração do código de acesso
    await sendNote(email, "Alteração do código de acesso");

    return response.status(201).json({message: "Código de acesso redefinido com sucesso!"});
  }

  // Função executada ao chamar o caso de uso
  execute(request: Request, response: Response) {
	  const email = request.body.email;
    const accessCode = request.body.accessCode;
    this.setCode(email, accessCode, response);
  }
}

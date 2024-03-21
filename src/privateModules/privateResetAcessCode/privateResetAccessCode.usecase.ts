import { Request, Response } from "express";
import { prismaClient } from "../../infra/database/prismaClient";
const bcrypt = require("bcryptjs");
const sendNote = require("../../libs/sendNote");

export class PrivateResetAccessCodeUseCase {
	async encrypt(token: string): Promise<string> {
		const salt = await bcrypt.genSalt(12);
		const tokenHash = await bcrypt.hash(token, salt);
		return tokenHash;
	}

	async setCode(email: string, accessCode: string, code: string, response: Response) {
    const email_client = await prismaClient.client_email.findFirst({where: {email_address: email}, select: {client_id: true, email_id: true}})
    const client = await prismaClient.client.findFirst({where: {client_id: email_client?.client_id || 0}, select: {access_code: true}})
    if (await bcrypt.compare(code, client?.access_code)) {
      if (accessCode.length < 6) {
        return response.status(200).json({message: "O código de acesso deve conter 6 dígitos!"})
      }
      const accessCodeHash = await this.encrypt(accessCode)
      await prismaClient.client.update({where: {client_id: email_client?.client_id||0}, data:{access_code: accessCodeHash, first_login: false}})
      //await sendNote(email, "Alteração do código de acesso");
      return response.status(201).json({message: "Código de acesso redefnido com sucesso!"})
    }
    return response.status(200).json({message: "Código de acesso atual errado!"})
    
  }

  execute(request: Request, response: Response) {
	  const email = request.body.email
    const accessCode = request.body.accessCode
    const code = request.body.code
    this.setCode(email, accessCode, code, response)
  }
}

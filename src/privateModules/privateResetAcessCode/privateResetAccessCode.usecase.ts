import { Request, Response } from "express";
import { prismaClient } from "../../infra/database/prismaClient";
const bcrypt = require("bcryptjs");
const sendNote = require("../../libs/sendNote");

export class PrivateResetAccessCodeUseCase {
  // Método para encriptar o token usando bcrypt
  async encrypt(token: string): Promise<string> {
    const salt = await bcrypt.genSalt(12);
    const tokenHash = await bcrypt.hash(token, salt);
    return tokenHash;
  }

  // Método para redefinir o código de acesso
  async setCode(email: string, accessCode: string, code: string, response: Response) {
    // Procura o cliente pelo endereço de email
    const email_client = await prismaClient.client_email.findFirst({ where: { email_address: email }, select: { client_id: true, email_id: true } });
    // Procura o cliente pelo ID encontrado no passo anterior
    const client = await prismaClient.client.findFirst({ where: { client_id: email_client?.client_id || 0 }, select: { access_code: true } });
    // Verifica se o código atual do cliente é válido
    if (await bcrypt.compare(code, client?.access_code)) {
      // Verifica se o novo código de acesso tem 6 dígitos
      if (accessCode.length < 6) {
        return response.status(200).json({ message: "O código de acesso deve conter 6 dígitos!" });
      }
      // Encripta o novo código de acesso
      const accessCodeHash = await this.encrypt(accessCode);
      // Atualiza o código de acesso e define o primeiro login como false
      await prismaClient.client.update({ where: { client_id: email_client?.client_id || 0 }, data: { access_code: accessCodeHash, first_login: false } });
      // Envie uma notificação sobre a alteração do código de acesso (comentado para evitar envios acidentais)
      // await sendNote(email, "Alteração do código de acesso");
      return response.status(201).json({ message: "Código de acesso redefinido com sucesso!" });
    }
    return response.status(200).json({ message: "Código de acesso atual errado!" });
  }

  // Método para executar a redefinição do código de acesso
  execute(request: Request, response: Response) {
    const email = request.body.email;
    const accessCode = request.body.accessCode;
    const code = request.body.code;
    this.setCode(email, accessCode, code, response);
  }
}

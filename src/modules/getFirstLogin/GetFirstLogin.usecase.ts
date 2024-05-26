import { Request, Response } from "express";
import { prismaClient } from "../../infra/database/prismaClient";

export class GetFirstLoginUseCase {
  // Método para obter o status de primeiro login do cliente com base no email
  async getLogin(email: string, response: Response) {
    // Procura o cliente pelo email na tabela client_email
    const client_email = await prismaClient.client_email.findFirst({ where: { email_address: email }, select: { client_id: true }, cacheStrategy: { ttl: 3600 } })
    // Procura o cliente na tabela client com base no client_id obtido do passo anterior
    const client = await prismaClient.client.findFirst({ where: { client_id: client_email?.client_id || 0 }, select: { first_login: true } })
    // Se o primeiro login for verdadeiro, retorna verdadeiro, caso contrário, retorna falso
    if (client?.first_login) {
      return response.status(201).json(true);
    }
    return response.status(201).json(false);
  }

  // Método para executar a obtenção do status de primeiro login
  async execute(request: Request, response: Response) {
    const email = request.params.email
    await this.getLogin(email, response);
  }
}

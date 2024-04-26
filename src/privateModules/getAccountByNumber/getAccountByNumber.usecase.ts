import {Request, Response} from "express"
import { prismaClient } from "../../infra/database/prismaClient"

// Classe responsável por obter uma conta bancária pelo número da conta
export class GetAccountByNumber {

  // Método assíncrono para obter a conta bancária
  async getAccount(accountNumber: string, response: Response) {
    // Encontra a conta bancária pelo número da conta
    const account = await prismaClient.account.findFirst({ where: { account_number: accountNumber }, select: { client_id: true } });

    // Verifica se a conta foi encontrada
    if (account) {
      // Encontra o cliente associado à conta pelo ID do cliente
      const client = await prismaClient.client.findFirst({ where: { client_id: account.client_id || 0 }, select: { personal_data: true } });

      // Retorna um objeto com a informação de que a conta existe e os dados pessoais do cliente
      return response.status(201).json({ exists: true, client: client?.personal_data });
    }

    // Retorna um objeto com a informação de que a conta não existe e sem dados pessoais do cliente
    return response.status(200).json({ exists: false, client: null });
  }

  // Método para executar a busca da conta a partir de uma requisição HTTP
  execute(request: Request, response: Response) {
    const accountNumber = request.params.accountNumber;
    this.getAccount(accountNumber, response);
  }
}

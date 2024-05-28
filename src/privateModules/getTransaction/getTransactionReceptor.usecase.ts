import { Request, Response } from "express";
import { prismaClient } from "../../infra/database/prismaClient";

// Classe responsável por obter uma transação pelo ID da transação
export class GetTransactionReceptorUseCase {

  // Método assíncrono para obter a transação
  async getTransaction(transactionId: number, response: Response) {
    // Encontra a transação pelo ID da transação
    const transaction = await prismaClient.transfers.findFirst({ where: { id: transactionId }, select: { accountFrom: true, balance: true, date: true, status: true, transfer_type: true, receptor_description: true, emissor_description: true, accountTo: true, transfer_description: true, id: true }, cacheStrategy: { ttl: 1 } });
    
    // Verifica se a transação foi encontrada
    if (transaction) {
      // Verifica se a conta de destino da transação é um IBAN (começa com "AO06")
      if (transaction?.accountFrom?.startsWith("AO06")) {
        // Encontra a conta pelo IBAN
        const account = await prismaClient.account.findFirst({
          where: {
            account_iban: transaction?.accountFrom
          },
          select: { 
            client_id: true,
          }
        });
        // Encontra o cliente associado à conta pelo ID do cliente
        const client = await prismaClient.client.findFirst({ where: { client_id: account?.client_id || 0 }, select: { personal_data: true }, cacheStrategy: { ttl: 1 } });
        // Retorna um objeto com a informação de sucesso, a transação e os dados pessoais do cliente
        return response.status(201).json({ success: true, transaction: transaction, client: client?.personal_data });
      }
        // Encontra a conta pelo número da conta
        const account = await prismaClient.account.findFirst({
          where: {
            account_number: transaction?.accountFrom
          },
          select: { 
            client_id: true,
          }
        });
        // Encontra o cliente associado à conta pelo ID do cliente
        const client = await prismaClient.client.findFirst({ where: { client_id: account?.client_id || 0 }, select: { personal_data: true }, cacheStrategy: {ttl: 1} });
        // Retorna um objeto com a informação de sucesso, a transação e os dados pessoais do cliente
        return response.status(201).json({ success: true, transaction: transaction, client: client?.personal_data });
    }
    // Retorna um objeto com a informação de que a transação não foi encontrada
    return response.status(200).json({ success: false, transaction: null });
  }

  // Método para executar a busca da transação a partir de uma requisição HTTP
  execute(request: Request, response: Response) {
    const transactionId = parseInt(request.params.transactionId);
    this.getTransaction(transactionId, response);
  }
}

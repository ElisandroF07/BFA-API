import { Request, Response } from "express";
import { prismaClient } from "../../infra/database/prismaClient";

// Classe responsável por obter todas as transações de uma conta
export class GetTransactionsUseCase {

  // Método assíncrono para obter as transações
  async getTransactions(accountNumber: string, response: Response) {
    // Encontra todas as transações associadas ao número da conta
    const account = await prismaClient.account.findFirst({where: {account_number: accountNumber}, select: {account_iban: true}})
    const transactions = await prismaClient.transfers.findMany({
      where: {
        OR: [
          { accountFrom: accountNumber },
          { accountTo: accountNumber },
          { accountFrom: account?.account_iban },
          { accountTo: account?.account_iban },
        ]
      },
      select: {
        accountFrom: true,
        accountTo: true,
        balance: true,
        date: true,
        status: true,
        transfer_type: true,
        receptor_description: true,
        transfer_description: true,
        id: true
      }
    });
    
    
    // Verifica se foram encontradas transações
    if (transactions) {
      // Retorna um objeto com a informação de sucesso e a lista de transações
      return response.status(201).json({ success: true, transactions: transactions });
    }
    // Retorna um objeto com a informação de que não foram encontradas transações
    return response.status(200).json({ success: false, transactions: null });
  }

  // Método para executar a busca das transações a partir de uma requisição HTTP
  execute(request: Request, response: Response) {
    const accountNumber = request.params.accountNumber;
    this.getTransactions(accountNumber, response);
  }
}

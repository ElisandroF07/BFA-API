import { Request, Response } from "express";
import { prismaClient } from "../../infra/database/prismaClient";

export class GetTransactionsUseCase {

  async getTransactions(accountNumber: string, response: Response) {
    const transactions = await prismaClient.transfers.findMany({where:{accountFrom: accountNumber} , select: {accountTo: true, balance: true, date: true, status: true, transfer_type: true, receptor_description: true, transfer_description: true, id: true}})
    if (transactions) {
      return response.status(201).json({success: true, transactions: transactions})
    }
    return response.status(200).json({success: false, transactions: null})

  }

  execute(request: Request, response: Response) {
    const accountNumber = request.params.accountNumber
    this.getTransactions(accountNumber, response)
  }
}
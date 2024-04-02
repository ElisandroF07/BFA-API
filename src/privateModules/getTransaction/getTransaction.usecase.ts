import { Request, Response } from "express";
import { prismaClient } from "../../infra/database/prismaClient";

export class GetTransactionUseCase {

  async getTransaction(transactionId: number, response: Response) {
    const transaction = await prismaClient.transfers.findFirst({where:{id: transactionId} , select: {accountTo: true, balance: true, date: true, status: true, transfer_type: true, receptor_description: true, transfer_description: true, id: true}})
    
    if (transaction) {
      if (transaction?.accountTo?.includes("AO06")) {
        const account = await prismaClient.account.findFirst({
          where: {
           account_iban : transaction?.accountTo
          },
          select: { 
            client_id: true,
          }
        })
        const client = await prismaClient.client.findFirst({where: {client_id: account?.client_id || 0}, select: {personal_data: true}})
        return response.status(201).json({success: true, transaction: transaction, client: client?.personal_data})
      }
      const account = await prismaClient.account.findFirst({
        where: {
         account_number : transaction?.accountTo
        },
        select: { 
          client_id: true,
        }
      })
      const client = await prismaClient.client.findFirst({where: {client_id: account?.client_id || 0}, select: {personal_data: true}})
      return response.status(201).json({success: true, transaction: transaction, client: client?.personal_data})
      
    }
    return response.status(200).json({success: false, transaction: null})
  }

  execute(request: Request, response: Response) {
    const transactionId = parseInt(request.params.transactionId)
    this.getTransaction(transactionId, response)
  }
}
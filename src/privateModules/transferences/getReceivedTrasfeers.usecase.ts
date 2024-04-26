import {Request, Response} from "express"
import { prismaClient } from "../../infra/database/prismaClient"

export class GetReceivedTransfersUseCase {

  async get(accountNumber: string, accountIban: string, response: Response) {
    try {
      const data = await prismaClient.transfers.findMany({
        where: {
          accountTo: {
            in: [accountNumber, accountIban]
          },
          type: {
            in: [1, 2]
          }
        },
        select: {
          balance: true,
          accountTo: true,
          date: true,
          status: true,
          type: true,
          id: true
        }
      });
      return response.status(200).json({success: true, data: data})
    }
    catch {
      return response.status(200).json({success: false, data: null})
    }
  }

  execute (request: Request, response: Response) {
    const accountNumber: string = request.params.accountNumber
    const accountIban: string = request.params.accountIban
    this.get(accountNumber, accountIban, response)
  }
}
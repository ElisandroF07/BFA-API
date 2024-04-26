import {Request, Response} from "express"
import { prismaClient } from "../../infra/database/prismaClient"

export class GetSendedTransfersUseCase {

  async get(accountNumber: string, response: Response) {
    try {
      const data = await prismaClient.transfers.findMany({where: {accountFrom: accountNumber, type: 1 || 2}, select: {balance: true, accountTo: true, date: true, status: true, type: true, id: true}})
      return response.status(200).json({success: true, data: data})
    }
    catch {
      return response.status(200).json({success: false, data: null})
    }
  }

  execute (request: Request, response: Response) {
    const accountNumber: string = request.params.accountNumber
    this.get(accountNumber, response)
  }
}
import {Request, Response} from "express"
import { prismaClient } from "../../infra/database/prismaClient"

export class GetAccountByNumber {

  async getAccount(accountNumber: string, response: Response) {
    const account = await prismaClient.account.findFirst({where: {account_number: accountNumber}, select: {client_id: true}})
    if (account) {
      const client = await prismaClient.client.findFirst({where: {client_id: account.client_id || 0}, select: {personal_data: true}})
      return response.status(201).json({exists: true, client: client?.personal_data})
    }
    return response.status(200).json({exists: false, client: null})
  }

  execute(request: Request, response: Response) {
    const accountNumber = request.params.accountNumber
    this.getAccount(accountNumber, response) 
  }
}
import {Request, Response} from "express"
import { prismaClient } from "../../infra/database/prismaClient"
export class GetReferencesUseCase {

  async get(accountNumber: string, response: Response) {
    const references = await prismaClient.pay_references.findMany({where: {entity: accountNumber}})
    return response.status(200).json({success: true, references})
  }

  execute(request: Request, response: Response) {
    const accountNumber = request.params.accountNumber
    this.get(accountNumber, response)
  }
}
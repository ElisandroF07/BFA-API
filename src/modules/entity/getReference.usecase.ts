import {Request, Response} from "express"
import { prismaClient } from "../../infra/database/prismaClient"
export class GetReferenceUseCase {

  async get(id: number, response: Response) {
    const reference = await prismaClient.pay_references.findFirst({where: {id: id}})
    return response.status(200).json({success: true, reference})
  }

  execute(request: Request, response: Response) {
    const id = request.params.id
    this.get(parseInt(id), response)
  }
}
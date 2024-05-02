import {Request, Response} from "express"
import { prismaClient } from "../../infra/database/prismaClient"

export class CancelReferenceUseCase {

  async get(id: number, response: Response) {
    const reference = await prismaClient.pay_references.delete({where: {id: id}, select: {entity: true}})
    const references = await prismaClient.pay_references.findMany({where: {entity: reference.entity}}) 
    return response.status(200).json({success: true, references })
  }

  execute(request: Request, response: Response) {
    const id = request.params.id
    this.get(parseInt(id), response)
  }
}
import {Request, Response} from "express"
import { prismaClient } from "../../infra/database/prismaClient"
export class GetReference2UseCase {

  async get(ref: string, response: Response) {
    const reference = await prismaClient.pay_references.findFirst({where: {reference: ref}})
    if (reference) {
      return response.status(200).json({success: true, reference})
    }
    else {
      return response.status(200).json({success: false, reference})
    }
  }

  execute(request: Request, response: Response) {
    const reference = request.params.reference
    this.get(reference, response)
  }
}
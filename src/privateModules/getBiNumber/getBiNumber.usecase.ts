import { Request, Response } from "express";
import { prismaClient } from "../../infra/database/prismaClient";

export class GetBINumberUseCase {

  async getBi(email: string, response: Response) {
    try {
      const client = await prismaClient.client_email.findFirst({where: {email_address: email}, select: {client_id: true}})
      const bi = await prismaClient.client.findFirst({where: {client_id: client?.client_id || 0}, select: {bi_number: true}})
      return response.status(201).json({success: true, biNumber: bi?.bi_number})
    }
    catch (error) {
      return response.status(400).json({success: false, biNumber: null})
    }
  }

  execute(request: Request, response: Response) {
    const email = request.params.email
    this.getBi(email, response)
  }
}
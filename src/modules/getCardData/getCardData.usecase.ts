import { Request, Response } from "express"
import { prismaClient } from "../../infra/database/prismaClient"

export class GetCardDataUseCase{

  async getData(biNumber: string, response: Response){
    try {
      const client = await prismaClient.client.findFirst({where: {bi_number: biNumber}, select: {client_id: true}})
      const account = await prismaClient.account.findFirst({where: {client_id: client?.client_id || 0}, select: {account_id: true}})
      const card = await prismaClient.card.findFirst({where: {account_id: account?.account_id || 0}, select: {number: true, pin: true, role_id: true, created_at: true, nickname: true}})
      response.status(200).json({card: {role: card?.role_id, createdAt: card?.created_at ,pin: card?.pin, nickname: card?.nickname, cardNumber: card?.number?.toString()}})
    }
    catch (error){
      console.log(error);
      return response.status(500).json("Ocorreu um erro ao processar a sua solicitação! Tente novamente mais tarde.")
    }
  }

  async execute(request: Request, response: Response) {
    const biNumber = request.params.biNumber
    await this.getData(biNumber, response)
  }
}
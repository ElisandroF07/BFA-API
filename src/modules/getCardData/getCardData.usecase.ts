import { Request, Response } from "express"
import { prismaClient } from "../../infra/database/prismaClient"

export class GetCardDataUseCase {

  async getData(biNumber: string, response: Response) {
    try {
      // Encontra o cliente com base no número do BI
      const client = await prismaClient.client.findFirst({ where: { bi_number: biNumber }, select: { client_id: true }, cacheStrategy: { ttl: 3600 } })
      // Encontra a conta associada ao cliente
      const account = await prismaClient.account.findFirst({ where: { client_id: client?.client_id || 0 }, select: { account_id: true }, cacheStrategy: { ttl: 3600 } })
      // Encontra o cartão associado à conta
      const card = await prismaClient.card.findFirst({ where: { account_id: account?.account_id || 0 }, select: { number: true, pin: true, role_id: true, created_at: true, nickname: true, state: true }, cacheStrategy: { ttl: 3600 } })
      // Retorna os dados do cartão encontrados
      response.status(200).json({ card: { role: card?.role_id, createdAt: card?.created_at, pin: card?.pin, nickname: card?.nickname, state: card?.state, cardNumber: card?.number?.toString() } })
    } catch (error) {
      // Retorna um erro caso ocorra algum problema durante o processo
      return response.status(500).json("Ocorreu um erro ao processar a sua solicitação! Tente novamente mais tarde.")
    }
  }

  async execute(request: Request, response: Response) {
    const biNumber = request.params.biNumber
    // Chama a função getData para obter os dados do cartão e retorna a resposta
    await this.getData(biNumber, response)
  }
}

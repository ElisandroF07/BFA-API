import { Request, Response } from "express";
import { prismaClient } from "../../infra/database/prismaClient";

export class SetCardNickname{

  async setNickname(response: Response, cardNumber: number, nickname: string){
    try {
      const card = await prismaClient.card.findFirst({where: {number: cardNumber}, select: {card_id: true}})
      if (card){
        await prismaClient.card.update({where: {card_id: card.card_id}, data: {nickname: nickname}})
        return response.status(201).json({message: "Alterações salvas com sucesso!"})
      }
      return response.status(200).json({message: "O seu pedido não pode ser processado! Tente novamente mais tarde."})
    }catch {
      return response.status(500).json({message: "O seu pedido não pode ser processado! Tente novamente mais tarde."})
    }
  }

  async execute(request: Request, response: Response){
    const cardNumber = parseInt(request.body.cardNumber)
    const nickname = request.body.nickname
    await this.setNickname(response, cardNumber, nickname)
  }
}
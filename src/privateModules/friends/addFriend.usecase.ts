import { Request, Response } from "express";
import { prismaClient } from "../../infra/database/prismaClient";

interface IData{
  email: string,
  nickname: string,
  biNumber: string
}

export class AddFriendUseCase{
  async addFriend(data: IData, response: Response) {
    try {
      const friend = await prismaClient.client_email.findFirst({where: {email_address: data.email}, select: {client_id: true}})
      const self = await prismaClient.client.findFirst({where: {bi_number: data.biNumber}, select: {client_id: true}})
      await prismaClient.friends.create({data: {
        client_id: self?.client_id,
        friend_id: friend?.client_id,
        nickname: data.nickname
      }})
      return response.status(201).json({success: true, message: "Amigo adicionado com sucesso!"})
    }
    catch {
      return response.status(400).json({success: false, message: "Não foi possível adicionar este amigo!"})
    }
  }

  execute(request: Request, response: Response) {
    const {email, biNumber, nickname} = request.body
    const data: IData = {
      email: email,
      nickname: nickname,
      biNumber: biNumber
    }
    this.addFriend(data, response)
  }
}
import { Request, Response } from "express";
import { prismaClient } from "../../infra/database/prismaClient";

interface IData{
  id: string
}

export class RemoveFriendUseCase{
  async removeFriend(data: IData, response: Response) {
    try {
     await prismaClient.friends.delete({where: {id: parseInt( data.id)}})
      return response.status(201).json({success: true, message: "Amigo removido com sucesso!"})
    }
    catch {
      return response.status(200).json({success: false, message: "Não foi possível remover este amigo!"})
    }
  }

  execute(request: Request, response: Response) {
    const {id} = request.params
    const data: IData = {
      id: id
    }
    this.removeFriend(data, response)
  }
}
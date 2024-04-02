import { Request, Response } from "express";
import { prismaClient } from "../../infra/database/prismaClient";

interface IData {
  tittle: string,
  email: string,
  type: number
}

export class CreateNotificationUseCase{
  async create(data: IData, response: Response) {
    try {
      await prismaClient.notifications.create({
        data: {
          tittle: data.tittle,
          email: data.email,
          type: data.type
        }
      })
      return response.status(201).json({success: true})
    }
    catch {
      return response.status(500).json({success: false})
    }
  }

  execute(request: Request, response: Response) {
    const {tittle, email, type} = request.body
    const data: IData = {
      tittle,
      email,
      type,
    }
    this.create(data, response)
  }
}
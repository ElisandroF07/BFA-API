import { Request, Response } from "express";
import { prismaClient } from "../../infra/database/prismaClient";

export class DeleteNotificationUseCase{
  async delete(id: number, response: Response) {
    try {
      await prismaClient.notifications.delete({
       where: {id}
      })
      return response.status(201).json({success: true})
    }
    catch {
      return response.status(500).json({success: false})
    }
  }

  execute(request: Request, response: Response) {
    const id = request.params.id
    this.delete(parseInt(id), response)
  }
}
import { Request, Response } from "express";
import { prismaClient } from "../../infra/database/prismaClient";

export class GetNotificationsUseCase {

  async getNotifications(email: string, response: Response) {
    try {
      const notifications = await prismaClient.notifications.findMany({where: {email}})
      if (notifications.length >= 1) {
        response.status(201).json({success: true, message: "", notifications: notifications})
      }
      else {
        response.status(200).json({success: false, message: "Nenhuma requisição encontrada!", notifications: null})
      }
    } catch {
      response.status(200).json({success: false, message: "", notifications: null})
    }
  }

  execute(request: Request, response: Response) {
    const email = request.params.email;
    this.getNotifications(email, response)
  }
}
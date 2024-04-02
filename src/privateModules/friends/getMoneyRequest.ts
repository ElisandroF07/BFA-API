import { Request, Response } from "express";
import { prismaClient } from "../../infra/database/prismaClient";

export class GetMoneyRequestUseCase{

  async get(email: string, response: Response) {
    const moneyRequest = await prismaClient.money_requests.findFirst({
      where: {emailTo: email},
      select: {
        id: true,
        balance: true,
        date: true,
        emailFrom: true,
        emailTo: true,
        status: true
      },
    });
    return response.status(200).json({success: true, request: moneyRequest});
  }

  execute(request: Request, response: Response) {
    const email = request.params.email
    this.get(email, response)
  }
}
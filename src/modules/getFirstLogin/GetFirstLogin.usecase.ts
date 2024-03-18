import { Request, Response } from "express";
import { prismaClient } from "../../infra/database/prismaClient";

export class GetFirstLoginUseCase {
  async getLogin(email: string, response: Response) {
    const client_email = await prismaClient.client_email.findFirst({ where: { email_address: email }, select: { client_id: true } })
    const client = await prismaClient.client.findFirst({ where: { client_id: client_email?.client_id || 0 }, select: { first_login: true } })
    if (client?.first_login) {
      return response.status(201).json(true);
    }
    return response.status(201).json(false);
  }

  async execute(request: Request, response: Response) {
    const email = request.params.email
    await this.getLogin(email, response);
  }
}

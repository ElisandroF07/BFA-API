import { Request, Response } from "express";
import { prismaClient } from "../../infra/database/prismaClient";

// Classe responsável por obter solicitações de dinheiro de um determinado e-mail
export class GetMoneyRequestUseCase{

  // Método assíncrono para obter uma solicitação de dinheiro pelo e-mail do destinatário
  async get(email: string, response: Response) {
    // Busca a primeira solicitação de dinheiro com o e-mail do destinatário fornecido
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
    // Retorna a solicitação de dinheiro encontrada
    return response.status(200).json({success: true, request: moneyRequest});
  }

  // Método para executar a obtenção de solicitações de dinheiro a partir de uma requisição HTTP
  execute(request: Request, response: Response) {
    const email = request.params.email
    this.get(email, response)
  }
}

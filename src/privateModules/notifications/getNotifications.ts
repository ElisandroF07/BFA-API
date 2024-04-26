import { Request, Response } from "express";
import { prismaClient } from "../../infra/database/prismaClient";

// Classe que representa o caso de uso para obter notificações de um usuário
export class GetNotificationsUseCase {

  // Método assíncrono para obter as notificações
  async getNotifications(email: string, response: Response) {
    try {
      // Obtém as notificações do banco de dados usando o Prisma
      const notifications = await prismaClient.notifications.findMany({ where: { email } });
      // Verifica se há notificações encontradas
      if (notifications.length >= 1) {
        // Retorna as notificações encontradas com sucesso
        response.status(201).json({ success: true, message: "", notifications: notifications });
      } else {
        // Retorna uma mensagem indicando que nenhuma notificação foi encontrada
        response.status(200).json({ success: false, message: "Nenhuma requisição encontrada!", notifications: null });
      }
    } catch {
      // Em caso de erro, retorna uma mensagem indicando o erro
      response.status(200).json({ success: false, message: "", notifications: null });
    }
  }

  // Método para executar a obtenção das notificações a partir de uma requisição HTTP
  execute(request: Request, response: Response) {
    // Extrai o e-mail do usuário da requisição
    const email = request.params.email;
    // Chama o método para obter as notificações
    this.getNotifications(email, response);
  }
}

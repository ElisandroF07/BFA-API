import { Request, Response } from "express";
import { prismaClient } from "../../infra/database/prismaClient";

// Classe que representa o caso de uso para excluir uma notificação
export class DeleteNotificationUseCase {
  
  // Método assíncrono para excluir a notificação
  async delete(id: number, response: Response) {
    try {
      // Exclui a notificação do banco de dados usando o Prisma
      await prismaClient.notifications.delete({
        where: { id }
      });
      // Retorna um status de sucesso ao cliente
      return response.status(201).json({ success: true });
    } catch {
      // Em caso de erro, retorna um status de erro interno do servidor
      return response.status(500).json({ success: false });
    }
  }

  // Método para executar a exclusão da notificação a partir de uma requisição HTTP
  execute(request: Request, response: Response) {
    // Extrai o ID da notificação da requisição
    const id = request.params.id;
    // Chama o método para excluir a notificação
    this.delete(parseInt(id), response);
  }
}

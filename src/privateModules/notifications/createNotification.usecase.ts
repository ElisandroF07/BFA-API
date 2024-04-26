import { Request, Response } from "express";
import { prismaClient } from "../../infra/database/prismaClient";

// Interface que define a estrutura dos dados necessários para criar uma notificação
interface IData {
  tittle: string,
  email: string,
  type: number
}

// Classe que representa o caso de uso para criar uma notificação
export class CreateNotificationUseCase {
  
  // Método assíncrono para criar a notificação
  async create(data: IData, response: Response) {
    try {
      // Cria uma nova notificação no banco de dados usando o Prisma
      await prismaClient.notifications.create({
        data: {
          tittle: data.tittle,
          email: data.email,
          type: data.type
        }
      });
      // Retorna um status de sucesso ao cliente
      return response.status(201).json({ success: true });
    } catch {
      // Em caso de erro, retorna um status de erro interno do servidor
      return response.status(500).json({ success: false });
    }
  }

  // Método para executar a criação da notificação a partir de uma requisição HTTP
  execute(request: Request, response: Response) {
    // Extrai os dados da requisição
    const { tittle, email, type } = request.body;
    // Cria um objeto com os dados da notificação
    const data: IData = {
      tittle,
      email,
      type,
    };
    // Chama o método para criar a notificação
    this.create(data, response);
  }
}

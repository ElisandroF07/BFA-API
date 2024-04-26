import { Request, Response } from "express";
import { prismaClient } from "../../infra/database/prismaClient";

// Interface para os dados necessários para remover um amigo
interface IData {
  id: string; // ID do amigo a ser removido
}

// Classe responsável por lidar com a remoção de amigos
export class RemoveFriendUseCase {
  // Método assíncrono para remover um amigo
  async removeFriend(data: IData, response: Response) {
    try {
      // Remove o amigo com o ID fornecido
      await prismaClient.friends.delete({ where: { id: parseInt(data.id) } });
      return response.status(201).json({ success: true, message: "Amigo removido com sucesso!" });
    } catch {
      // Se ocorrer um erro, retorna uma mensagem de erro
      return response.status(200).json({ success: false, message: "Não foi possível remover este amigo!" });
    }
  }

  // Método para executar a remoção de um amigo a partir de uma requisição HTTP
  execute(request: Request, response: Response) {
    const { id } = request.params;
    const data: IData = {
      id: id
    }
    this.removeFriend(data, response);
  }
}

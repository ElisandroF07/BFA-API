import { Request, Response } from "express";
import { prismaClient } from "../../infra/database/prismaClient";

// Definição da estrutura dos dados esperados na requisição
interface IData {
  email: string,       // E-mail do amigo a ser adicionado
  nickname: string,    // Apelido do amigo
  biNumber: string     // Número de identificação biométrica do usuário
}

export class AddFriendUseCase {
  // Método assíncrono para adicionar um amigo
  async addFriend(data: IData, response: Response) {
    try {
      // Busca o cliente associado ao e-mail do amigo
      const friend = await prismaClient.client_email.findFirst({ where: { email_address: data.email }, select: { client_id: true }, cacheStrategy: { ttl: 1 } })
      // Busca o cliente associado ao número de identificação biométrica do usuário
      const self = await prismaClient.client.findFirst({ where: { bi_number: data.biNumber }, select: { client_id: true } })
      // Cria uma relação de amizade entre o usuário e o amigo
      await prismaClient.friends.create({ data: { client_id: self?.client_id, friend_id: friend?.client_id, nickname: data.nickname } })
      // Retorna uma resposta de sucesso
      return response.status(201).json({ success: true, message: "Amigo adicionado com sucesso!" })
    } catch {
      // Retorna uma resposta de erro caso não seja possível adicionar o amigo
      return response.status(400).json({ success: false, message: "Não foi possível adicionar este amigo!" })
    }
  }

  // Método para executar a adição de um amigo a partir de uma requisição HTTP
  execute(request: Request, response: Response) {
    // Extrai os dados da requisição
    const { email, biNumber, nickname } = request.body
    // Cria um objeto com os dados necessários para adicionar o amigo
    const data: IData = {
      email: email,
      nickname: nickname,
      biNumber: biNumber
    }
    // Chama o método para adicionar o amigo
    this.addFriend(data, response)
  }
}

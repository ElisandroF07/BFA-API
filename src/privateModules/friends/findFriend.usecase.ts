import { Request, Response } from "express";
import { prismaClient } from "../../infra/database/prismaClient";

// Definição da estrutura dos dados esperados na requisição
interface IData {
  email: string,       // E-mail do amigo a ser encontrado
  biNumber: string     // Número de identificação biométrica do usuário
}

export class FindFriendUseCase {
  // Método assíncrono para encontrar um amigo
  async findFriend(data: IData, response: Response) {
    // Busca o cliente associado ao e-mail informado
    const email = await prismaClient.client_email.findFirst({ where: { email_address: data.email }, select: { client_id: true }, cacheStrategy: { ttl: 1 } })
    // Busca o cliente associado ao número de identificação biométrica do usuário
    const self = await prismaClient.client.findFirst({ where: { bi_number: data.biNumber }, select: { client_id: true } })

    // Verifica se o e-mail foi encontrado
    if (email) {
      // Verifica se o amigo já foi adicionado
      const friend = await prismaClient.friends.findFirst({ where: { client_id: self?.client_id, friend_id: email.client_id } })
      if (friend) {
        return response.status(200).json({ success: false, client: null, message: "Amigo já adicionado!" })
      }
      // Verifica se o usuário está tentando adicionar seu próprio e-mail
      if (self?.client_id === email.client_id) {
        return response.status(200).json({ success: false, client: null, message: "Você não pode adicionar seu próprio e-mail!" })
      }
      // Busca a foto de perfil do amigo
      const pictureProfile = await prismaClient.client_images.findFirst({ where: { client_id: email.client_id || 0, image_role: 5 }, select: { path: true } })
      // Busca os dados pessoais do amigo
      const client = await prismaClient.client.findFirst({ where: { client_id: email.client_id || 0 }, select: { personal_data: true } })
      // Retorna os dados do amigo encontrado
      return response.status(201).json({ success: true, client: { personalData: client?.personal_data, image: pictureProfile?.path }, message: "Amigo encontrado!" })
    }

    // Retorna uma mensagem de erro caso o e-mail não seja encontrado
    return response.status(200).json({ success: false, client: null, message: "Cliente BFA Net não encontrado! Verifique o e-mail." })
  }

  // Método para executar a busca de um amigo a partir de uma requisição HTTP
  execute(request: Request, response: Response) {
    // Extrai os dados da requisição
    const { email, biNumber } = request.params
    // Cria um objeto com os dados necessários para encontrar o amigo
    const data: IData = {
      email: email,
      biNumber: biNumber
    }
    // Chama o método para encontrar o amigo
    this.findFriend(data, response)
  }
}

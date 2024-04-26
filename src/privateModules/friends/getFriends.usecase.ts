import { Request, Response } from "express";
import { prismaClient } from "../../infra/database/prismaClient";
import { Prisma } from "@prisma/client";
import axios from "axios";

// Interface que define a estrutura de um amigo
interface IFriend {
  personalData: Prisma.JsonValue | undefined; // Dados pessoais do amigo
  image: string | null | undefined; // URL da imagem de perfil do amigo
  friendId: number; // ID do amigo
  nickname: string | null | undefined; // Apelido do amigo
  email: string | undefined; // E-mail do amigo
}

export class GetFriendsUseCase {
  // Método assíncrono para obter os amigos de um cliente
  async getFriends(biNumber: string, response: Response) {
    try {
      const friends: IFriend[] = []; // Array para armazenar os amigos
      const self = await prismaClient.client.findFirst({ where: { bi_number: biNumber }, select: { client_id: true } });

      if (!self) {
        return response.status(404).json({ success: false, message: "Client not found" });
      }

      // Busca a lista de amigos do cliente
      const friendList = await prismaClient.friends.findMany({ where: { client_id: self.client_id }, select: { friend_id: true, id: true, nickname: true } });

      for (const friend of friendList) {
        // Busca os dados do amigo
        const client = await prismaClient.client.findFirst({ where: { client_id: friend.friend_id || 0 }, select: { personal_data: true, bi_number: true } });
        // Busca a imagem de perfil do amigo
        const pictureProfile = await axios.get(`${process.env.BASE_URL}/getProfilePicture/${client?.bi_number}`)
        const image = pictureProfile.data.imageUrl
        // Busca o e-mail do amigo
        const email = await prismaClient.client_email.findFirst({ where: { client_id: friend.friend_id }, select: { email_address: true } })
        // Cria um objeto com os dados do amigo e adiciona ao array de amigos
        const newFriend: IFriend = { personalData: client?.personal_data, image: image, friendId: friend.id, nickname: friend.nickname, email: email?.email_address };
        friends.push(newFriend);
      }

      // Retorna a lista de amigos encontrados
      return response.status(200).json({ success: true, friends, message: "" });
    } catch (error) {
      console.error("Error fetching friends:", error);
      return response.status(500).json({ success: false, message: "Internal server error" });
    }
  }

  // Método para executar a obtenção de amigos a partir de uma requisição HTTP
  async execute(request: Request, response: Response) {
    const biNumber = request.params.biNumber;
    await this.getFriends(biNumber, response);
  }
}

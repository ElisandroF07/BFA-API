import { Request, Response } from "express";
import { prismaClient } from "../../infra/database/prismaClient";

interface IData{
  email: string,
  biNumber: string
}

export class FindFriendUseCase{
  async findFriend(data: IData, response: Response) {
    const email = await prismaClient.client_email.findFirst({where: {email_address: data.email}, select: {client_id: true}})
    const self = await prismaClient.client.findFirst({where: {bi_number: data.biNumber}, select: {client_id: true}})
    if (email) {
      const friend = await prismaClient.friends.findFirst({where: {client_id: self?.client_id, friend_id: email.client_id}})
      if (friend) {
        return response.status(200).json({success: false, client: null, message: "Amigo já adicionado!"})
      }
      if (self?.client_id === email.client_id) {
        return response.status(200).json({success: false, client: null, message: "Você não pode adicionar seu próprio email!"})
      }
      const pictureProfile = await prismaClient.client_images.findFirst({where: {client_id: email.client_id || 0, image_role: 5}, select: {path: true}})
      const client = await prismaClient.client.findFirst({where: {client_id: email.client_id||0}, select: {personal_data: true}})
      return response.status(201).json({success: true, client: {personalData: client?.personal_data, image: pictureProfile?.path}, message: "Amigo encontrado!"})
    }
    return response.status(200).json({success: false, client: null, message: "Cliente BFA Net não encontrado! Verifique o email."})
  }

  execute(request: Request, response: Response) {
    const {email, biNumber} = request.params
    const data: IData = {
      email: email,
      biNumber: biNumber
    }
    this.findFriend(data, response)
  }
}
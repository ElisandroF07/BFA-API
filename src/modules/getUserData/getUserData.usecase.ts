import { Request, Response } from "express"
import { prismaClient } from "../../infra/database/prismaClient"

export class GetUserDataUseCase{

  async getUser(biNumber: string, response: Response){
    try {
      const client = await prismaClient.client.findFirst({where: {bi_number: biNumber}, select: {personal_data: true, client_id: true, address: true, bi_number: true}})
      const email = await prismaClient.client_email.findFirst({where: {client_id: client?.client_id || 0}, select: {email_address: true}})
      const pictureProfile = await prismaClient.client_images.findFirst({where: {client_id: client?.client_id || 0, image_role: 5}, select: {path: true}})
      response.status(200).json({client: {personalData: client?.personal_data, address: client?.address, biNumber: client?.bi_number, email: email?.email_address, pictureProfilePath: pictureProfile?.path}})
    }
    catch{
      return response.status(500).json("Ocorreu um erro ao processar a sua solicitação! Tente novamente mais tarde.")
    }
  }

  async execute(request: Request, response: Response) {
    const biNumber = request.params.biNumber
    await this.getUser(biNumber, response)
  }
}
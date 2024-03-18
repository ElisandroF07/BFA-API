import { Request, Response } from "express"
import { prismaClient } from "../../infra/database/prismaClient"
import axios from "axios"

export class GetProfilePictureUseCase{
  async getPicture(biNumber: string, response: Response){
    try {
      const client = await prismaClient.client.findFirst({where: {bi_number: biNumber}, select: {client_id: true}})
      const pictureProfile = await prismaClient.client_images.findFirst({where: {client_id: client?.client_id || 0, image_role: 5}, select: {path: true}})
      const token = await axios.get("http://localhost:5000/getAuthToken")
      response.status(200).json({imageUrl: `${pictureProfile?.path}?Authorization=${token.data}`})
    }
    catch{
      return response.status(500).json("Ocorreu um erro ao processar a sua solicitação! Tente novamente mais tarde.")
    }
  }

  async execute(request: Request, response: Response) {
    const biNumber = request.params.biNumber
    await this.getPicture(biNumber, response)
  }
}
import { Request, Response } from "express"
import { prismaClient } from "../../infra/database/prismaClient"
import axios from "axios"

export class GetProfilePictureUseCase {
  async getPicture(biNumber: string, response: Response) {
    try {
      // Encontra o cliente com base no número do BI
      const client = await prismaClient.client.findFirst({ where: { bi_number: biNumber }, select: { client_id: true } })
      // Encontra a imagem de perfil do cliente
      const pictureProfile = await prismaClient.client_images.findFirst({ where: { client_id: client?.client_id || 0, image_role: 5 }, select: { path: true } })
      // Obtém o token de autorização do servidor de autenticação
      const token = await axios.get("http://localhost:5000/getAuthToken")
      // Retorna a URL da imagem de perfil com o token de autorização como parâmetro
      response.status(200).json({ imageUrl: `${pictureProfile?.path}?Authorization=${token.data}` })
    } catch {
      // Retorna um erro caso ocorra algum problema durante o processo
      return response.status(500).json("Ocorreu um erro ao processar a sua solicitação! Tente novamente mais tarde.")
    }
  }

  async execute(request: Request, response: Response) {
    const biNumber = request.params.biNumber
    // Chama a função getPicture para obter a imagem de perfil e retorna a resposta
    await this.getPicture(biNumber, response)
  }
}
